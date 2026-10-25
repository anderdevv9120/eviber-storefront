"use client";

import { useEffect, useState } from "react";
import { getRefundPolicy } from "@/apis/refund";
import { cn } from "@/config/utils";
import type { RefundPolicyState } from "@/@types/Refund.type";
import {
  REFUND_POLICY_UNAVAILABLE_TEXT,
  isRefundPolicy,
  refundPolicyText,
} from "@/utils/refund-policy";

type LoadedPolicyState = Exclude<RefundPolicyState, { status: "loading" }>;

/**
 * Tải chính sách hiện hành ở client (route no-store) vì trang product/combo là ISR 300s.
 * `reviewedRevision` đổi → tải lại, để checkout không kẹt ở bản cũ sau khi review mới.
 */
export function useRefundPolicy(reviewedRevision?: number): RefundPolicyState {
  const [result, setResult] = useState<{
    revision: number | undefined;
    state: LoadedPolicyState;
  }>();

  useEffect(() => {
    const controller = new AbortController();
    const settle = (state: LoadedPolicyState) => {
      if (!controller.signal.aborted)
        setResult({ revision: reviewedRevision, state });
    };
    getRefundPolicy(controller.signal)
      .then((response) =>
        settle(
          isRefundPolicy(response.data)
            ? { status: "ready", policy: response.data }
            : { status: "unavailable" }
        )
      )
      .catch(() => settle({ status: "unavailable" }));
    return () => controller.abort();
  }, [reviewedRevision]);

  return result && result.revision === reviewedRevision
    ? result.state
    : { status: "loading" };
}

interface RefundPolicyNoticeProps {
  productRefundEnabled: boolean;
  policy: RefundPolicyState;
  className?: string;
}

export default function RefundPolicyNotice({
  productRefundEnabled,
  policy,
  className,
}: RefundPolicyNoticeProps) {
  if (policy.status !== "ready") {
    return (
      <p role="status" className={cn("text-xs text-dark-400", className)}>
        {policy.status === "loading"
          ? "Đang tải chính sách hoàn tiền…"
          : REFUND_POLICY_UNAVAILABLE_TEXT}
      </p>
    );
  }
  const text = refundPolicyText({
    enabled: policy.policy.enabled,
    windowDays: policy.policy.windowDays,
    productRefundEnabled,
  });
  return (
    <div className={cn("space-y-1 text-xs text-dark-500", className)}>
      <p>{text.ordinary}</p>
      <p>{text.claims}</p>
    </div>
  );
}

/** Cho trang chỉ có một notice (product page, server component không gọi hook được) */
export function LiveRefundPolicyNotice(
  props: Omit<RefundPolicyNoticeProps, "policy">
) {
  const policy = useRefundPolicy();
  return <RefundPolicyNotice {...props} policy={policy} />;
}
