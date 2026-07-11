import { Children, InputHTMLAttributes, isValidElement, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "./cn";
import { AppSelect, type AppSelectOption } from "./AppSelect";

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

type SelectFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  fieldClassName?: string;
  className?: string;
  children: ReactNode;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  name?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (event: { target: { value: string } }) => void;
};

function selectOptions(children: ReactNode): AppSelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value?: string | number; children?: ReactNode; disabled?: boolean }>(child)) return [];
    return [{ value: String(child.props.value ?? ""), label: String(child.props.children ?? ""), disabled: child.props.disabled }];
  });
}

export function SelectField({ label, hint, error, className, fieldClassName, children, value, defaultValue, name, disabled, onChange }: SelectFieldProps) {
  const options = selectOptions(children);
  const selectedValue = String(Array.isArray(value) ? value[0] ?? "" : value ?? (Array.isArray(defaultValue) ? defaultValue[0] ?? "" : defaultValue ?? options[0]?.value ?? ""));
  return (
    <FieldFrame label={label} hint={hint} error={error} className={fieldClassName}>
      <AppSelect
        className={className}
        value={selectedValue}
        options={options}
        name={name}
        disabled={disabled}
        ariaLabel={label}
        onValueChange={(next) => onChange?.({ target: { value: next } })}
      />
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



