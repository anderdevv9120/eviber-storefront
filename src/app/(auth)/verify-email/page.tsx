import type { Metadata } from "next";
import VerifyEmailForm from "./_component/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Xác nhận email",
  robots: { index: false, follow: true },
};

const VerifyEmail = () => {
  return <VerifyEmailForm />;
};

export default VerifyEmail;
