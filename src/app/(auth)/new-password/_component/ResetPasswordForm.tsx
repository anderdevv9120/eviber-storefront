"use client";

import { useState } from "react";
import Link from "next/link";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@/components/ui/Button";
import { PATH } from "@/constants/paths";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { resetPassword } from "@/apis/auth";
import {
  PASSWORD_REQUIRED_MESSAGE,
  PASSWORD_MIN_LENGTH_MESSAGE,
  MIN_PASSWORD_LENGTH,
  PASSWORD_CONFIRMATION_REQUIRED_MESSAGE,
  PASSWORD_CONFIRMATION_MATCH_MESSAGE,
  PASSWORD_POLICY_REGEX,
  PASSWORD_POLICY_MESSAGE,
} from "@/constants/validate";
import { getParams } from "@/utils/getParams";
import InputPassword from "@/components/ui/InputPassword";
import AuthHeading from "../../_component/AuthHeading";
import AuthNotice from "../../_component/AuthNotice";
import { AUTH_FIELD_LABEL, AUTH_INPUT } from "../../_component/authStyles";
import { translateAuthError } from "../../_component/authErrors";

const schema = yup
  .object({
    newPassword: yup
      .string()
      .required(PASSWORD_REQUIRED_MESSAGE)
      .min(MIN_PASSWORD_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE)
      .matches(PASSWORD_POLICY_REGEX, PASSWORD_POLICY_MESSAGE),
    confirmPassword: yup
      .string()
      .required(PASSWORD_CONFIRMATION_REQUIRED_MESSAGE)
      .oneOf([yup.ref("newPassword")], PASSWORD_CONFIRMATION_MATCH_MESSAGE),
  })
  .required();

interface IResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

const ResetPasswordForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const methods = useForm<IResetPasswordForm>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });
  const { handleSubmit } = methods;

  const onSubmit = async (data: IResetPasswordForm) => {
    const token = getParams("token");

    if (!token) {
      setMessage(
        "Link đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu link mới."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ newPassword: data.newPassword, token });
      setMessage("");
      setIsSuccess(true);
    } catch (error: unknown) {
      setMessage(translateAuthError(getErrorMessage(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthNotice
        status="success"
        title="Đặt lại mật khẩu thành công"
        description="Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ."
      >
        <Button
          size="lg"
          className="w-full"
          onClick={() => router.push(PATH.LOGIN)}
        >
          Đăng nhập
        </Button>
      </AuthNotice>
    );
  }

  return (
    <>
      <AuthHeading
        title="Đặt lại mật khẩu"
        description="Chọn mật khẩu mới cho tài khoản của bạn."
      />
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <InputPassword
              name="newPassword"
              label="Mật khẩu mới"
              labelClassName={AUTH_FIELD_LABEL}
              className={AUTH_INPUT}
              placeholder={`Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`}
            />
            <InputPassword
              name="confirmPassword"
              label="Nhập lại mật khẩu mới"
              labelClassName={AUTH_FIELD_LABEL}
              className={AUTH_INPUT}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          {message && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {message}
              <Link
                href={PATH.FORGET_PASSWORD}
                className="ml-1 font-bold text-primary-700 hover:underline"
              >
                Yêu cầu link mới
              </Link>
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-5 w-full"
            loading={isSubmitting}
          >
            Đặt lại mật khẩu
          </Button>

          <p className="mt-6 text-center text-sm text-dark-500">
            <Link
              href={PATH.LOGIN}
              className="font-bold text-primary-700 hover:underline"
            >
              Quay lại trang đăng nhập
            </Link>
          </p>
        </form>
      </FormProvider>
    </>
  );
};

export default ResetPasswordForm;
