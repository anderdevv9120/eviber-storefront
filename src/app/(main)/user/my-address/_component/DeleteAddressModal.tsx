import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface IDeleteAddressModalProps {
  isOpen: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteAddressModal = ({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: IDeleteAddressModalProps) => (
  <Modal
    isOpen={isOpen}
    onCancel={onClose}
    closable={!isDeleting}
    title="Xóa địa chỉ này?"
    titleClassName="text-xl"
    className="w-[420px]"
    footer={
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="px-5"
          onClick={onClose}
          disabled={isDeleting}
        >
          Hủy
        </Button>
        <Button
          size="sm"
          variant="danger"
          className="px-5"
          onClick={onConfirm}
          loading={isDeleting}
        >
          Xóa địa chỉ
        </Button>
      </div>
    }
  >
    <p className="text-sm text-dark-500">
      Địa chỉ sẽ bị gỡ khỏi danh sách. Đơn hàng đã đặt không bị ảnh hưởng.
    </p>
  </Modal>
);

export default DeleteAddressModal;
