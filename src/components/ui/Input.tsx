"use client";

import { forwardRef, ReactNode, InputHTMLAttributes, useId } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/config/utils";
import { useFormContext } from "react-hook-form";
import FieldController from "./FieldController";

const inputVariants = cva(
  "w-full py-3 text-dark-900 placeholder-dark-300 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70 text-lg",
  {
    variants: {
      variant: {
        outlined:
          "border px-3 rounded-[10px] border-dark-200 hover:border-primary focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-100",
        standard:
          "border-b-[1px] border-b-dark-200 py-2 hover:border-b-primary focus-visible:border-b-primary-500",
        filled:
          "px-3 shadow-md rounded-[10px] focus-visible:ring-2 focus-visible:ring-primary-100",
      },
    },
    defaultVariants: {
      variant: "outlined",
    },
  }
);

export interface InputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "required">,
    VariantProps<typeof inputVariants> {
  label?: string;
  labelClassName?: string;
  error?: string;
  icon?: ReactNode;
  name?: string;
  required?: string;
}

const InputElement = forwardRef<HTMLInputElement, InputProps>(
  ({ variant, className, icon, required, ...props }, ref) => (
    <div className="w-full relative">
      <input
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        required={!!required}
        {...props}
      />
      <div
        className={cn(
          "absolute right-3 top-[50%] flex translate-y-[-50%] items-center",
          variant === "standard" && "right-0"
        )}
      >
        {icon}
      </div>
    </div>
  )
);

InputElement.displayName = "InputElement";

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      labelClassName,
      className,
      error,
      variant = "outlined",
      name,
      required,
      ...props
    },
    ref
  ) => {
    const form = useFormContext();
    const inputId = useId();

    if (form && name) {
      return (
        <FieldController
          name={name}
          required={required}
          title={label}
          labelClassName={labelClassName}
          {...props}
        >
          <InputElement
            variant={variant}
            className={className}
            ref={ref}
            {...props}
          />
        </FieldController>
      );
    }

    return (
      <div>
        {label && (
          <label className={cn("block mb-1", labelClassName)} htmlFor={inputId}>
            {label}
          </label>
        )}
        <InputElement
          id={inputId}
          variant={variant}
          className={className}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
