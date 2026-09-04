import { ReactNode } from "react";
import { cn } from "@/config/utils";

interface ChoiceCardProps {
  name: string;
  value: string;
  checked: boolean;
  onSelect: (value: string) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Nội dung chỉ mở khi card đang được chọn (note chuyển khoản, slot QR...) */
  children?: ReactNode;
  className?: string;
  testId?: string;
}

/** Radio card dùng chung cho địa chỉ đã lưu + phương thức thanh toán */
export default function ChoiceCard({
  name,
  value,
  checked,
  onSelect,
  title,
  description,
  children,
  className,
  testId,
}: ChoiceCardProps) {
  return (
    <label
      data-testid={testId}
      className={cn(
        "relative block p-4 border rounded-xl cursor-pointer transition-colors",
        checked
          ? "border-primary bg-primary-50"
          : "border-white-600 hover:border-dark-200",
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={() => onSelect(value)}
          // Phủ cả card thay vì sr-only: click/tap bất kỳ đâu là chọn, và test
          // automation click thẳng vào input được (sr-only 1px bị wrapper chặn)
          className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0"
        />
        <span
          aria-hidden
          className={cn(
            "relative mt-0.5 w-5 h-5 shrink-0 rounded-full border-[1.5px] bg-white transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary-100",
            checked
              ? "border-primary after:absolute after:inset-1 after:rounded-full after:bg-primary"
              : "border-dark-300"
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{title}</div>
          {description && (
            <div className="text-sm text-dark-500 mt-0.5">{description}</div>
          )}
        </div>
      </div>
      {checked && children && <div className="mt-3">{children}</div>}
    </label>
  );
}
