import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface CancelOrderModalProps {
  isOpen: boolean;
  orderNumber?: string;
  isCancelling?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelOrderModal = ({
  isOpen,
  orderNumber,
  isCancelling,
  onClose,
  onConfirm,
}: CancelOrderModalProps) => (
  <Modal
    isOpen={isOpen}
    onCancel={onClose}
    closable={!isCancelling}
    title="Hủy đơn hàng này?"
    titleClassName="text-xl"
    className="w-[420px]"
    footer={
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="px-5"
          onClick={onClose}
          disabled={isCancelling}
        >
          Giữ đơn
        </Button>
        <Button
          size="sm"
          variant="danger"
          className="px-5"
          onClick={onConfirm}
          loading={isCancelling}
        >
          Hủy đơn
        </Button>
      </div>
    }
  >
    <p className="text-sm text-dark-500">
      Đơn {orderNumber ?? "này"} sẽ bị hủy và không khôi phục được. Nếu đổi ý,
      bạn cần đặt đơn mới.
    </p>
  </Modal>
);

export default CancelOrderModal;
