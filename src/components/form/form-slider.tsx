"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Controller, useFormContext, type ControllerRenderProps } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useFieldText } from "./utils/translate-field-text";
import { formatFormError } from "./utils/format-form-error";
import { Typography } from "@/components/ui/typography";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: React.ReactNode;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  className?: string;
  error?: boolean;
  labelClassName?: string;
}

type SliderFieldProps = {
  field: ControllerRenderProps;
  fieldError?: { message?: string };
  name: string;
  label?: React.ReactNode;
  helperText?: string;
  min: number;
  max: number;
  step: number;
  required?: boolean;
  className: string;
  error?: boolean;
  labelClassName: string;
  inputRef: React.Ref<HTMLInputElement>;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
};

function SliderField({
  field,
  fieldError,
  name,
  label,
  helperText,
  min,
  max,
  step,
  required,
  className,
  error,
  labelClassName,
  inputRef,
  inputProps,
}: SliderFieldProps) {
  const t = useTranslations("forms");
  const { render } = useFieldText();
  const [isDragging, setIsDragging] = React.useState(false);
  const sliderValue = field.value ?? min;
  const percentage = ((sliderValue - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label htmlFor={name} className={cn("mb-1 block", labelClassName)}>
          <Typography variant="label2" as="span" className="text-sm font-medium">
            {render(label)}
          </Typography>
          {required && (
            <Typography variant="caption2" as="span" color="destructive" className="ms-1">
              *
            </Typography>
          )}
        </label>
      )}
      <div className="relative w-full pt-6">
        {isDragging && (
          <div
            className="bg-foreground pointer-events-none absolute -top-2 z-10 -translate-x-1/2 rounded-md px-3"
            style={{ insetInlineStart: `${percentage}%` }}
          >
            <Typography variant="caption2" color="white">
              {sliderValue}
            </Typography>
            <div className="border-t-foreground absolute start-1/2 top-full -translate-x-1/2 border-4 border-transparent" />
          </div>
        )}
        <div className="relative flex touch-none items-center select-none">
          <div className="bg-muted relative h-2 w-full grow overflow-hidden rounded-full">
            <div className="bg-foreground absolute h-full" style={{ width: `${percentage}%` }} />
          </div>
          <input
            type="range"
            ref={inputRef}
            id={name}
            min={min}
            max={max}
            step={step}
            value={sliderValue}
            onChange={(e) => field.onChange(Number(e.target.value))}
            onBlur={field.onBlur}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className={cn(
              "[&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:ring-offset-background [&::-webkit-slider-thumb]:focus-visible:ring-ring absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:focus-visible:ring-2 [&::-webkit-slider-thumb]:focus-visible:ring-offset-2 [&::-webkit-slider-thumb]:focus-visible:outline-none [&::-webkit-slider-thumb]:disabled:pointer-events-none [&::-webkit-slider-thumb]:disabled:opacity-50",
              error || fieldError
                ? "border-destructive focus:ring-destructive focus:border-destructive"
                : ""
            )}
            {...inputProps}
          />
        </div>
      </div>
      {(error || fieldError) && (
        <Typography variant="caption2" as="p" color="destructive" className="mt-1">
          {fieldError?.message ? formatFormError(t, fieldError.message) : helperText}
        </Typography>
      )}
      {!error && !fieldError && helperText && (
        <Typography variant="caption2" as="p" color="muted" className="mt-1">
          {helperText}
        </Typography>
      )}
    </div>
  );
}

export const FormSlider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      name,
      label,
      helperText,
      min = 0,
      max = 100,
      step = 1,
      required,
      className = "",
      error,
      labelClassName = "",
      ...props
    },
    ref
  ) => {
    const { control } = useFormContext();

    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error: fieldError } }) => (
          <SliderField
            field={field}
            fieldError={fieldError}
            name={name}
            label={label}
            helperText={helperText}
            min={min}
            max={max}
            step={step}
            required={required}
            className={className}
            error={error}
            labelClassName={labelClassName}
            inputRef={ref}
            inputProps={props}
          />
        )}
      />
    );
  }
);
FormSlider.displayName = "FormSlider";
