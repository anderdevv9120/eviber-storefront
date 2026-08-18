import type { Metadata } from "next";
import ResetPasswordForm from "./_component/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
  robots: { index: false, follow: true },
};

const NewPassword = () => {
  return <ResetPasswordForm />;
};

export default NewPassword;
