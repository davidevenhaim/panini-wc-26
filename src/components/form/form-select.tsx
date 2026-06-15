"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { SelectOption } from "@/types/ui.types";
import { Typography } from "@/components/ui/typography";
import { Field, FieldError, FieldLabel } from "@/components/form/field";
import { useFieldText } from "@/components/form/utils/translate-field-text";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FormSelectProps = {
  name: string;
  label?: React.ReactNode;
  placeholder?: string;
  options: SelectOption[];
  className?: string;
};

export function FormSelect({ name, label, placeholder, options, className }: FormSelectProps) {
  const { control } = useFormContext();
  const { tr, render } = useFieldText();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          {label && (
            <FieldLabel htmlFor={`form-select-${name}`}>
              <Typography variant="label2">{render(label)}</Typography>
            </FieldLabel>
          )}
          <Select
            onValueChange={field.onChange}
            value={typeof field.value === "string" ? field.value : undefined}
          >
            <SelectTrigger
              className="w-full"
              id={`form-select-${name}`}
              aria-invalid={fieldState.invalid}
            >
              <SelectValue placeholder={placeholder ? tr(placeholder) : undefined} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {tr(option.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
