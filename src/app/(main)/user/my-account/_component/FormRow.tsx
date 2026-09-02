import { ReactNode } from "react";

interface IFormRowProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
}

// Hàng form "label trái — control phải" (đã chốt); dưới md xếp dọc label trên input.
// Cột input cap 560px cho ngang với 1 ô của lưới 2 cột bên khối thông tin — thả tự do
// thì ô mật khẩu dài gần 1000px ở màn 1920.
const FormRow = ({ label, htmlFor, children }: IFormRowProps) => {
  return (
    <div className="grid gap-1.5 md:grid-cols-[160px_minmax(0,560px)] md:gap-4">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-dark-500 md:pt-3.5"
      >
        {label}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  );
};

export default FormRow;
