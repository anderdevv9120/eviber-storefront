import { SVGProps } from "react";

// Logo placeholder (định hướng thương hiệu chưa chốt) — thay nội dung SVG
// tại đây là đổi logo mọi nơi đang dùng, không cần sửa chỗ khác.
const Logo = ({ ...rest }: SVGProps<SVGSVGElement>) => (
  <svg
    width="150"
    height="28"
    viewBox="0 0 150 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...rest}
  >
    <text
      x="0"
      y="22"
      fontSize="22"
      fontWeight="800"
      letterSpacing="2"
      fill="currentColor"
    >
      CLOTHES<tspan fill="var(--logo-dot, var(--color-primary))">.</tspan>
    </text>
  </svg>
);

export default Logo;
