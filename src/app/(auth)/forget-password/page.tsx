import type { Metadata } from "next";
import { fetchStoreSettingsCached } from "@/apis/home.server";
import ForgotPasswordForm from "./_component/ForgotPasswordForm";

// Layout (auth) không khai revalidate: thiếu dòng này cờ emailAvailable đóng băng từ lúc build
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  robots: { index: false, follow: true },
};

const ForgetPassword = async () => {
  const { emailAvailable, contact } = await fetchStoreSettingsCached();
  return (
    <ForgotPasswordForm emailAvailable={emailAvailable} contact={contact} />
  );
};

export default ForgetPassword;
