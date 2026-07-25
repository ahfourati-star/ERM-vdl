// Quarter helpers. periodOrder is a sortable integer (year*10 + quarter)
// so snapshots order chronologically without date parsing.
export function periodFromDate(d: Date) {
  const year = d.getFullYear();
  const quarter = Math.floor(d.getMonth() / 3) + 1; // 1..4
  return { period: `T${quarter} ${year}`, periodOrder: year * 10 + quarter };
}

export function currentPeriod() {
  return periodFromDate(new Date());
}
