import type { QuizQuestion } from '../types';
import { sources } from './sources';
export const legacyLaws = [
  'Vision becomes a calendar.',
  'Ownership is not the same as appearance.',
  'Cash flow comes before luxury.',
  'Evidence comes before scale.',
  'Systems purchase freedom.',
  'Valuation is not liquidity.',
  'Diligence comes before leverage.',
  'A team must exist before an empire can.',
  'Health and family are core assets.',
  'Stewardship matters more than status.',
  'Generosity requires governance.',
  'Luxuries should be supported by productive assets, not purchased to prove identity.',
  'The future is not found. It is practiced.',
];
const lessonTopics = [
  'cash flow',
  'liquidity',
  'customer discovery',
  'digital security',
  'research ethics',
  'opportunity cost',
  'unit economics',
  'data provenance',
  'delegation',
  'governance',
  'capital allocation',
  'sustainable wealth',
  'evidence quality',
  'family stewardship',
  'time leverage',
];
export const lessons = Array.from({ length: 60 }, (_, i) => ({
  id: `lesson-${i + 1}`,
  quarterId: (i % 15) + 1,
  title: `${['Foundations', 'Practice', 'Systems', 'Stewardship'][i % 4]}: ${lessonTopics[i % lessonTopics.length]}`,
  summary: `Learn how ${lessonTopics[i % lessonTopics.length]} supports responsible action, then record one piece of evidence.`,
  sourceIds: [sources[Math.floor(i / 4)]?.id ?? sources[0].id],
  minutes: 12,
}));
export const quizzes: QuizQuestion[] = Array.from({ length: 150 }, (_, i) => {
  const q = (i % 15) + 1;
  const topic = lessonTopics[i % lessonTopics.length];
  return {
    id: `quiz-${i + 1}`,
    quarterId: q,
    prompt: `Which response best demonstrates disciplined ${topic}?`,
    choices: [
      'Make a reversible decision using evidence and document assumptions',
      'Choose the most impressive-looking option',
      'Treat an estimate as a guarantee',
      'Delay all learning until conditions are perfect',
    ],
    answer: 0,
    explanation: `Evidence, explicit assumptions, and reversible action support disciplined ${topic}; appearance and certainty claims do not.`,
    sourceId: sources[i % sources.length].id,
  };
});
const actions = [
  'audit one account',
  'schedule one protected focus block',
  'write one customer question',
  'enable MFA on one account',
  'document one assumption',
  'send one respectful follow-up',
  'name the next milestone',
  'review one risk',
  'thank one collaborator',
  'update one evidence note',
  'simplify one commitment',
  'read one official source',
];
export const bridgeActions = Array.from(
  { length: 180 },
  (_, i) => `${actions[i % actions.length]} and capture what changed`,
);
export const futureWhispers = Array.from(
  { length: 90 },
  (_, i) =>
    `Future echo ${i + 1}: ${['the calendar protected what mattered', 'the team trusted the system', 'liquidity created patient choices', 'evidence made the claim credible', 'family presence defined the win'][i % 5]}.`,
);
export const visualizations = Array.from(
  { length: 60 },
  (_, i) =>
    `Picture scene ${i + 1}: you enter a calm ${['boardroom', 'research lab', 'family breakfast', 'keynote hall', 'strategy studio'][i % 5]}, notice the light and sound, and choose the next responsible action.`,
);
export const decisions = Array.from({ length: 120 }, (_, i) => ({
  id: `decision-${i + 1}`,
  prompt: `Opportunity ${i + 1}: capacity is limited. What earns attention now?`,
  choices: [
    {
      label: 'Run a small evidence test',
      tradeoff: 'Slower optics; stronger learning.',
      rewards: { knowledge: 2, execution: 1 },
    },
    {
      label: 'Protect the current priority',
      tradeoff: 'Declines novelty; preserves delivery.',
      rewards: { execution: 2, wellbeing: 1 },
    },
    {
      label: 'Delegate with a clear scorecard',
      tradeoff: 'Requires coaching and trust.',
      rewards: { leadership: 2, legacy: 1 },
    },
  ],
}));
export const scenarios = {
  wealth: Array.from(
    { length: 30 },
    (_, i) =>
      `Wealth conduct ${i + 1}: distinguish accessible cash from paper value.`,
  ),
  leadership: Array.from(
    { length: 30 },
    (_, i) =>
      `Leadership scenario ${i + 1}: clarify the decision right and invite dissent.`,
  ),
  research: Array.from(
    { length: 30 },
    (_, i) =>
      `Research scenario ${i + 1}: label the claim as hypothesis, preliminary, or established.`,
  ),
};
export const opportunityCards = Array.from({ length: 60 }, (_, i) => ({
  id: `opportunity-${i + 1}`,
  title: [
    'Enterprise pilot',
    'University partnership',
    'Research collaboration',
    'Grant invitation',
    'Speaking request',
    'Advisor introduction',
    'Investor meeting',
    'Licensing request',
    'Foundation partnership',
    'New hire',
  ][i % 10],
  probability: 55 + (i % 4) * 10,
  preparation: `Create evidence packet ${i + 1} and verify capacity before accepting.`,
  tradeoff: 'Opportunity consumes time and may displace the current priority.',
}));
export const riskCards = Array.from({ length: 60 }, (_, i) => ({
  id: `risk-${i + 1}`,
  title: [
    'Scope creep',
    'Burnout',
    'Cash shortage',
    'Security incident',
    'Weak evidence',
    'Overclaiming',
    'Dilution',
    'Data-rights issue',
    'Family neglect',
    'Lifestyle inflation',
  ][i % 10],
  probability: 20 + (i % 5) * 10,
  mitigation: `Mitigation ${i + 1}: reduce exposure, assign an owner, and define an early warning.`,
  tradeoff: 'Prevention costs capacity now but protects future options.',
}));
export const quarterIntroductions = Array.from(
  { length: 15 },
  (_, i) =>
    `Quarter ${i + 1} opens with a specific tension between the future identity and today’s evidence.`,
);
export const quarterConclusions = Array.from(
  { length: 15 },
  (_, i) =>
    `Quarter ${i + 1} closes by reviewing evidence, relationships, risk, and the next season’s constraint.`,
);
export const bossBattles = Array.from({ length: 15 }, (_, i) => ({
  id: `boss-${i + 1}`,
  stages: [
    'Recognize the pattern',
    'Choose the principle',
    'Create counter-evidence',
  ],
  reward: 100 + i * 10,
}));
export const quarterProjects = Array.from({ length: 15 }, (_, i) => ({
  id: `quarter-project-${i + 1}`,
  rubric: [
    'Specific outcome',
    'Usable evidence',
    'Ethical review',
    'Next owner',
  ],
}));
