import React from "react";
import type { Decorator } from "@storybook/nextjs-vite";
import { FormProvider, useForm } from "react-hook-form";

/**
 * Bọc story trong react-hook-form FormProvider.
 * Dùng cho các component nhận biết form qua useFormContext()
 * (Input / FieldController / FormError...).
 *
 * Có thể truyền defaultValues qua parameters.reactHookForm.defaultValues.
 */
export const withForm: Decorator = (Story, context) => {
  const defaultValues = context.parameters?.reactHookForm?.defaultValues ?? {};
  const methods = useForm({ defaultValues, mode: "onTouched" });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>
        <Story />
      </form>
    </FormProvider>
  );
};

export default withForm;
