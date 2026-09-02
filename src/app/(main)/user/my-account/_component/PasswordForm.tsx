"use client";

import { useState } from "react";
import * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePassword } from "@/apis/profile";
import { successToast } from "@/utils/toast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import Button from "@/components/ui/Button";
import InputPassword from "@/components/ui/InputPassword";
import FormRow from "./FormRow";
import {
  PASSWORD_REQUIRED_MESSAGE,
  PASSWORD_MIN_LENGTH_MESSAGE,
  MIN_PASSWORD_LENGTH,
  PASSWORD_CONFIRMATION_REQUIRED_MESSAGE,
  PASSWORD_CONFIRMATION_MATCH_MESSAGE,
  CURRENT_PASSWORD_CONFIRMATION_REQUIRED_MESSAGE,
  PASSWORD_POLICY_REGEX,
  PASSWORD_POLICY_MESSAGE,
} from "@/constants/validate";

interface IPassWordForm {
  newPassword: string;
  confirmPassword: string;
  currentPassword: string;
}

const schema = yup.object({
  newPassword: yup
    .string()
    .required(PASSWORD_REQUIRED_MESSAGE)
    .min(MIN_PASSWORD_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE)
    .matches(PASSWORD_POLICY_REGEX, PASSWORD_POLICY_MESSAGE),
  confirmPassword: yup
    .string()
    .required(PASSWORD_CONFIRMATION_REQUIRED_MESSAGE)
    .oneOf([yup.ref("newPassword")], PASSWORD_CONFIRMATION_MATCH_MESSAGE),
  currentPassword: yup
    .string()
    .required(CURRENT_PASSWORD_CONFIRMATION_REQUIRED_MESSAGE)
    .min(MIN_PASSWORD_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE),
});

const PassWordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const methods = useForm<IPassWordForm>({
    resolver: yupResolver(schema),
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = async (data: IPassWordForm) => {
    setIsLoading(true);
    setMessage("");
    try {
      const { currentPassword, newPassword } = data;
      await changePassword({
        oldPassword: currentPassword,
        newPassword: newPassword,
      });
      successToast("Đổi mật khẩu thành công");
      reset();
    } catch (error: unknown) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-lg border border-white-300 bg-white p-5 md:p-6">
      <h2 className="text-lg font-bold">Đổi mật khẩu</h2>
      <p className="mt-0.5 text-sm text-dark-400">
        Dùng mật khẩu mới cho các lần đăng nhập sau.
      </p>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
          <div className="flex flex-col gap-4">
            <FormRow label="Mật khẩu hiện tại" htmlFor="currentPassword">
              <InputPassword
                name="currentPassword"
                id="currentPassword"
                placeholder="Nhập mật khẩu hiện tại"
                autoComplete="current-password"
                className="text-base"
              />
            </FormRow>
            <FormRow label="Mật khẩu mới" htmlFor="newPassword">
              <InputPassword
                name="newPassword"
                id="newPassword"
                placeholder="Nhập mật khẩu mới"
                autoComplete="off"
                className="text-base"
              />
            </FormRow>
            <FormRow label="Xác nhận mật khẩu mới" htmlFor="confirmPassword">
              <InputPassword
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Xác nhận mật khẩu mới"
                autoComplete="off"
                className="text-base"
              />
            </FormRow>
          </div>
          {message && <p className="mt-3 text-sm text-red">{message}</p>}
          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              size="sm"
              className="px-6"
              loading={isLoading}
            >
              Đổi mật khẩu
            </Button>
          </div>
        </form>
      </FormProvider>
    </section>
  );
};

export default PassWordForm;
