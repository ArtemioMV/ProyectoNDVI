import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { cn } from "./cn";

type ToastTone = "info" | "success" | "warning" | "error";
type ToastItem = { id: string; tone: ToastTone; title?: string; message: string };
export type ToastInput = { tone?: ToastTone; title?: string; message: string; duration?: number };

const ToastContext = createContext<(input: ToastInput) => void>(() => {});

/** Hook para lanzar notificaciones: `const toast = useToast(); toast({ tone, message })`. */
export function useToast() {
  return useContext(ToastContext);
}

const tones: Record<ToastTone, { box: string; icon: ReactNode }> = {
  info: { box: "border-blue-200 bg-blue-50 text-blue-800", icon: <Info className="h-4 w-4" /> },
  success: { box: "border-green-200 bg-green-50 text-green-800", icon: <CheckCircle2 className="h-4 w-4" /> },
  warning: { box: "border-amber-200 bg-amber-50 text-amber-800", icon: <AlertTriangle className="h-4 w-4" /> },
  error: { box: "border-red-200 bg-red-50 text-red-700", icon: <XCircle className="h-4 w-4" /> }
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      setItems((current) => [...current, { id, tone: input.tone ?? "info", title: input.title, message: input.message }]);
      window.setTimeout(() => remove(id), input.duration ?? 4000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="no-print fixed bottom-4 right-4 z-[100] flex w-full max-w-xs flex-col gap-2">
        {items.map((item) => {
          const tone = tones[item.tone];
          return (
            <div key={item.id} role="status" className={cn("flex items-start gap-2 rounded-lg border px-3 py-2 text-sm shadow-lg", tone.box)}>
              <span className="mt-0.5 shrink-0">{tone.icon}</span>
              <div className="min-w-0 flex-1">
                {item.title ? <p className="font-medium">{item.title}</p> : null}
                <p className={item.title ? "text-xs opacity-90" : ""}>{item.message}</p>
              </div>
              <button className="shrink-0 opacity-60 hover:opacity-100" aria-label="Cerrar" onClick={() => remove(item.id)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
