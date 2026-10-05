import { ReactNode, useRef, useEffect, useId, KeyboardEvent } from "react";
import Button from "@/components/ui/Button";
import Portal from "@/components/ui/Portal";
import { cn } from "@/config/utils";
import { XMark } from "@/components/icons";

interface ModalProps {
  isOpen?: boolean;
  isShowFooter?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  // false khi đang lưu/xóa: X mờ + disabled, overlay và Escape không đóng
  closable?: boolean;
  title?: string;
  titleClassName?: string;
  // false: body không cuộn riêng (bỏ cả .scrollbarStyle vì class đó tự đặt overflow)
  // — form có Dropdown (listbox absolute) cần vậy để listbox không bị cắt; khung ngoài vẫn cuộn
  bodyScrollable?: boolean;
  okText?: string;
  cancelText?: string;
  className?: string;
  children?: ReactNode;
  footer?: ReactNode;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

const Modal = ({
  isOpen,
  isShowFooter = true,
  cancelText,
  okText,
  onCancel,
  closable = true,
  onOk,
  children,
  title,
  titleClassName,
  bodyScrollable = true,
  className,
  footer,
  ariaLabelledBy,
  ariaDescribedBy,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalId = useId();

  const handleCancel = () => {
    if (!isOpen || !closable) return;
    onCancel?.();
  };

  const handleOk = () => {
    onOk?.();
  };

  // Click ra ngoài được xử lý bởi lớp overlay (onMouseDown) bên dưới,
  // không dùng thêm useClickOutside để tránh gọi onCancel hai lần.

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => modalRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <Portal>
      <div
        className={cn(
          "fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300",
          isOpen
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy || `${modalId}-title`}
        aria-describedby={ariaDescribedBy || `${modalId}-description`}
      >
        <div
          className={cn(
            "fixed inset-0 bg-dark-300 bg-opacity-40 backdrop-blur-sm transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onMouseDown={handleCancel}
          aria-hidden="true"
        />

        <div
          ref={modalRef}
          className={cn(
            "bg-white rounded-lg shadow-lg p-5 z-50 w-[520px] max-h-full overflow-auto mx-3 transform transition-all duration-300 ease-out outline-none",
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-75",
            className
          )}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div className="flex justify-between items-center mb-4">
            <h2
              id={`${modalId}-title`}
              className={cn("text-2xl font-semibold", titleClassName)}
            >
              {title || "Modal"}
            </h2>
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Close modal"
              disabled={!closable}
              className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <XMark className="w-6 h-6 transition-transform duration-300 hover:rotate-90 text-primary-400" />
            </button>
          </div>

          <div
            id={`${modalId}-description`}
            className={cn(
              "pr-1",
              bodyScrollable
                ? "overflow-auto scrollbarStyle"
                : "overflow-visible"
            )}
          >
            {children}
          </div>

          <div className="mt-4">
            {isShowFooter &&
              (footer ? (
                footer
              ) : (
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={handleCancel}
                    variant="outlined"
                    type="button"
                    className="px-4 py-1"
                  >
                    {cancelText || "Cancel"}
                  </Button>
                  <Button onClick={handleOk} className="px-6 py-1">
                    {okText || "Ok"}
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Portal>
  );
};

Modal.displayName = "Modal";
export default Modal;
