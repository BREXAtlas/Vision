import { z } from 'zod';
import type { AppState, Project, Stat } from './types';
const projectNames = [
  'Doctoral Program',
  'Financial and Digital Literacy Course',
  'BREXAtlas',
  'AskAtlas or AskAtlasX',
  'Atlas Discovery Layer',
  'Atlas Notebook',
  'TOS',
  'Business and Revenue',
  'Leadership and Speaking',
  'Family',
  'Health',
  'Martial Arts',
  'Photography',
  'Philanthropy',
];
export const defaultProjects: Project[] = projectNames.map((name, i) => ({
  id: `project-${i + 1}`,
  name,
  description:
    name === 'TOS'
      ? 'User-defined project label; meaning intentionally not assumed.'
      : `A focused ${name} workstream.`,
  vision: `Create responsible, measurable progress in ${name}.`,
  stage: i < 3 ? 'Active' : 'Planned',
  nextMilestone: 'Define one observable result',
  deadline: `202${7 + Math.floor(i / 5)}-12-31`,
  dependencies: 'Protected time',
  risks: 'Scope creep',
  weeklyCommitment: i < 4 ? 3 : 1,
  evidence: '',
  notes: '',
  quarterId: (i % 15) + 1,
  history: [],
}));
const statKeys: Stat[] = [
  'vision',
  'knowledge',
  'execution',
  'revenue',
  'research',
  'leadership',
  'wellbeing',
  'legacy',
];
export const initialState: AppState = {
  version: 2,
  profile: {
    displayName: 'Lawrence',
    futureName: 'Dr. Lawrence Joseph McGaffie II',
    visionDate: '2031-07-14',
    location: 'Houston, Texas',
    timezone: 'America/Chicago',
    tosMeaning: '',
    fundingPath: 'Hybrid',
    instructorMode: false,
    reducedMotion: false,
    largeText: false,
    familyLabel: 'family',
  },
  onboarded: false,
  prologueComplete: false,
  rewindCount: 0,
  xp: 0,
  stats: Object.fromEntries(statKeys.map((k) => [k, 0])) as Record<
    Stat,
    number
  >,
  completedDates: [],
  choices: {},
  quizResults: {},
  journal: {},
  gratitude: {},
  bridgeActions: {},
  visualizationHistory: [],
  projects: defaultProjects,
  courseNotes: {},
  customQuestions: [],
  legacyLaws: [],
  mode: 'today',
};
const schema = z
  .object({
    version: z.number(),
    profile: z.object({
      displayName: z.string(),
      futureName: z.string(),
      visionDate: z.string(),
      location: z.string(),
      timezone: z.string(),
      tosMeaning: z.string(),
      fundingPath: z.enum([
        'Bootstrapped',
        'Venture-backed',
        'Hybrid',
        'Grant and partnership led',
      ]),
      instructorMode: z.boolean(),
      reducedMotion: z.boolean(),
      largeText: z.boolean(),
      familyLabel: z.string(),
    }),
  })
  .passthrough();
export function migrate(raw: unknown): AppState {
  const parsed = schema.parse(raw);
  return {
    ...initialState,
    ...parsed,
    version: 2,
    profile: { ...initialState.profile, ...parsed.profile },
  } as AppState;
}
export function loadState() {
  try {
    const raw = localStorage.getItem('vision2031-state');
    return raw ? migrate(JSON.parse(raw)) : initialState;
  } catch {
    return initialState;
  }
}
export const saveState = (s: AppState) =>
  localStorage.setItem('vision2031-state', JSON.stringify(s));
export function validateImport(text: string) {
  return migrate(JSON.parse(text));
}
export function resetSection(
  state: AppState,
  section: 'journal' | 'progress' | 'projects',
): AppState {
  if (section === 'journal')
    return { ...state, journal: {}, gratitude: {}, bridgeActions: {} };
  if (section === 'projects') return { ...state, projects: defaultProjects };
  return {
    ...state,
    completedDates: [],
    choices: {},
    quizResults: {},
    xp: 0,
    stats: initialState.stats,
    legacyLaws: [],
  };
}
