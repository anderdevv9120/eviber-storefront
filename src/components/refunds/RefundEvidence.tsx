"use client";

import { useEffect, useState } from "react";
import { getRefundEvidence } from "@/apis/refund";

interface RefundEvidenceProps {
  orderNumber: string;
  evidenceId: string;
  /** Alt text có nghĩa, vd "Ảnh bằng chứng 1 cho Áo hoodie" */
  label: string;
  sessionToken?: string;
}

/** Ảnh riêng tư tải qua route xác thực → object URL, thu hồi khi đổi/hủy; không bao giờ có URL công khai */
export default function RefundEvidence({
  orderNumber,
  evidenceId,
  label,
  sessionToken,
}: RefundEvidenceProps) {
  const [result, setResult] = useState<{ evidenceId: string; url?: string }>();

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;
    getRefundEvidence(orderNumber, evidenceId, {
      signal: controller.signal,
      sessionToken,
    })
      .then((blob) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setResult({ evidenceId, url: objectUrl });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ evidenceId });
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [orderNumber, evidenceId, sessionToken]);

  const settled = result?.evidenceId === evidenceId ? result : undefined;
  if (!settled) {
    return (
      <div
        role="status"
        aria-label={`Đang tải ${label}`}
        className="h-20 w-20 animate-pulse rounded-lg bg-white-100"
      />
    );
  }
  if (!settled.url) {
    return (
      <p className="flex h-20 w-28 items-center rounded-lg bg-white-100 p-2 text-xs text-dark-400">
        Không tải được ảnh bằng chứng
      </p>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- blob URL riêng tư, không đi qua image optimizer
    <img
      src={settled.url}
      alt={label}
      className="h-20 w-20 rounded-lg border border-white-300 object-cover"
    />
  );
}
