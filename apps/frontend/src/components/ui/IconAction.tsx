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
  sm: "h-9 w-9 [&>svg]:h-4 [&>svg]:w-4",
  md: "h-10 w-10 [&>svg]:h-[18px] [&>svg]:w-[18px]",
  lg: "h-11 w-11 [&>svg]:h-5 [&>svg]:w-5"
};

const variants: Record<IconActionVariant, Record<IconActionTone, string>> = {
  soft: {
    primary: "text-primary hover:bg-primary/10",
    edit: "text-blue-700 hover:bg-blue-50",
    success: "text-emerald-700 hover:bg-emerald-50",
    warning: "text-amber-700 hover:bg-amber-50",
    danger: "text-red-600 hover:bg-red-50",
    neutral: "text-slate-600 hover:bg-slate-100",
    whatsapp: "text-[#128C4A] hover:bg-[#25D366]/10"
  },
  solid: {
    primary: "text-primary hover:bg-primary/10",
    edit: "text-blue-700 hover:bg-blue-50",
    success: "text-emerald-700 hover:bg-emerald-50",
    warning: "text-amber-700 hover:bg-amber-50",
    danger: "text-red-600 hover:bg-red-50",
    neutral: "text-slate-700 hover:bg-slate-100",
    whatsapp: "text-[#128C4A] hover:bg-[#25D366]/10"
  },
  outline: {
    primary: "text-primary hover:bg-primary/10",
    edit: "text-blue-700 hover:bg-blue-50",
    success: "text-emerald-700 hover:bg-emerald-50",
    warning: "text-amber-700 hover:bg-amber-50",
    danger: "text-red-600 hover:bg-red-50",
    neutral: "text-slate-700 hover:bg-slate-100",
    whatsapp: "text-[#128C4A] hover:bg-[#25D366]/10"
  }
};
export function IconAction({
  label,
  icon,
  tone = "primary",
  variant = "soft",
  size = "sm",
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
          "inline-grid cursor-pointer place-items-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
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




