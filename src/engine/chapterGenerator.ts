import type { DailyChapter } from '../types';
import { quarterForDate, parseDate } from './dateEngine';
import {
  bridgeActions,
  decisions,
  futureWhispers,
  legacyLaws,
  quizzes,
  visualizations,
} from '../content/library';
const rhythms = [
  'Gratitude and review',
  'Vision and strategy',
  'Financial and digital literacy',
  'Product, coding, and research',
  'Sales, influence, and leadership',
  'Ownership, governance, and capital',
  'Family, health, and recovery',
];
function hash(s: string) {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function generateChapter(
  date: string,
  name = 'Lawrence',
  path = 'Hybrid',
): DailyChapter {
  const seed = hash(`${date}|${name}|${path}`),
    q = quarterForDate(date),
    qid = q?.id ?? 1,
    day = parseDate(date).getUTCDay(),
    rhythm = rhythms[day],
    index = seed % 120,
    quiz = quizzes.filter((x) => x.quarterId === qid)[seed % 10],
    milestone =
      q && (date === q.start || date === q.end || date === '2031-07-14');
  return {
    id: `chapter-${date}`,
    date,
    quarterId: q?.id ?? null,
    title: milestone
      ? `${date === q?.start ? 'Opening' : 'Milestone'}: ${q?.title}`
      : `${rhythm}: ${['The Quiet Proof', 'One Clear Move', 'Systems in Motion', 'Evidence Before Noon', 'A Steward’s Choice', 'The Freedom Practice'][seed % 6]} ${parseDate(date).getUTCDate()}`,
    scene: milestone
      ? `On ${date}, I entered a fully authored ${q?.title} threshold. I reviewed the people, evidence, and risks beneath ${q?.artifact}; the future identity could inspire me, but only today’s accountable work could support it.`
      : `On ${date}, I opened the day as ${name}, not by carrying the entire future, but by noticing the next honest decision. During this ${q?.title ?? 'Preseason'} chapter, ${rhythm.toLowerCase()} became practice ${seed % 997}: I named the assumption, protected the people involved, and created evidence that tomorrow could use.`,
    futureWhisper: futureWhispers[seed % 90],
    lesson: `Today’s lesson connects ${rhythm.toLowerCase()} to ${q?.lessons[seed % 3] ?? 'a personal baseline'}. The vision is aspirational; the practice is measurable.`,
    wealthyConduct: legacyLaws[seed % 12],
    decision: decisions[index],
    quiz,
    journalPrompt: `What evidence would make today’s ${rhythm.toLowerCase()} decision wiser?`,
    gratitudePrompt:
      'Name one person, capability, or ordinary moment that already supports this journey.',
    identity: `I build ${q?.artifact ?? 'my foundation'} through ethical, repeatable action.`,
    minimumAction: bridgeActions[seed % 180],
    deepAction: `Spend 30–60 minutes creating a usable draft for ${q?.artifact ?? 'your baseline'}, then record the evidence.`,
    visualization: visualizations[seed % 60],
    xp: 20 + (seed % 11),
  };
}
