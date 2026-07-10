import { InputHTMLAttributes } from "react";
import { cn } from "./cn";

type SwitchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  description?: string;
};

export function SwitchField({ label, description, checked, className, ...props }: SwitchFieldProps) {
  return (
    <label className={cn("flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 transition hover:bg-muted/40", className)}>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium leading-5">{label}</span>
        {description ? <span className="block truncate text-xs leading-4 text-slate-500">{description}</span> : null}
      </span>
      <input className="peer sr-only" type="checkbox" checked={checked} {...props} />
      <span className="relative h-5 w-9 shrink-0 rounded-full bg-slate-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-4 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary" />
    </label>
  );
}

type CheckboxFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  description?: string;
};

export function CheckboxField({ label, description, className, ...props }: CheckboxFieldProps) {
  return (
    <label className={cn("flex gap-3 rounded-md border bg-background p-3", className)}>
      <input className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" type="checkbox" {...props} />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description ? <span className="block text-xs text-slate-500">{description}</span> : null}
      </span>
    </label>
  );
}
