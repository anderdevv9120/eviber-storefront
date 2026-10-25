"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import InputRadio from "@/components/ui/InputRadio";
import {
  CANCELLATION_REASONS,
  CancellationReasonValue,
} from "@/constants/orderStatus";
import type { ICancelOrderPayload } from "@/@types/Order.type";

const NOTE_MAX_LENGTH = 500;

interface CancelReasonModalProps {
  isOpen: boolean;
  isCancelling?: boolean;
  onClose: () => void;
  onSubmit: (payload: ICancelOrderPayload) => void;
}

/**
 * Bước 2 của luồng hủy đơn: khách chọn lý do (như Shopee), "other" phải mô tả thêm.
 * Đơn chỉ bị hủy khi bấm "Hủy đơn" — bấm ngoài/giữ đơn đóng modal, không có tác động gì.
 */
const CancelReasonModal = ({
  isOpen,
  isCancelling,
  onClose,
  onSubmit,
}: CancelReasonModalProps) => {
  const [reason, setReason] = useState<CancellationReasonValue | undefined>(
    undefined
  );
  const [note, setNote] = useState("");

  const noteRequired = reason === "other";
  const canSubmit =
    reason !== undefined && (!noteRequired || note.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ reason, ...(noteRequired ? { note: note.trim() } : {}) });
  };

  return (
    <Modal
      isOpen={isOpen}
      onCancel={onClose}
      closable={!isCancelling}
      title="Chọn lý do hủy đơn"
      titleClassName="text-xl"
      className="w-[440px]"
      ariaDescribedBy="cancel-reason-description"
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
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={isCancelling}
          >
            Hủy đơn
          </Button>
        </div>
      }
    >
      <div id="cancel-reason-description">
        <p className="text-sm text-dark-500">
          Lý do của bạn giúp shop cải thiện dịch vụ. Đơn sẽ bị hủy ngay sau khi
          gửi.
        </p>
        <InputRadio
          className="mt-4 w-full"
          name="cancel-reason"
          isVertical
          options={CANCELLATION_REASONS.map(({ value, label }) => ({
            value,
            label,
          }))}
          value={reason}
          // forwardRef bọc generic của InputRadio nên callback rộng ra BaseValueInputType —
          // options chỉ chứa các giá trị reason nên ép về lại là an toàn
          onChange={(value) => setReason(value as CancellationReasonValue)}
        />
        {noteRequired && (
          <div className="mt-4">
            <label
              htmlFor="cancel-reason-note"
              className="mb-1 block text-sm font-semibold text-dark-500"
            >
              Vui lòng cho chúng tôi biết lý do của bạn
            </label>
            <textarea
              id="cancel-reason-note"
              data-testid="cancel-reason-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={NOTE_MAX_LENGTH}
              rows={3}
              placeholder="Nhập lý do hủy đơn (bắt buộc)"
              className="w-full rounded-lg border border-white-300 px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-100"
            />
            <p className="mt-1 text-right text-xs text-dark-300">
              {note.length}/{NOTE_MAX_LENGTH}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CancelReasonModal;
