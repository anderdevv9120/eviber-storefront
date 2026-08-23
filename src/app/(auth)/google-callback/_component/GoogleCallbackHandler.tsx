"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { getParams } from "@/utils/getParams";
import { googleCallback, setTokenServer } from "@/apis/auth";
import { successToast } from "@/utils/toast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { PATH } from "@/constants/paths";
import AuthNotice from "../../_component/AuthNotice";
import { translateAuthError } from "../../_component/authErrors";

const GoogleCallbackHandler = () => {
  const [hasError, setHasError] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const code = getParams("code");
    if (!code) {
      setHasError(true);
      setMessage("Thiếu mã xác thực từ Google. Vui lòng đăng nhập lại.");
      return;
    }

    const handleGoogleCallback = async () => {
      try {
        const data = await googleCallback(code);
        await setTokenServer(data.data);
        successToast("Đăng nhập Google thành công");

        // replace để xóa ?code=... khỏi history — tránh leak OAuth code
        router.replace(PATH.HOME);
      } catch (error: unknown) {
        setHasError(true);
        setMessage(translateAuthError(getErrorMessage(error)));
      }
    };

    handleGoogleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hasError) {
    return (
      <AuthNotice
        status="error"
        title="Đăng nhập Google thất bại"
        description={message}
      >
        <Button
          size="lg"
          className="w-full"
          onClick={() => router.push(PATH.LOGIN)}
        >
          Quay lại trang đăng nhập
        </Button>
      </AuthNotice>
    );
  }

  return (
    <AuthNotice
      status="loading"
      title="Đang xử lý đăng nhập Google"
      description="Vui lòng chờ trong giây lát..."
    />
  );
};

export default GoogleCallbackHandler;
