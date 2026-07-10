import { X } from "lucide-react";
import { ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

type ModalSize = "sm" | "md" | "lg" | "xl";

type AppModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closeOnOverlay?: boolean;
  onClose: () => void;
};

const sizes: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl"
};

export function AppModal({ open, title, description, children, footer, size = "lg", closeOnOverlay = true, onClose }: AppModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-start justify-center p-2 sm:p-4" role="presentation">
      <button
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
        aria-label="Cerrar modal"
        type="button"
        onClick={closeOnOverlay ? onClose : undefined}
      />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-xl border bg-background shadow-2xl outline-none sm:max-h-[calc(100dvh-2rem)]",
          sizes[size]
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-lg font-semibold">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button className="shrink-0 rounded-md border p-2 text-slate-500 hover:bg-muted hover:text-slate-800" type="button" aria-label="Cerrar" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <footer className="border-t bg-muted/40 px-5 py-3">{footer}</footer> : null}
      </section>
    </div>,
    document.body
  );
}