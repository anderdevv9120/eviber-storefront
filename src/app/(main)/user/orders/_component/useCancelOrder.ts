"use client";

import { useState } from "react";
import { cancelOrder } from "@/apis/order";
import { successToast } from "@/utils/toast";

/**
 * Hủy đơn: dùng chung cho card ở danh sách và trang chi tiết.
 *
 * Lỗi (vd đơn vừa được admin xác nhận nên không hủy được nữa) do interceptor toast; ở đây
 * vẫn gọi `onDone` để phía gọi nạp lại và user thấy trạng thái thật thay vì nút Hủy còn nguyên.
 */
export const useCancelOrder = (orderId: string, onDone?: () => void) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const confirmCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelOrder(orderId);
      successToast("Đã hủy đơn hàng");
    } catch {
      // interceptor đã toast lỗi
    } finally {
      setIsCancelling(false);
      setIsConfirmOpen(false);
      onDone?.();
    }
  };

  return {
    isConfirmOpen,
    isCancelling,
    openConfirm: () => setIsConfirmOpen(true),
    closeConfirm: () => !isCancelling && setIsConfirmOpen(false),
    confirmCancel,
  };
};
