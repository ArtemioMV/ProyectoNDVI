import { ReactNode, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

type TooltipSide = "top" | "bottom" | "left" | "right";

type TooltipProps = {
  label: string;
  children: ReactNode;
  side?: TooltipSide;
  className?: string;
};

type Position = {
  top: number;
  left: number;
  transform: string;
};

function getPosition(rect: DOMRect, side: TooltipSide): Position {
  const gap = 10;
  if (side === "bottom") return { top: rect.bottom + gap, left: rect.left + rect.width / 2, transform: "translateX(-50%)" };
  if (side === "left") return { top: rect.top + rect.height / 2, left: rect.left - gap, transform: "translate(-100%, -50%)" };
  if (side === "right") return { top: rect.top + rect.height / 2, left: rect.right + gap, transform: "translateY(-50%)" };
  return { top: rect.top - gap, left: rect.left + rect.width / 2, transform: "translate(-50%, -100%)" };
}

export function Tooltip({ label, children, side = "top", className }: TooltipProps) {
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  useLayoutEffect(() => {
    if (!open || !wrapperRef.current) return;

    function updatePosition() {
      if (!wrapperRef.current) return;
      setPosition(getPosition(wrapperRef.current.getBoundingClientRect(), side));
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, side]);

  return (
    <span
      ref={wrapperRef}
      className={cn("inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && position
        ? createPortal(
            <span
              role="tooltip"
              className="pointer-events-none fixed z-[120] max-w-64 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-lg shadow-slate-900/10"
              style={{ top: position.top, left: position.left, transform: position.transform }}
            >
              {label}
            </span>,
            document.body
          )
        : null}
    </span>
  );
}
