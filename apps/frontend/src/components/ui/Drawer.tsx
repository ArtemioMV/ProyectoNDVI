import { X } from "lucide-react";
import { ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

type DrawerSize = "sm" | "md" | "lg" | "xl";

type DrawerProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: DrawerSize;
  onClose: () => void;
};

const sizes: Record<DrawerSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl"
};

/**
 * Panel deslizante que entra desde la derecha. Reutiliza el patron de AppModal
 * (overlay, bloqueo de scroll del body, cierre con Escape) pero con animacion
 * lateral. Pensado para ver detalles sin sacar al usuario de la tabla.
 */
export function Drawer({ open, title, description, children, footer, size = "md", onClose }: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[200] flex justify-end" role="presentation">
      <button
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px] motion-safe:animate-[fadeIn_150ms_ease-out]"
        aria-label="Cerrar panel"
        type="button"
        onClick={onClose}
      />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex h-[100dvh] w-full flex-col border-l bg-background shadow-2xl outline-none motion-safe:animate-[slideInRight_200ms_ease-out]",
          sizes[size]
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-lg font-semibold">{title}</h2>
            {description ? <p id={descriptionId} className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-muted hover:text-slate-800" type="button" aria-label="Cerrar" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <footer className="border-t bg-muted/40 px-5 py-3">{footer}</footer> : null}
      </section>
    </div>,
    document.body
  );
}



