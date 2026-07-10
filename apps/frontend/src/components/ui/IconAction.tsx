import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Tooltip } from "./Tooltip";
import { cn } from "./cn";

type IconActionTone = "primary" | "edit" | "success" | "warning" | "danger" | "neutral" | "whatsapp";
type IconActionVariant = "soft" | "solid" | "outline";
type IconActionSize = "sm" | "md" | "lg";

type IconActionProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  icon: ReactNode;
  tone?: IconActionTone;
  variant?: IconActionVariant;
  size?: IconActionSize;
  tooltipSide?: "top" | "bottom" | "left" | "right";
  wrapperClassName?: string;
};

const sizes: Record<IconActionSize, string> = {
  sm: "h-8 w-8 [&>svg]:h-4 [&>svg]:w-4",
  md: "h-9 w-9 [&>svg]:h-[18px] [&>svg]:w-[18px]",
  lg: "h-10 w-10 [&>svg]:h-5 [&>svg]:w-5"
};

const variants: Record<IconActionVariant, Record<IconActionTone, string>> = {
  soft: {
    primary: "bg-primary/10 text-primary ring-1 ring-primary/20 hover:bg-primary/15",
    edit: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 hover:bg-blue-100",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100",
    danger: "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100",
    neutral: "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200",
    whatsapp: "bg-[#25D366]/10 text-[#128C4A] ring-1 ring-[#25D366]/30 hover:bg-[#25D366]/15"
  },
  solid: {
    primary: "bg-primary text-white shadow-sm hover:bg-primary/90",
    edit: "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
    success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
    warning: "bg-amber-500 text-white shadow-sm hover:bg-amber-600",
    danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
    neutral: "bg-slate-700 text-white shadow-sm hover:bg-slate-800",
    whatsapp: "bg-[#25D366] text-white shadow-sm hover:bg-[#1fb65a]"
  },
  outline: {
    primary: "border border-primary/30 bg-white text-primary hover:bg-primary/10",
    edit: "border border-blue-200 bg-white text-blue-700 hover:bg-blue-50",
    success: "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50",
    warning: "border border-amber-200 bg-white text-amber-700 hover:bg-amber-50",
    danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
    neutral: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    whatsapp: "border border-[#25D366]/40 bg-white text-[#128C4A] hover:bg-[#25D366]/10"
  }
};

export function IconAction({
  label,
  icon,
  tone = "primary",
  variant = "soft",
  size = "md",
  tooltipSide,
  wrapperClassName,
  className,
  type = "button",
  ...props
}: IconActionProps) {
  return (
    <Tooltip label={label} side={tooltipSide} className={wrapperClassName}>
      <button
        type={type}
        aria-label={props["aria-label"] ?? label}
        className={cn(
          "inline-grid cursor-pointer place-items-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          sizes[size],
          variants[variant][tone],
          className
        )}
        {...props}
      >
        {icon}
        <span className="sr-only">{label}</span>
      </button>
    </Tooltip>
  );
}

