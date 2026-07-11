import { quarters } from '../src/content/quarters';
import {
  lessons,
  quizzes,
  decisions,
  bridgeActions,
  futureWhispers,
  visualizations,
  scenarios,
  opportunityCards,
  riskCards,
  quarterIntroductions,
  quarterConclusions,
  bossBattles,
  quarterProjects,
} from '../src/content/library';
import { sources } from '../src/content/sources';
import { allDates, quarterForDate } from '../src/engine/dateEngine';
import { generateChapter } from '../src/engine/chapterGenerator';
const errors: string[] = [];
const requireCount = (name: string, n: number, min: number) => {
  if (n < min) errors.push(`${name}: ${n} < ${min}`);
};
requireCount('quarters', quarters.length, 15);
requireCount('lessons', lessons.length, 60);
requireCount('quizzes', quizzes.length, 150);
requireCount('decisions', decisions.length, 120);
requireCount('bridge actions', bridgeActions.length, 180);
requireCount('future whispers', futureWhispers.length, 90);
requireCount('visualizations', visualizations.length, 60);
requireCount('wealth scenarios', scenarios.wealth.length, 30);
requireCount('leadership scenarios', scenarios.leadership.length, 30);
requireCount('research scenarios', scenarios.research.length, 30);
requireCount('opportunity cards', opportunityCards.length, 60);
requireCount('risk cards', riskCards.length, 60);
requireCount('quarter introductions', quarterIntroductions.length, 15);
requireCount('quarter conclusions', quarterConclusions.length, 15);
requireCount('boss battles', bossBattles.length, 15);
requireCount('quarter projects', quarterProjects.length, 15);
const sourceIds = new Set(sources.map((s) => s.id));
for (const l of lessons)
  for (const id of l.sourceIds)
    if (!sourceIds.has(id)) errors.push(`lesson ${l.id}: bad source ${id}`);
for (const q of quizzes) {
  if (q.answer < 0 || q.answer >= q.choices.length)
    errors.push(`${q.id}: invalid answer`);
  if (q.sourceId && !sourceIds.has(q.sourceId))
    errors.push(`${q.id}: bad source`);
}
const dates = allDates();
if (dates.length !== 1878)
  errors.push(`date coverage: expected 1878, got ${dates.length}`);
for (const d of dates) {
  const q = quarterForDate(d);
  if (d > '2026-08-31' && !q) errors.push(`unmapped ${d}`);
  const a = generateChapter(d),
    b = generateChapter(d);
  if (JSON.stringify(a) !== JSON.stringify(b))
    errors.push(`non-deterministic ${d}`);
}
const generated = dates.map((d) => generateChapter(d));
for (let i = 0; i < generated.length; i++) {
  const titleWindow = generated.slice(Math.max(0, i - 29), i);
  if (titleWindow.some((c) => c.title === generated[i].title))
    errors.push(`duplicate title within 30 days: ${generated[i].date}`);
  const narrativeWindow = generated.slice(Math.max(0, i - 89), i);
  if (narrativeWindow.some((c) => c.scene === generated[i].scene))
    errors.push(`duplicate narrative within 90 days: ${generated[i].date}`);
}
for (let i = 0; i < quarters.length - 1; i++) {
  const a = new Date(quarters[i].end + 'T12:00:00Z'),
    b = new Date(quarters[i + 1].start + 'T12:00:00Z');
  if (b.getTime() - a.getTime() !== 86400000)
    errors.push(`quarter boundary ${i + 1}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(
  `Content valid: ${dates.length} days, ${quarters.length} quarters, ${lessons.length} lessons, ${quizzes.length} quizzes, ${decisions.length} decisions, ${sources.length} official sources.`,
);
