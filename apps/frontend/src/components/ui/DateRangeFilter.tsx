import { CalendarDays } from "lucide-react";
import { cn } from "./cn";

type DateRangeValue = {
  from: string;
  to: string;
};

type DateRangeFilterProps = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  className?: string;
};

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex h-10 min-w-0 items-center gap-2 rounded-md border bg-background px-3 text-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
      <input
        aria-label={label}
        className="min-w-0 flex-1 bg-transparent outline-none"
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  return (
    <div className={cn("grid min-w-0 gap-2 sm:grid-cols-2", className)}>
      <DateInput label="Fecha desde" value={value.from} onChange={(from) => onChange({ ...value, from })} />
      <DateInput label="Fecha hasta" value={value.to} onChange={(to) => onChange({ ...value, to })} />
    </div>
  );
}
