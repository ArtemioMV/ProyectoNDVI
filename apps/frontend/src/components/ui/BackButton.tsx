import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "./cn";

type BackButtonProps = {
  /** Ruta destino. Si se omite, vuelve a la pantalla anterior del historial. */
  to?: string;
  label?: string;
  className?: string;
};

/** Boton estandar "volver atras". Usar en cualquier pantalla de detalle/alta. */
export function BackButton({ to, label = "Volver", className }: BackButtonProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-primary",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
