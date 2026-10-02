"use client";

import { useEffect, useState } from "react";
import { getBankTransferAccount } from "@/apis/payment";
import { IBankTransferAccount } from "@/@types/Order.type";

// STK không đổi trong phiên → cache module-level, success + chi tiết đơn không gọi 2 lần
let cached: IBankTransferAccount | undefined;
let inflight: Promise<IBankTransferAccount> | undefined;

const load = () => {
  inflight ??= getBankTransferAccount()
    .then((res) => {
      cached = res.data as IBankTransferAccount;
      return cached;
    })
    .catch((error) => {
      // Không giữ promise đã reject — lần mount sau còn thử lại được
      inflight = undefined;
      throw error;
    });
  return inflight;
};

/** STK nhận chuyển khoản của shop (env BE). `error` → khối chuyển khoản hiện hướng liên hệ thay vì STK rỗng */
export const useBankTransferAccount = () => {
  const [account, setAccount] = useState(cached);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Request đang bay có thể resolve giữa render và effect → đồng bộ lại thay vì return trần
    if (cached) {
      setAccount(cached);
      return;
    }
    let active = true;
    load()
      .then((data) => active && setAccount(data))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  return { account, error };
};
