import { beforeEach, describe, expect, it } from 'vitest';
import { allDates, countdown, quarterForDate } from '../engine/dateEngine';
import { quarters } from '../content/quarters';
import { generateChapter } from '../engine/chapterGenerator';
import {
  allocationTotal,
  businessEquity,
  capTable,
  runway,
} from '../engine/calculators';
import { applyRewards, levelForXp } from '../engine/scoringEngine';
import { initialState, migrate, resetSection, validateImport } from '../state';

describe('date engine', () => {
  it('maps preseason and every quarter boundary', () => {
    expect(quarterForDate('2026-07-11')).toBeNull();
    expect(quarterForDate('2026-08-31')).toBeNull();
    for (const q of quarters) {
      expect(quarterForDate(q.start)?.id).toBe(q.id);
      expect(quarterForDate(q.end)?.id).toBe(q.id);
    }
  });
  it('has complete unique coverage', () => {
    const ds = allDates();
    expect(ds).toHaveLength(1878);
    expect(new Set(ds).size).toBe(ds.length);
    expect(ds[0]).toBe('2026-07-11');
    expect(ds.at(-1)).toBe('2031-08-31');
  });
  it('counts down and handles passed dates', () => {
    expect(countdown('2031-07-14', new Date('2031-07-13T09:00:00')).days).toBe(
      1,
    );
    expect(countdown('2020-01-01').passed).toBe(true);
  });
});
describe('chapter engine', () => {
  it('is deterministic and complete', () => {
    const a = generateChapter('2027-02-14', 'Lawrence', 'Hybrid');
    expect(a).toEqual(generateChapter('2027-02-14', 'Lawrence', 'Hybrid'));
    expect(a.decision.choices.length).toBeGreaterThanOrEqual(2);
    expect(a.quiz.explanation).toBeTruthy();
  });
});
describe('calculations and consequences', () => {
  it('calculates allocations and equity', () => {
    expect(allocationTotal([0.5, 5, 10, 4.5])).toBe(20);
    expect(businessEquity(100, 40, 20, 25).estimatedNet).toBe(24);
  });
  it('calculates cap table and runway', () => {
    expect(capTable([{ name: 'A', shares: 100 }], 100)[0].percent).toBe(50);
    expect(runway(500, 50, 100)).toBe(10);
    expect(runway(500, 100, 100)).toBe(Infinity);
  });
  it('applies rewards without mutating and calculates levels', () => {
    const next = applyRewards(initialState.stats, {
      execution: 3,
      revenue: -2,
    });
    expect(next.execution).toBe(3);
    expect(next.revenue).toBe(0);
    expect(initialState.stats.execution).toBe(0);
    expect(levelForXp(500)).toBe(3);
  });
});
describe('persistence schema', () => {
  beforeEach(() => localStorage.clear());
  it('migrates older compatible state', () => {
    expect(migrate({ ...initialState, version: 1 }).version).toBe(2);
  });
  it('rejects malformed imports', () => {
    expect(() => validateImport('{"bad":true}')).toThrow();
  });
  it('round-trips export JSON', () => {
    expect(
      validateImport(JSON.stringify(initialState)).profile.displayName,
    ).toBe('Lawrence');
  });
  it('resets only the selected section', () => {
    const reset = resetSection(
      { ...initialState, journal: { x: 'private' }, xp: 50 },
      'journal',
    );
    expect(reset.journal).toEqual({});
    expect(reset.xp).toBe(50);
  });
});
