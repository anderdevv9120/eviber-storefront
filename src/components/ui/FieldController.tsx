import { useFormContext, Controller, ControllerProps } from "react-hook-form";
import React, { ReactElement } from "react";
import { cn } from "@/config/utils";
import FormError from "./FormError";

export const FORM_LABEL_CLASS =
  "pb-2 text-sm font-medium normal-case text-dark-500";

interface FieldControllerProps {
  name: string;
  required?: string;
  className?: string;
  title?: string;
  labelClassName?: string;
  children: ReactElement<Record<string, unknown>>;
  isUncontrolled?: boolean;
  defaultValue?: any;
  rules?: ControllerProps["rules"];
  [key: string]: any;
}

const FieldController: React.FC<FieldControllerProps> = (props) => {
  const {
    name,
    required,
    className,
    title,
    labelClassName,
    children,
    isUncontrolled,
    defaultValue,
    rules,
    ...rest
  } = props;
  const { control } = useFormContext();

  return (
    <div className={className}>
      {title && (
        <div className={cn("table text-xl pb-3 capitalize", labelClassName)}>
          {title}
          {required && <span className="text-red ml-1.5">*</span>}
        </div>
      )}
      <Controller
        control={control}
        name={name}
        rules={{
          ...rules,
          ...(required ? { required } : {}),
        }}
        defaultValue={defaultValue}
        render={({ field }) => {
          const { value, ...fieldRest } = field;
          const isBoolean = typeof value === "boolean";
          return (
            <>
              {React.cloneElement(children, {
                ...rest,
                ...fieldRest,
                // Boolean (checkbox/switch) dùng `checked`; còn lại dùng `value`.
                // Dùng `?? ""` để không phá giá trị hợp lệ 0/false/"".
                ...(isBoolean ? { checked: value } : { value: value ?? "" }),
                defaultValue: defaultValue,
              })}
              {isUncontrolled && (
                <div className="h-0 overflow-hidden">
                  <input
                    className="h-0"
                    readOnly
                    ref={(ref) => field.ref(ref)}
                  />
                </div>
              )}
            </>
          );
        }}
      />
      <FormError name={name} />
    </div>
  );
};

export default FieldController;
