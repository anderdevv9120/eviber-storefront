import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import RegisterForm from "./_component/RegisterForm";

export const metadata: Metadata = {
  title: "Tạo tài khoản",
  description: `Tạo tài khoản ${BRAND.name} để bắt đầu hành trình mua sắm của riêng bạn.`,
};

const Register = () => {
  return <RegisterForm />;
};

export default Register;
