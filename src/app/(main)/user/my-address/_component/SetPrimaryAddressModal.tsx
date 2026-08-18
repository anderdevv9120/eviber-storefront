import Modal from "@/components/ui/Modal";
import { Address } from "@/components/icons";

interface EditPrimaryModal {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
}

const EditPrimaryModal = ({ isOpen, onClose, onConfirm }: EditPrimaryModal) => {
  return (
    <Modal
      onCancel={onClose}
      onOk={onConfirm}
      title="Đặt làm địa chỉ mặc định?"
      isOpen={isOpen}
      cancelText="Thoát"
      okText="Xác nhận"
    >
      <div className="flex gap-2 py-4">
        <Address className="text-primary-300 w-14 h-14 " />
        Bạn có chắc chắn muốn đặt địa chỉ này thành địa chỉ mặc định
      </div>
    </Modal>
  );
};

export default EditPrimaryModal;
