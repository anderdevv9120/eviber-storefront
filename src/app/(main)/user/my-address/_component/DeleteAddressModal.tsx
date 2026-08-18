import Modal from "@/components/ui/Modal";
import { Warning } from "@/components/icons";

interface IDeleteAddressModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
}

const DeleteAddressModal = ({
  isOpen,
  onClose,
  onConfirm,
}: IDeleteAddressModalProps) => {
  return (
    <Modal
      onCancel={onClose}
      onOk={onConfirm}
      title="Xác nhận xóa địa chỉ"
      isOpen={isOpen}
      cancelText="Thoát"
      okText="Xác nhận"
    >
      <div className="py-4 flex gap-6">
        <Warning className="text-red-800" />
        <span>Bạn có chắc chắn muốn xóa địa chỉ này?</span>
      </div>
    </Modal>
  );
};

export default DeleteAddressModal;
