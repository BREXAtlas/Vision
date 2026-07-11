export const allocationTotal = (values: number[]) =>
  values.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
export function businessEquity(
  valuation: number,
  ownership: number,
  dilution: number,
  tax: number,
) {
  const paper = (valuation * ownership) / 100;
  const post = paper * (1 - dilution / 100);
  return { paper, postDilution: post, estimatedNet: post * (1 - tax / 100) };
}
export function runway(
  cash: number,
  revenue: number,
  burn: number,
  growth = 0,
) {
  const net = Math.max(0, burn - revenue * (1 + growth / 100));
  return net === 0 ? Infinity : cash / net;
}
export function capTable(
  holders: { name: string; shares: number }[],
  newShares: number,
) {
  const total = holders.reduce((a, b) => a + b.shares, 0) + newShares;
  return holders.map((h) => ({ ...h, percent: (h.shares / total) * 100 }));
}
export function lifestyleGap(
  income: number,
  spending: number,
  reserve: number,
) {
  return income - spending - reserve;
}
