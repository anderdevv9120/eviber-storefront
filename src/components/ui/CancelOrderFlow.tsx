"use client";

import CancelOrderModal from "@/components/ui/CancelOrderModal";
import CancelReasonModal from "@/components/ui/CancelReasonModal";
import type { CancelOrderFlowController } from "@/hooks/useCancelOrder";

/**
 * Cặp modal của luồng hủy đơn: xác nhận ("Hủy đơn này?") → chọn lý do → submit hủy thật.
 * Gắn 1 dòng này ở mỗi nơi có nút Hủy (chi tiết đơn, màn chờ chuyển khoản).
 */
const CancelOrderFlow = ({
  cancel,
  orderNumber,
}: {
  cancel: CancelOrderFlowController;
  orderNumber?: string;
}) => (
  <>
    {cancel.isConfirmOpen && (
      <CancelOrderModal
        isOpen
        orderNumber={orderNumber}
        onClose={cancel.closeConfirm}
        onConfirm={cancel.proceedToReason}
      />
    )}
    {cancel.isReasonOpen && (
      <CancelReasonModal
        isOpen
        isCancelling={cancel.isCancelling}
        onClose={cancel.closeReason}
        onSubmit={cancel.submitCancel}
      />
    )}
  </>
);

export default CancelOrderFlow;
