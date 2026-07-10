import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "./cn";

type DisclosurePanelProps = {
  title: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function DisclosurePanel({ title, description, open, onToggle, children }: DisclosurePanelProps) {
  return (
    <section className="overflow-hidden rounded-lg border bg-background">
      <button className="flex w-full items-center justify-between gap-4 p-4 text-left" type="button" onClick={onToggle}>
        <span>
          <span className="block font-semibold">{title}</span>
          <span className="block text-sm text-slate-500">{description}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition", open && "rotate-180")} />
      </button>
      {open ? <div className="border-t p-4">{children}</div> : null}
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
    <article className="rounded-lg border bg-background p-4">
      <div className={cn("flex items-center gap-2 text-sm", tones[tone])}>{icon}{label}</div>
      <strong className="mt-2 block text-2xl">{value}</strong>
      {hint ? <span className="mt-0.5 block text-xs text-slate-500">{hint}</span> : null}
    </article>
  );
}
