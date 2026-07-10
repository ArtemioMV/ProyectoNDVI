import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

type FieldFrameProps = {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

function FieldFrame({ label, hint, error, className, children }: FieldFrameProps) {
  return (
    <label className={cn("block space-y-1 text-sm font-medium", className)}>
      <span>{label}</span>
      {children}
      {error ? <span className="block text-xs font-normal text-red-600">{error}</span> : null}
      {!error && hint ? <span className="block text-xs font-normal text-slate-500">{hint}</span> : null}
    </label>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  fieldClassName?: string;
};

export function TextField({ label, hint, error, className, fieldClassName, ...props }: TextFieldProps) {
  return (
    <FieldFrame label={label} hint={hint} error={error} className={fieldClassName}>
      <input className={cn("h-10 w-full rounded-lg border bg-background px-3 font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20", className)} {...props} />
    </FieldFrame>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  error?: string;
  fieldClassName?: string;
};

export function SelectField({ label, hint, error, className, fieldClassName, children, ...props }: SelectFieldProps) {
  return (
    <FieldFrame label={label} hint={hint} error={error} className={fieldClassName}>
      <select className={cn("h-10 w-full rounded-lg border bg-background px-3 font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20", className)} {...props}>
        {children}
      </select>
    </FieldFrame>
  );
}

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
  fieldClassName?: string;
};

export function TextareaField({ label, hint, error, className, fieldClassName, ...props }: TextareaFieldProps) {
  return (
    <FieldFrame label={label} hint={hint} error={error} className={fieldClassName}>
      <textarea className={cn("min-h-20 w-full rounded-md border px-3 py-2 font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20", className)} {...props} />
    </FieldFrame>
  );
}

