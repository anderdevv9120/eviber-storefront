import type { Metadata } from "next";
import GoogleCallbackHandler from "./_component/GoogleCallbackHandler";

export const metadata: Metadata = {
  title: "Đăng nhập với Google",
  robots: { index: false, follow: true },
};

const GoogleCallback = () => {
  return <GoogleCallbackHandler />;
};

export default GoogleCallback;
