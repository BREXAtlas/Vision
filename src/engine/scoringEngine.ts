import type { Stat } from '../types';

export function applyRewards(
  current: Record<Stat, number>,
  rewards: Partial<Record<Stat, number>>,
): Record<Stat, number> {
  const next = { ...current };
  for (const [stat, amount] of Object.entries(rewards))
    next[stat as Stat] = Math.max(0, next[stat as Stat] + (amount ?? 0));
  return next;
}

export const levelForXp = (xp: number) => Math.floor(Math.max(0, xp) / 250) + 1;
