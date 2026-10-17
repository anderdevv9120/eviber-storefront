import { SVGProps } from "react";
import { BRAND } from "@/config/brand";

// Logo placeholder (định hướng thương hiệu chưa chốt) — thay nội dung SVG
// tại đây là đổi logo mọi nơi đang dùng, không cần sửa chỗ khác.
// ponytail: ước lượng 20px/ký tự theo số ký tự, tên rất dài/rộng có thể lệch — thay bằng asset logo thật cho từng brand
const WIDTH = Math.max(150, BRAND.name.length * 20);

const Logo = ({ ...rest }: SVGProps<SVGSVGElement>) => (
  <svg
    width={WIDTH}
    height="28"
    viewBox={`0 0 ${WIDTH} 28`}
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
      {BRAND.name}
      <tspan fill="var(--logo-dot, var(--color-primary))">.</tspan>
    </text>
  </svg>
);

export default Logo;
