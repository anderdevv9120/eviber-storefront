import type { Metadata } from "next";
import ForgotPasswordForm from "./_component/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  robots: { index: false, follow: true },
};

const ForgetPassword = () => {
  return <ForgotPasswordForm />;
};

export default ForgetPassword;
