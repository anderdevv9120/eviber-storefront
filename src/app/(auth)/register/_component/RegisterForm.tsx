"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as yup from "yup";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "@/components/ui/Input";
import InputPassword from "@/components/ui/InputPassword";
import Button from "@/components/ui/Button";
import { PATH } from "@/constants/paths";
import { register, resendVerifyEmail } from "@/apis/auth";
import { EMAIL_REGEX } from "@/constants";
import { successToast } from "@/utils/toast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import AuthHeading from "../../_component/AuthHeading";
import AuthNotice from "../../_component/AuthNotice";
import { rememberLoginEmail } from "../../_component/loginEmailHandoff";
import { AUTH_FIELD_LABEL, AUTH_INPUT } from "../../_component/authStyles";

import {
  EMAIL_REQUIRED_MESSAGE,
  EMAIL_INVALID_MESSAGE,
  PASSWORD_REQUIRED_MESSAGE,
  PASSWORD_MIN_LENGTH_MESSAGE,
  FIRST_NAME_REQUIRED_MESSAGE,
  LAST_NAME_REQUIRED_MESSAGE,
  PASSWORD_CONFIRMATION_REQUIRED_MESSAGE,
  PASSWORD_CONFIRMATION_MATCH_MESSAGE,
  MIN_PASSWORD_LENGTH,
  PASSWORD_POLICY_REGEX,
  PASSWORD_POLICY_MESSAGE,
} from "@/constants/validate";
import { translateAuthError } from "../../_component/authErrors";

const schema = yup
  .object({
    email: yup
      .string()
      .required(EMAIL_REQUIRED_MESSAGE)
      .matches(EMAIL_REGEX, EMAIL_INVALID_MESSAGE),
    lastName: yup.string().required(LAST_NAME_REQUIRED_MESSAGE),
    firstName: yup.string().required(FIRST_NAME_REQUIRED_MESSAGE),
    password: yup
      .string()
      .required(PASSWORD_REQUIRED_MESSAGE)
      .min(MIN_PASSWORD_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE)
      .matches(PASSWORD_POLICY_REGEX, PASSWORD_POLICY_MESSAGE),
    confirmPassword: yup
      .string()
      .required(PASSWORD_CONFIRMATION_REQUIRED_MESSAGE)
      .oneOf([yup.ref("password")], PASSWORD_CONFIRMATION_MATCH_MESSAGE),
  })
  .required();

interface IFormInput {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

const RESEND_COOLDOWN_SECONDS = 60;

const RegisterForm = () => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  // Cooldown chống resend theo phản xạ — BE throttle resend-verification 3 lần/giờ
  const [countdown, setCountdown] = useState(0);
  // Email đã đăng ký thành công — có giá trị nghĩa là chuyển sang màn "kiểm tra hộp thư"
  const [registeredEmail, setRegisteredEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown]);

  const methods = useForm<IFormInput>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });
  const { handleSubmit } = methods;

  const onSubmit: SubmitHandler<IFormInput> = async (dataRegister) => {
    setIsSubmitting(true);
    // Đang chuyển sang Login: giữ nút khóa, bấm lần 2 sẽ đăng ký trùng và flash lỗi "Email đã được sử dụng"
    let isLeaving = false;
    try {
      const { email, firstName, lastName, password } = dataRegister;
      const { data } = await register({ email, firstName, lastName, password });
      // Shop chưa bật gửi email: BE tạo tài khoản đã xác thực, không có mail nào để chờ
      if (data?.verified) {
        rememberLoginEmail(email);
        successToast("Tạo tài khoản thành công, mời bạn đăng nhập");
        router.push(PATH.LOGIN);
        isLeaving = true;
        return;
      }
      setMessage("");
      setRegisteredEmail(email);
      setCountdown(RESEND_COOLDOWN_SECONDS);
    } catch (error: unknown) {
      setMessage(translateAuthError(getErrorMessage(error)));
    } finally {
      if (!isLeaving) setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerifyEmail({ email: registeredEmail });
      successToast("Đã gửi lại email xác nhận");
      setMessage("");
      setCountdown(RESEND_COOLDOWN_SECONDS);
    } catch (error: unknown) {
      setMessage(translateAuthError(getErrorMessage(error)));
    } finally {
      setIsResending(false);
    }
  };

  if (registeredEmail) {
    return (
      <AuthNotice
        status="success"
        title="Kiểm tra hộp thư của bạn"
        description={`Chúng tôi đã gửi link xác nhận đến ${registeredEmail}. Nhấn vào link trong email để kích hoạt tài khoản.`}
      >
        {message && (
          <p className="text-sm text-red-600" role="alert">
            {message}
          </p>
        )}
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          loading={isResending}
          disabled={countdown > 0}
          onClick={handleResend}
        >
          {countdown > 0
            ? `Gửi lại sau ${countdown}s`
            : "Gửi lại email xác nhận"}
        </Button>
        <Link
          href={PATH.LOGIN}
          className="text-sm font-bold text-primary-700 hover:underline"
        >
          Quay lại trang đăng nhập
        </Link>
      </AuthNotice>
    );
  }

  return (
    <>
      <AuthHeading
        title="Tạo tài khoản"
        description="Bắt đầu hành trình mua sắm của riêng bạn."
      />
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                name="lastName"
                label="Họ"
                labelClassName={AUTH_FIELD_LABEL}
                className={AUTH_INPUT}
                placeholder="Nguyễn"
              />
              <Input
                name="firstName"
                label="Tên"
                labelClassName={AUTH_FIELD_LABEL}
                className={AUTH_INPUT}
                placeholder="An"
              />
            </div>
            <InputPassword
              name="password"
              label="Mật khẩu"
              labelClassName={AUTH_FIELD_LABEL}
              className={AUTH_INPUT}
              placeholder={`Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`}
            />
            <InputPassword
              name="confirmPassword"
              label="Nhập lại mật khẩu"
              labelClassName={AUTH_FIELD_LABEL}
              className={AUTH_INPUT}
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          {message && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {message}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-5 w-full"
            loading={isSubmitting}
          >
            Đăng ký
          </Button>

          <p className="mt-6 text-center text-sm text-dark-500">
            Bạn đã có tài khoản?
            <Link
              href={PATH.LOGIN}
              className="ml-1 font-bold text-primary-700 hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </form>
      </FormProvider>
    </>
  );
};

export default RegisterForm;
