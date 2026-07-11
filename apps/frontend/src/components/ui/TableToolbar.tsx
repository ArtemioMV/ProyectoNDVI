import { Search } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "./cn";

export function TableToolbar({
  search,
  onSearchChange,
  placeholder,
  children,
  className
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center", className)}>
      <div className="relative min-w-56 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          aria-label={placeholder}
          className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder={placeholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      {children ? <div className="grid min-w-0 gap-2 sm:grid-flow-col sm:auto-cols-min">{children}</div> : null}
    </div>
  );
}
