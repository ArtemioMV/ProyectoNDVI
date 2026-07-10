import { ReactNode } from "react";
import { cn } from "./cn";

type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
};

type RadioCardGroupProps<T extends string> = {
  label: string;
  value: T;
  options: Array<Option<T>>;
  onChange: (value: T) => void;
  columns?: "two" | "three";
};

export function RadioCardGroup<T extends string>({ label, value, options, onChange, columns = "two" }: RadioCardGroupProps<T>) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className={cn("grid gap-2", columns === "three" ? "md:grid-cols-3" : "md:grid-cols-2")}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={cn(
                "rounded-md border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-background hover:bg-muted"
              )}
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                {option.icon}
                {option.label}
              </span>
              {option.description ? <span className="mt-1 block text-xs text-slate-500">{option.description}</span> : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

type SegmentedControlProps<T extends string> = {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  label?: string;
};

export function SegmentedControl<T extends string>({ value, options, onChange, label }: SegmentedControlProps<T>) {
  return (
    <div className="space-y-2">
      {label ? <div className="text-sm font-medium">{label}</div> : null}
      <div className="flex flex-wrap gap-2 rounded-lg border bg-background p-2">
        {options.map((option) => (
          <button
            key={option.value}
            className={cn("rounded-md px-3 py-2 text-sm font-medium transition", value === option.value ? "bg-primary text-white" : "text-slate-600 hover:bg-muted")}
            type="button"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
