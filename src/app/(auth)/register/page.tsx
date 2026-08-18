import type { Metadata } from "next";
import RegisterForm from "./_component/RegisterForm";

export const metadata: Metadata = {
  title: "Tạo tài khoản",
  description:
    "Tạo tài khoản CLOTHES để bắt đầu hành trình mua sắm của riêng bạn.",
};

const Register = () => {
  return <RegisterForm />;
};

export default Register;
