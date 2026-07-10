import { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./cn";

type FilterSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
};

export function FilterSelect({ className, children, ...props }: FilterSelectProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        className="h-10 w-full appearance-none rounded-md border bg-background px-3 py-2 pr-9 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </div>
  );
}
