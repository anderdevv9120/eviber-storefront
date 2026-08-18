"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getProfile } from "@/apis/auth";

const Authentication = () => {
  const setProfile = useAppStore((state) => state.setProfile);
  const clearProfile = useAppStore((state) => state.clearProfile);

  useEffect(() => {
    let isMounted = true;

    // Không check accessToken trước khi gọi: refreshToken là httpOnly (client không
    // đọc được) — accessToken hết hạn nhưng phiên vẫn hợp lệ. Cứ gọi getProfile,
    // interceptor tự refresh; guest thật → 401 im lặng (toastError: false) → clearProfile
    const getCustomerInfo = async () => {
      try {
        const res = await getProfile();
        if (!isMounted) return;
        // Guard shape: response lệch dự kiến mà setProfile(undefined) là crash Header
        if (res?.data?._id) {
          setProfile(res.data);
        } else {
          clearProfile();
        }
      } catch {
        if (isMounted) clearProfile();
      }
    };
    getCustomerInfo();

    return () => {
      isMounted = false;
    };
  }, [setProfile, clearProfile]);

  return <></>;
};

export default Authentication;
