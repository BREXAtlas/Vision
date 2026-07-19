const LANDING_STATE_KEY = 'visionlife';
const APP_STATE_KEY = 'vision2031-state';

type LandingVenture = {
  name?: string;
  desc?: string;
  added?: string;
};

type LandingState = {
  points?: number;
  ventures?: LandingVenture[];
};

type StoredProject = {
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
};

type FullAppState = {
  xp?: number;
  projects?: StoredProject[];
  [key: string]: unknown;
};

function readJson<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

function ventureProject(venture: LandingVenture, index: number): StoredProject {
  const name = venture.name?.trim() || `Vision venture ${index + 1}`;
  return {
    id: `visionlife-${slug(name) || index + 1}`,
    name,
    description:
      venture.desc?.trim() ||
      'A venture added through the Vision Life simulation landing experience.',
    vision: `Create responsible, measurable progress in ${name}.`,
    stage: 'Active',
    nextMilestone: 'Define one observable result',
    deadline: '',
    dependencies: 'Protected time and clear ownership',
    risks: 'Scope creep and founder dependency',
    weeklyCommitment: 1,
    evidence: '',
    notes: venture.added ? `Added in Vision Life on ${venture.added}.` : '',
    quarterId: 1,
    history: ['Imported from the Vision Life simulation.'],
  };
}

export function syncLandingToFullApp(): void {
  const landing = readJson<LandingState>(LANDING_STATE_KEY);
  const full = readJson<FullAppState>(APP_STATE_KEY);
  if (!landing || !full) return;

  const existingProjects = Array.isArray(full.projects) ? full.projects : [];
  const existingNames = new Set(
    existingProjects.map((project) => project.name.trim().toLowerCase()),
  );
  const imported = (landing.ventures || [])
    .filter((venture) => venture.name?.trim())
    .filter(
      (venture) => !existingNames.has(venture.name!.trim().toLowerCase()),
    )
    .map(ventureProject);

  const merged: FullAppState = {
    ...full,
    xp: Math.max(Number(full.xp) || 0, Number(landing.points) || 0),
    projects: [...existingProjects, ...imported],
  };

  try {
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(merged));
  } catch {
    // Local storage may be unavailable in private or restricted contexts.
  }
}

function markCurrentNavigation(): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-full-app-link]').forEach((link) => {
    link.addEventListener('click', syncLandingToFullApp);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  markCurrentNavigation();
  syncLandingToFullApp();
  window.setInterval(syncLandingToFullApp, 3000);
});

window.addEventListener('pagehide', syncLandingToFullApp);
