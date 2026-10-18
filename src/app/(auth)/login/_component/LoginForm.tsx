"use client";

import { useState } from "react";
import Link from "next/link";
import * as yup from "yup";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "@/components/ui/Input";
import { Google } from "@/components/icons";
import ToggleButton from "@/components/ui/ToggleButton";
import Button from "@/components/ui/Button";
import { PATH } from "@/constants/paths";
import { login, resendVerifyEmail, setTokenServer } from "@/apis/auth";
import { EMAIL_REGEX } from "@/constants";
import {
  EMAIL_REQUIRED_MESSAGE,
  EMAIL_INVALID_MESSAGE,
  PASSWORD_REQUIRED_MESSAGE,
  PASSWORD_MIN_LENGTH_MESSAGE,
  MIN_PASSWORD_LENGTH,
} from "@/constants/validate";
import { successToast } from "@/utils/toast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import InputPassword from "@/components/ui/InputPassword";
import { AUTH_FIELD_LABEL, AUTH_INPUT } from "../../_component/authStyles";
import { translateAuthError } from "../../_component/authErrors";
import { API_URL } from "@/config/api-url";

const schema = yup
  .object({
    email: yup
      .string()
      .required(EMAIL_REQUIRED_MESSAGE)
      .matches(EMAIL_REGEX, EMAIL_INVALID_MESSAGE),
    password: yup
      .string()
      .required(PASSWORD_REQUIRED_MESSAGE)
      .min(MIN_PASSWORD_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE),
  })
  .required();

interface IFormInput {
  email: string;
  password: string;
}

const LoginForm = () => {
  const [isRememberAccount, setIsRememberAccount] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Email bị chặn vì chưa verify (BE 403) — chốt tại thời điểm submit để nút "Gửi lại"
  // luôn gửi đúng địa chỉ đó, kể cả khi user đã sửa ô email sau khi thấy lỗi
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  const methods = useForm<IFormInput>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const { handleSubmit } = methods;

  const onSubmit: SubmitHandler<IFormInput> = async (dataLogin) => {
    setIsSubmitting(true);
    try {
      const { data } = await login(dataLogin);
      setMessage("");
      setUnverifiedEmail("");

      await setTokenServer(data, isRememberAccount);
      successToast("Đăng nhập thành công");
      router.push(PATH.HOME);
    } catch (error: unknown) {
      const raw = getErrorMessage(error);
      setUnverifiedEmail(
        raw === "Please verify your email before logging in"
          ? dataLogin.email
          : ""
      );
      setMessage(translateAuthError(raw));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await resendVerifyEmail({ email: unverifiedEmail });
      successToast("Đã gửi lại email xác nhận");
    } catch (error: unknown) {
      setMessage(translateAuthError(getErrorMessage(error)));
    } finally {
      setIsResending(false);
    }
  };

  const handleLoginGoogle = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <Input
            name="email"
            label="Email"
            labelClassName={AUTH_FIELD_LABEL}
            className={AUTH_INPUT}
            placeholder="ban@email.com"
          />
          <InputPassword
            name="password"
            label="Mật khẩu"
            labelClassName={AUTH_FIELD_LABEL}
            className={AUTH_INPUT}
            placeholder={`Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`}
          />
        </div>

        <div className="mt-3 mb-5 flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-dark-500">
            <ToggleButton
              defaultToggle={false}
              onChange={() => setIsRememberAccount(!isRememberAccount)}
            />
            Lưu đăng nhập
          </label>
          <Link
            href={PATH.FORGET_PASSWORD}
            className="text-sm font-bold text-primary-700 hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {message && (
          <p className="mb-3 text-sm text-red-600" role="alert">
            {message}
            {unverifiedEmail && (
              <button
                type="button"
                disabled={isResending}
                onClick={handleResendVerification}
                className="ml-1 font-bold text-primary-700 hover:underline disabled:opacity-70"
              >
                {isResending ? "Đang gửi..." : "Gửi lại email xác nhận"}
              </button>
            )}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={isSubmitting}
        >
          Đăng nhập
        </Button>

        <div className="my-5 flex items-center gap-3 text-sm text-dark-300">
          <span className="flex-1 border-t border-dashed border-white-600"></span>
          Hoặc
          <span className="flex-1 border-t border-dashed border-white-600"></span>
        </div>

        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={handleLoginGoogle}
        >
          <Google />
          Đăng nhập với Google
        </Button>

        <p className="mt-6 text-center text-sm text-dark-500">
          Bạn chưa có tài khoản?
          <Link
            href={PATH.REGISTER}
            className="ml-1 font-bold text-primary-700 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </FormProvider>
  );
};

export default LoginForm;
