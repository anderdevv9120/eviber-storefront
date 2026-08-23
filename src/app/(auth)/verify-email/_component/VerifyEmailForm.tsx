"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Button from "@/components/ui/Button";
import { verifyEmail, resendVerifyEmail } from "@/apis/auth";
import { getParams } from "@/utils/getParams";
import { successToast } from "@/utils/toast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { PATH } from "@/constants/paths";
import AuthNotice from "../../_component/AuthNotice";
import { translateAuthError } from "../../_component/authErrors";

const REDIRECT_AFTER_SUCCESS_MS = 2500;

type VerifyState = "verifying" | "success" | "expired" | "invalid";

const VerifyEmailForm = () => {
  const [state, setState] = useState<VerifyState>("verifying");
  const [message, setMessage] = useState("");
  // Email lấy từ response khi link hết hạn — cần cho nút gửi lại
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  // Chặn StrictMode double-invoke: verify gọi 2 lần là toast đôi + tốn quota throttle 10 lần/giờ
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const handleVerify = async () => {
      const token = getParams("token");

      if (!token) {
        setState("invalid");
        return;
      }

      try {
        // verifyEmail đi bằng axios thuần (xem apis/auth.ts) → response chưa unwrap:
        // res.data = { data: { success, message }, message }
        const res = await verifyEmail({ token });
        setState("success");
        successToast(translateAuthError(res.data.data.message));
        setTimeout(() => router.push(PATH.LOGIN), REDIRECT_AFTER_SUCCESS_MS);
      } catch (error: unknown) {
        // Token hết hạn: BE 400 kèm errors = { action: 'resend', email } để gửi lại đúng email
        if (axios.isAxiosError(error)) {
          const errors = error.response?.data?.errors;
          if (errors?.action === "resend") {
            setState("expired");
            setEmail(errors.email ?? "");
            return;
          }
        }
        setState("invalid");
      }
    };

    handleVerify();
  }, [router]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      const res = await resendVerifyEmail({ email });
      successToast(translateAuthError(res.data.message));
      setMessage("");
    } catch (error: unknown) {
      setMessage(translateAuthError(getErrorMessage(error)));
    } finally {
      setIsResending(false);
    }
  };

  if (state === "verifying") {
    return (
      <AuthNotice
        status="loading"
        title="Đang xác nhận email"
        description="Vui lòng chờ trong giây lát..."
      />
    );
  }

  if (state === "success") {
    return (
      <AuthNotice
        status="success"
        title="Xác nhận email thành công"
        description="Đang chuyển đến trang đăng nhập..."
      >
        <Link
          href={PATH.LOGIN}
          className="text-sm font-bold text-primary-700 hover:underline"
        >
          Đăng nhập ngay
        </Link>
      </AuthNotice>
    );
  }

  return (
    <AuthNotice
      status="error"
      title={
        state === "expired"
          ? "Link xác nhận đã hết hạn"
          : "Link xác nhận không hợp lệ"
      }
      description={
        state === "expired"
          ? "Nhấn nút bên dưới để nhận email xác nhận mới."
          : "Link có thể đã được sử dụng hoặc chưa đầy đủ. Vui lòng kiểm tra lại email của bạn."
      }
    >
      {message && (
        <p className="text-sm text-red-600" role="alert">
          {message}
        </p>
      )}
      {state === "expired" ? (
        <>
          <Button
            size="lg"
            className="w-full"
            loading={isResending}
            onClick={handleResend}
          >
            Gửi lại email xác nhận
          </Button>
          <Link
            href={PATH.LOGIN}
            className="text-sm font-bold text-primary-700 hover:underline"
          >
            Quay lại trang đăng nhập
          </Link>
        </>
      ) : (
        <Button
          size="lg"
          className="w-full"
          onClick={() => router.push(PATH.LOGIN)}
        >
          Quay lại trang đăng nhập
        </Button>
      )}
    </AuthNotice>
  );
};

export default VerifyEmailForm;
