import { Children, isValidElement, ReactNode } from "react";
import { AppSelect, type AppSelectOption } from "./AppSelect";

type FilterSelectProps = {
  value?: string | number | readonly string[];
  onChange?: (event: { target: { value: string } }) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

function optionsFromChildren(children: ReactNode): AppSelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value?: string | number; children?: ReactNode; disabled?: boolean }>(child)) return [];
    return [{ value: String(child.props.value ?? ""), label: String(child.props.children ?? ""), disabled: child.props.disabled }];
  });
}

export function FilterSelect({ className, children, value, onChange, disabled, "aria-label": ariaLabel }: FilterSelectProps) {
  return (
    <AppSelect
      className={className}
      value={String(Array.isArray(value) ? value[0] ?? "" : value ?? "")}
      options={optionsFromChildren(children)}
      disabled={disabled}
      ariaLabel={ariaLabel}
      onValueChange={(next) => onChange?.({ target: { value: next } })}
    />
  );
}
