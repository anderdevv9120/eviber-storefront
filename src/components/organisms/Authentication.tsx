"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getProfile, getSession } from "@/apis/auth";

const Authentication = () => {
  const setProfile = useAppStore((state) => state.setProfile);
  const clearProfile = useAppStore((state) => state.clearProfile);

  useEffect(() => {
    let isMounted = true;

    // Đọc trạng thái cookie từ server vì refreshToken là httpOnly; guest không
    // gọi API profile/refresh, phiên chỉ còn refreshToken vẫn được khôi phục.
    const getCustomerInfo = async () => {
      try {
        const {
          data: { hasSession },
        } = await getSession();
        if (!isMounted) return;
        if (hasSession === false) {
          clearProfile();
          return;
        }
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
