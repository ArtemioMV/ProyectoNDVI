/**
 * Formateadores compartidos de la app. Antes cada pagina definia su propia
 * copia de `money` (25 archivos); esta es la fuente unica.
 */

const penFormatter = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

export function money(value: number) {
  return penFormatter.format(value);
}

const shortDateFormatter = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" });

export function shortDate(value: string | Date | null | undefined) {
  if (!value) return "-";
  return shortDateFormatter.format(new Date(value));
}

const longDateFormatter = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "long", year: "numeric" });

export function longDate(value: string | Date) {
  return longDateFormatter.format(new Date(value));
}
const tableDateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});

/** Formato unico para fechas mostradas en columnas de tablas: dd/mm/aaaa, sin hora. */
export function tableDate(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : tableDateFormatter.format(date);
}

