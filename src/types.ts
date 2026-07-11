export type Stat =
  | 'vision'
  | 'knowledge'
  | 'execution'
  | 'revenue'
  | 'research'
  | 'leadership'
  | 'wellbeing'
  | 'legacy';
export interface Quarter {
  id: number;
  season: string;
  title: string;
  start: string;
  end: string;
  story: string;
  goals: string[];
  lessons: string[];
  milestones: string[];
  boss: string;
  artifact: string;
  echo: string;
}
export interface Source {
  id: string;
  title: string;
  organization: string;
  category: string;
  url: string;
  reviewed: string;
  lessonIds: string[];
}
export interface QuizQuestion {
  id: string;
  quarterId: number;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
  sourceId?: string;
}
export interface DailyChapter {
  id: string;
  date: string;
  quarterId: number | null;
  title: string;
  scene: string;
  futureWhisper: string;
  lesson: string;
  wealthyConduct: string;
  decision: {
    prompt: string;
    choices: {
      label: string;
      tradeoff: string;
      rewards: Partial<Record<Stat, number>>;
    }[];
  };
  quiz: QuizQuestion;
  journalPrompt: string;
  gratitudePrompt: string;
  identity: string;
  minimumAction: string;
  deepAction: string;
  visualization: string;
  xp: number;
}
export interface Profile {
  displayName: string;
  futureName: string;
  visionDate: string;
  location: string;
  timezone: string;
  tosMeaning: string;
  fundingPath:
    | 'Bootstrapped'
    | 'Venture-backed'
    | 'Hybrid'
    | 'Grant and partnership led';
  instructorMode: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  familyLabel: string;
}
export interface Project {
  id: string;
  name: string;
  description: string;
  vision: string;
  stage: string;
  nextMilestone: string;
  deadline: string;
  dependencies: string;
  risks: string;
  weeklyCommitment: number;
  evidence: string;
  notes: string;
  quarterId: number;
  history: string[];
}
export interface AppState {
  version: 2;
  profile: Profile;
  onboarded: boolean;
  prologueComplete: boolean;
  rewindCount: number;
  xp: number;
  stats: Record<Stat, number>;
  completedDates: string[];
  choices: Record<string, number>;
  quizResults: Record<string, boolean>;
  journal: Record<string, string>;
  gratitude: Record<string, string>;
  bridgeActions: Record<string, string>;
  visualizationHistory: string[];
  projects: Project[];
  courseNotes: Record<string, string>;
  customQuestions: string[];
  legacyLaws: number[];
  mode: 'today' | 'catch-up' | 'replay' | 'author';
}
