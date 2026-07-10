/**
 * Ciclo de facturacion anclado a la fecha de activacion del servicio
 * (docs/business-rules/monthly-billing.md): del dia de activacion al mismo
 * dia del mes siguiente. NO es mes calendario.
 */
export function currentBillingCycle(installedAt: Date, now: Date) {
  let start = new Date(now.getFullYear(), now.getMonth(), installedAt.getDate());
  if (start > now) {
    start = new Date(now.getFullYear(), now.getMonth() - 1, installedAt.getDate());
  }
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
}

export function cyclePeriodKey(cycleStart: Date) {
  return cycleStart.toISOString().slice(0, 10);
}

const DAY_MS = 86_400_000;

export function cycleDays(cycle: { start: Date; end: Date }) {
  return Math.max(1, Math.round((cycle.end.getTime() - cycle.start.getTime()) / DAY_MS));
}

export function daysUsedInCycle(cycle: { start: Date; end: Date }, cutDate: Date) {
  const used = Math.ceil((cutDate.getTime() - cycle.start.getTime()) / DAY_MS);
  return Math.min(Math.max(used, 0), cycleDays(cycle));
}
