import type { Metadata } from "next";
import AuthHeading from "../_component/AuthHeading";
import LoginForm from "./_component/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description:
    "Đăng nhập tài khoản CLOTHES để tiếp tục hành trình mua sắm của riêng bạn.",
};

const Login = () => {
  return (
    <>
      <AuthHeading
        title="Đăng nhập"
        description="Tiếp tục hành trình mua sắm của riêng bạn."
      />
      <LoginForm />
    </>
  );
};

export default Login;
