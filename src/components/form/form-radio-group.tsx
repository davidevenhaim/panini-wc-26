"use client";

import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/form/field";
import { cn } from "@/lib/utils";

export type RadioOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type FormRadioGroupProps = {
  name: string;
  label?: string;
  description?: string;
  options: RadioOption[];
  orientation?: "vertical" | "horizontal";
  className?: string;
};

export function FormRadioGroup({
  name,
  label,
  description,
  options,
  orientation = "vertical",
  className,
}: FormRadioGroupProps) {
  const { control } = useFormContext();
  const tForms = useTranslations("forms");

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          {label && (
            <FieldLabel htmlFor={`form-radio-${name}`}>{tForms(label as never)}</FieldLabel>
          )}
          {description && !fieldState.invalid && (
            <FieldDescription>{tForms(description as never)}</FieldDescription>
          )}
          <RadioGroup
            id={`form-radio-${name}`}
            value={field.value ?? ""}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            aria-invalid={fieldState.invalid}
            className={cn(orientation === "horizontal" && "flex flex-row flex-wrap gap-4")}
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-start gap-2.5">
                <RadioGroupItem
                  value={option.value}
                  id={`form-radio-${name}-${option.value}`}
                  disabled={option.disabled}
                  className="mt-0.5"
                />
                <div className="flex flex-col gap-0.5">
                  <label
                    htmlFor={`form-radio-${name}-${option.value}`}
                    className={cn(
                      "cursor-pointer text-sm leading-none font-medium select-none",
                      option.disabled && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {tForms(option.label as never)}
                  </label>
                  {option.description && (
                    <FieldDescription>{tForms(option.description as never)}</FieldDescription>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
