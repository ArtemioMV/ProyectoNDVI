import { Check, ChevronDown } from "lucide-react";
import { KeyboardEvent, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

export type AppSelectOption = { value: string; label: string; disabled?: boolean };

type AppSelectProps = {
  value: string;
  options: AppSelectOption[];
  onValueChange: (value: string) => void;
  ariaLabel?: string;
  disabled?: boolean;
  /** Version fina para pies de tabla y toolbars densos. */
  compact?: boolean;
  name?: string;
  className?: string;
};

type Position = { top: number; left: number; width: number };

export function AppSelect({ value, options, onValueChange, ariaLabel, disabled, compact = false, name, className }: AppSelectProps) {
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.findIndex((option) => option.value === currentValue)));
  const [position, setPosition] = useState<Position | null>(null);
  const selected = options.find((option) => option.value === currentValue) ?? options[0];

  useEffect(() => setCurrentValue(value), [value]);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const update = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) setPosition({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, [open]);

  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    setCurrentValue(option.value);
    onValueChange(option.value);
    setActiveIndex(index);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(activeIndex); else setOpen(true);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    setOpen(true);
    const direction = event.key === "ArrowDown" ? 1 : -1;
    let next = activeIndex;
    do next = (next + direction + options.length) % options.length;
    while (options[next]?.disabled && next !== activeIndex);
    setActiveIndex(next);
  }

  return (
    <>
      {name ? <input type="hidden" name={name} value={currentValue} /> : null}
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        disabled={disabled}
        className={cn("flex w-full items-center justify-between rounded-lg border bg-background text-left font-normal text-slate-700 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-slate-400", compact ? "h-8 gap-1.5 px-2.5 text-xs" : "h-10 gap-3 px-3 text-sm", className)}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onKeyDown}
      >
        <span className="min-w-0 truncate">{selected?.label ?? "Selecciona..."}</span>
        <ChevronDown className={cn("shrink-0 text-slate-500 transition-transform", compact ? "h-3.5 w-3.5" : "h-4 w-4", open && "rotate-180")} />
      </button>
      {open && position ? createPortal(
        <div
          ref={menuRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-label={ariaLabel}
          className="fixed z-[130] max-h-64 overflow-y-auto rounded-lg border bg-background p-1 shadow-xl shadow-slate-900/15 scrollbar-thin"
          style={{ top: position.top, left: position.left, width: Math.max(position.width, 180) }}
        >
          {options.map((option, index) => (
            <button
              key={`${option.value}-${index}`}
              type="button"
              role="option"
              aria-selected={option.value === currentValue}
              disabled={option.disabled}
              className={cn("flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition", index === activeIndex && "bg-primary/5", option.value === currentValue ? "font-medium text-primary" : "text-slate-700 hover:bg-muted", option.disabled && "cursor-not-allowed opacity-40")}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(index)}
            >
              <span className="truncate">{option.label}</span>
              {option.value === currentValue ? <Check className="h-4 w-4 shrink-0" /> : null}
            </button>
          ))}
        </div>,
        document.body
      ) : null}
    </>
  );
}


