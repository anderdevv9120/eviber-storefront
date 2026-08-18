"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeInvisible } from "@/components/icons";
import Input, { InputProps } from "./Input";

interface InputPasswordProps extends Omit<InputProps, "icon"> {}

const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(
  ({ ...props }, ref) => {
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false);

    const togglePasswordVisibility = () =>
      setIsShowPassword((prevState) => !prevState);

    const passwordIcon = (
      <button
        type="button"
        aria-label={isShowPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        className="cursor-pointer text-dark-200 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
        onClick={togglePasswordVisibility}
      >
        {isShowPassword ? <EyeInvisible /> : <Eye />}
      </button>
    );

    return (
      <Input
        type={isShowPassword ? "text" : "password"}
        icon={passwordIcon}
        ref={ref}
        {...props}
      />
    );
  }
);

export default InputPassword;
