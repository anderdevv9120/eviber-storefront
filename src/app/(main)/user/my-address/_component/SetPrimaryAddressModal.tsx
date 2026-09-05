import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface ISetPrimaryAddressModalProps {
  isOpen: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SetPrimaryAddressModal = ({
  isOpen,
  isSaving,
  onClose,
  onConfirm,
}: ISetPrimaryAddressModalProps) => (
  <Modal
    isOpen={isOpen}
    onCancel={onClose}
    closable={!isSaving}
    title="Đặt làm địa chỉ mặc định?"
    titleClassName="text-xl"
    className="w-[420px]"
    footer={
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="px-5"
          onClick={onClose}
          disabled={isSaving}
        >
          Hủy
        </Button>
        <Button
          size="sm"
          className="px-5"
          onClick={onConfirm}
          loading={isSaving}
        >
          Đặt mặc định
        </Button>
      </div>
    }
  >
    <p className="text-sm text-dark-500">
      Địa chỉ này sẽ được điền sẵn ở bước thanh toán.
    </p>
  </Modal>
);

export default SetPrimaryAddressModal;
