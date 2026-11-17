export type CostRow = { name: string; price: number; cycle: 'month' | 'year' };
export function estimateCosts(rows: CostRow[]) {
  const monthly = rows.reduce((sum, r) => sum + (Number.isFinite(r.price) && r.price > 0 ? r.price / (r.cycle === 'year' ? 12 : 1) : 0), 0);
  return { monthly, annual: monthly * 12, fiveYear: monthly * 60 };
}
