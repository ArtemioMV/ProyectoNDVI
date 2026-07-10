import { ChevronDown } from "lucide-react";
import { ReactNode, useId } from "react";
import { cn } from "./cn";

type DisclosurePanelProps = {
  title: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function DisclosurePanel({ title, description, open, onToggle, children }: DisclosurePanelProps) {
  const contentId = useId();
  return (
    <section className="overflow-hidden rounded-xl border bg-background shadow-sm transition-shadow hover:shadow-md">
      <button className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-primary/[0.025]" type="button" aria-expanded={open} aria-controls={contentId} onClick={onToggle}>
        <span>
          <span className="block font-semibold">{title}</span>
          <span className="block text-sm text-slate-500">{description}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition", open && "rotate-180")} />
      </button>
      {open ? <div id={contentId} className="border-t bg-muted/20 p-4">{children}</div> : null}
    </section>
  );
}

type MetricCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  tone?: "neutral" | "warning" | "success";
  hint?: string;
};

const tones = {
  neutral: "text-slate-500",
  warning: "text-amber-600",
  success: "text-green-600"
};

export function MetricCard({ label, value, icon, tone = "neutral", hint }: MetricCardProps) {
  return (
    <article className="group rounded-xl border bg-background p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
      <div className={cn("flex items-center gap-2 text-sm font-medium", tones[tone])}>{icon}{label}</div>
      <strong className="mt-3 block text-2xl tracking-tight">{value}</strong>
      {hint ? <span className="mt-0.5 block text-xs text-slate-500">{hint}</span> : null}
    </article>
  );
}




