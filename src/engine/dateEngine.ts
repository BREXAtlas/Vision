import { quarters } from '../content/quarters';
export const START = '2026-07-11',
  PRESEASON_END = '2026-08-31',
  END = '2031-08-31';
export const parseDate = (s: string) => new Date(`${s}T12:00:00Z`);
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
export function quarterForDate(date: string) {
  if (date >= START && date <= PRESEASON_END) return null;
  return quarters.find((q) => date >= q.start && date <= q.end) ?? undefined;
}
export function daysBetween(a: string, b: string) {
  return Math.ceil(
    (parseDate(b).getTime() - parseDate(a).getTime()) / 86400000,
  );
}
export function allDates() {
  const out: string[] = [];
  for (
    let d = parseDate(START);
    d <= parseDate(END);
    d = new Date(d.getTime() + 86400000)
  )
    out.push(isoDate(d));
  return out;
}
export function countdown(target: string, now = new Date()) {
  const end = new Date(`${target}T09:00:00`);
  const ms = Math.max(0, end.getTime() - now.getTime());
  return {
    passed: ms === 0,
    days: Math.floor(ms / 86400000),
    hours: Math.floor(ms / 3600000) % 24,
    minutes: Math.floor(ms / 60000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}
