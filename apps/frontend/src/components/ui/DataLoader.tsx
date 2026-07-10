import { LoaderCircle } from "lucide-react";

type DataLoaderProps = {
  /** Texto bajo el indicador. Por defecto "Cargando datos...". */
  label?: string;
  /** Clases extra para el contenedor (p. ej. borde de una tarjeta). */
  className?: string;
};

/**
 * Indicador de carga estandar del proyecto: un anillo giratorio (tipo reloj)
 * con el texto "Cargando datos...". Usar en cualquier estado de carga en vez
 * de texto suelto, para que todo se vea consistente.
 */
export function DataLoader({ label = "Cargando datos...", className }: DataLoaderProps) {
  return (
    <div
      className={[
        "flex items-center justify-center gap-2 p-6 text-xs text-slate-500",
        className ?? ""
      ].join(" ")}
    >
      <LoaderCircle className="h-4 w-4 animate-spin text-primary" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
