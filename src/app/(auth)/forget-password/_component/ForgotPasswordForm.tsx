"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as yup from "yup";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { PATH } from "@/constants/paths";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { successToast } from "@/utils/toast";
import { forgotPassword } from "@/apis/auth";
import type { IStoreSettings } from "@/@types/StoreContent.type";
import ContactShopLinks from "@/components/ui/ContactShopLinks";
import { ApiError } from "@/config/axios";
import { EMAIL_REGEX } from "@/constants";
import { EMAIL_UNAVAILABLE_CODE } from "@/constants/storeContent";
import {
  EMAIL_REQUIRED_MESSAGE,
  EMAIL_INVALID_MESSAGE,
} from "@/constants/validate";
import AuthHeading from "../../_component/AuthHeading";
import AuthNotice from "../../_component/AuthNotice";
import { AUTH_FIELD_LABEL, AUTH_INPUT } from "../../_component/authStyles";
import { translateAuthError } from "../../_component/authErrors";

const RESEND_COOLDOWN_SECONDS = 60;

const schema = yup
  .object({
    email: yup
      .string()
      .required(EMAIL_REQUIRED_MESSAGE)
      .matches(EMAIL_REGEX, EMAIL_INVALID_MESSAGE),
  })
  .required();

interface IForgotPasswordFormInput {
  email: string;
}

interface ForgotPasswordFormProps {
  emailAvailable: boolean;
  contact: IStoreSettings["contact"];
}

const ForgotPasswordForm = ({
  emailAvailable,
  contact,
}: ForgotPasswordFormProps) => {
  // Cờ từ store-settings có thể trễ (revalidate) — BE trả EMAIL_UNAVAILABLE_CODE khi submit cũng chuyển sang đây
  const [isEmailUnavailable, setIsEmailUnavailable] = useState(!emailAvailable);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  // Email đã gửi link thành công — có giá trị nghĩa là chuyển sang màn "đã gửi link"
  const [sentEmail, setSentEmail] = useState("");

  const methods = useForm<IForgotPasswordFormInput>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });
  const { handleSubmit } = methods;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown]);

  const sendResetLink = async (email: string) => {
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setMessage("");
      setCountdown(RESEND_COOLDOWN_SECONDS);
      if (sentEmail) {
        successToast("Đã gửi lại link đặt lại mật khẩu");
      }
      setSentEmail(email);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.code === EMAIL_UNAVAILABLE_CODE) {
        setIsEmailUnavailable(true);
        return;
      }
      setMessage(translateAuthError(getErrorMessage(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit: SubmitHandler<IForgotPasswordFormInput> = (data) =>
    sendResetLink(data.email);

  if (isEmailUnavailable) {
    return (
      <AuthNotice
        status="error"
        title="Chưa thể gửi link đặt lại mật khẩu"
        description="Shop chưa bật gửi email. Liên hệ shop để được hỗ trợ đặt lại mật khẩu:"
      >
        <ContactShopLinks contact={contact} />
        <Link
          href={PATH.LOGIN}
          className="text-sm font-bold text-primary-700 hover:underline"
        >
          Quay lại trang đăng nhập
        </Link>
      </AuthNotice>
    );
  }

  if (sentEmail) {
    return (
      <AuthNotice
        status="success"
        title="Đã gửi link đặt lại mật khẩu"
        description={`Kiểm tra hộp thư ${sentEmail} và nhấn vào link trong email để đặt lại mật khẩu.`}
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
          loading={isSubmitting}
          disabled={countdown > 0}
          onClick={() => sendResetLink(sentEmail)}
        >
          {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại link"}
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
        title="Quên mật khẩu"
        description="Nhập email và chúng tôi sẽ gửi bạn link đặt lại mật khẩu."
      />
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            name="email"
            label="Email"
            labelClassName={AUTH_FIELD_LABEL}
            className={AUTH_INPUT}
            placeholder="ban@email.com"
          />

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
            Gửi link đặt lại mật khẩu
          </Button>

          <p className="mt-6 text-center text-sm text-dark-500">
            Đã nhớ ra mật khẩu?
            <Link
              href={PATH.LOGIN}
              className="ml-1 font-bold text-primary-700 hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </form>
      </FormProvider>
    </>
  );
};

export default ForgotPasswordForm;
