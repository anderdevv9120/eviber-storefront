"use client";

import { useState } from "react";
import { cancelOrder } from "@/apis/order";
import { successToast } from "@/utils/toast";
import type { ICancelOrderPayload } from "@/@types/Order.type";

/**
 * Hủy đơn 2 bước (Shopee-style): popup xác nhận → modal chọn lý do → submit hủy thật.
 * Dùng chung cho card ở danh sách, trang chi tiết và màn chờ chuyển khoản (chỉ chủ đơn).
 *
 * Lỗi (vd đơn vừa được admin xác nhận nên không hủy được nữa) do interceptor toast; ở đây
 * vẫn gọi `onDone` để phía gọi nạp lại và user thấy trạng thái thật thay vì nút Hủy còn nguyên.
 */
export const useCancelOrder = (orderId: string, onDone?: () => void) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const openConfirm = () => setIsConfirmOpen(true);
  const closeConfirm = () => !isCancelling && setIsConfirmOpen(false);
  // Chốt popup xác nhận → sang bước chọn lý do; đơn CHƯA bị hủy ở đây
  const proceedToReason = () => {
    setIsConfirmOpen(false);
    setIsReasonOpen(true);
  };
  const closeReason = () => !isCancelling && setIsReasonOpen(false);

  const submitCancel = async (payload: ICancelOrderPayload) => {
    setIsCancelling(true);
    try {
      await cancelOrder(orderId, payload);
      successToast("Đã hủy đơn hàng");
    } catch {
      // interceptor đã toast lỗi
    } finally {
      setIsCancelling(false);
      setIsReasonOpen(false);
      onDone?.();
    }
  };

  return {
    isConfirmOpen,
    isReasonOpen,
    isCancelling,
    openConfirm,
    closeConfirm,
    proceedToReason,
    closeReason,
    submitCancel,
  };
};

export type CancelOrderFlowController = ReturnType<typeof useCancelOrder>;
