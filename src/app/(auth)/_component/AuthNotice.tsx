import { ReactNode } from "react";
import { cn } from "@/config/utils";
import { Check, Spin, XMark } from "@/components/icons";

type AuthNoticeStatus = "success" | "error" | "loading";

interface AuthNoticeProps {
  status: AuthNoticeStatus;
  title: string;
  description?: string;
  children?: ReactNode;
}

// Panel trạng thái dùng chung cụm auth (verify email, gửi link reset,
// đăng ký thành công, google callback...) — children là khu vực action.
const AuthNotice = ({
  status,
  title,
  description,
  children,
}: AuthNoticeProps) => {
  return (
    <div
      className="flex flex-col items-center py-2 text-center"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "mb-5 flex h-14 w-14 items-center justify-center rounded-full",
          status === "success" && "bg-primary-50 text-primary",
          status === "error" && "bg-red-100 text-red-600",
          status === "loading" && "bg-white-100 text-primary"
        )}
      >
        {status === "loading" && <Spin className="h-7 w-7 animate-spin" />}
        {status === "success" && <Check className="h-7 w-7" />}
        {status === "error" && <XMark className="h-7 w-7" />}
      </div>
      <h2 className="text-lg font-bold text-dark">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-dark-500">{description}</p>
      )}
      {children && (
        <div className="mt-6 flex w-full flex-col gap-3">{children}</div>
      )}
    </div>
  );
};

export default AuthNotice;
