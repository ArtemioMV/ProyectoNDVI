import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "./cn";

type AlertTone = "info" | "success" | "warning" | "error";

type AlertProps = {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  className?: string;
};

const tones: Record<AlertTone, { box: string; icon: ReactNode }> = {
  info: { box: "border-blue-200 bg-blue-50 text-blue-800", icon: <Info className="h-4 w-4" /> },
  success: { box: "border-green-200 bg-green-50 text-green-800", icon: <CheckCircle2 className="h-4 w-4" /> },
  warning: { box: "border-amber-200 bg-amber-50 text-amber-800", icon: <AlertTriangle className="h-4 w-4" /> },
  error: { box: "border-red-200 bg-red-50 text-red-700", icon: <XCircle className="h-4 w-4" /> }
};

/** Mensaje de estado estandar (info/success/warning/error). Reemplaza los divs sueltos. */
export function Alert({ tone = "info", title, children, className }: AlertProps) {
  const toneStyle = tones[tone];
  return (
    <div className={cn("flex items-start gap-2 rounded-lg border px-3 py-2 text-sm", toneStyle.box, className)}>
      <span className="mt-0.5 shrink-0">{toneStyle.icon}</span>
      <div className="min-w-0">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? <div className={title ? "text-xs opacity-90" : ""}>{children}</div> : null}
      </div>
    </div>
  );
}
