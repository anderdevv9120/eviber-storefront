import { SVGProps } from "react";

/**
 * Hình QR cách điệu cho ô xem trước ở checkout — 3 ô định vị thật + module cố định, không phải
 * mã quét được (mã thật chỉ sinh sau khi tạo đơn). Màu nhạt hơn QR thật để đọc là "sắp có".
 */
export default function QrPreview(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 21 21" aria-hidden {...props}>
      <path d="M0 0h7v7h-7z" className="fill-primary" />
      <path d="M1 1h5v5h-5z" className="fill-white" />
      <path d="M2 2h3v3h-3z" className="fill-primary" />
      <path d="M14 0h7v7h-7z" className="fill-primary" />
      <path d="M15 1h5v5h-5z" className="fill-white" />
      <path d="M16 2h3v3h-3z" className="fill-primary" />
      <path d="M0 14h7v7h-7z" className="fill-primary" />
      <path d="M1 15h5v5h-5z" className="fill-white" />
      <path d="M2 16h3v3h-3z" className="fill-primary" />
      <path
        className="fill-primary-300"
        d="M9 0h1v1h-1zM10 0h1v1h-1zM13 0h1v1h-1zM9 1h1v1h-1zM10 1h1v1h-1zM13 1h1v1h-1zM8 2h1v1h-1zM10 2h1v1h-1zM13 2h1v1h-1zM7 3h1v1h-1zM10 3h1v1h-1zM13 3h1v1h-1zM7 4h1v1h-1zM10 4h1v1h-1zM11 4h1v1h-1zM7 5h1v1h-1zM9 5h1v1h-1zM10 5h1v1h-1zM12 5h1v1h-1zM13 5h1v1h-1zM7 6h1v1h-1zM9 6h1v1h-1zM12 6h1v1h-1zM0 7h1v1h-1zM3 7h1v1h-1zM4 7h1v1h-1zM6 7h1v1h-1zM7 7h1v1h-1zM8 7h1v1h-1zM12 7h1v1h-1zM19 7h1v1h-1zM20 7h1v1h-1zM1 8h1v1h-1zM2 8h1v1h-1zM11 8h1v1h-1zM12 8h1v1h-1zM13 8h1v1h-1zM14 8h1v1h-1zM15 8h1v1h-1zM18 8h1v1h-1zM20 8h1v1h-1zM0 9h1v1h-1zM3 9h1v1h-1zM9 9h1v1h-1zM12 9h1v1h-1zM13 9h1v1h-1zM14 9h1v1h-1zM19 9h1v1h-1zM0 10h1v1h-1zM1 10h1v1h-1zM2 10h1v1h-1zM3 10h1v1h-1zM7 10h1v1h-1zM9 10h1v1h-1zM10 10h1v1h-1zM12 10h1v1h-1zM13 10h1v1h-1zM14 10h1v1h-1zM15 10h1v1h-1zM17 10h1v1h-1zM18 10h1v1h-1zM19 10h1v1h-1zM0 11h1v1h-1zM1 11h1v1h-1zM2 11h1v1h-1zM4 11h1v1h-1zM5 11h1v1h-1zM9 11h1v1h-1zM13 11h1v1h-1zM14 11h1v1h-1zM15 11h1v1h-1zM17 11h1v1h-1zM18 11h1v1h-1zM19 11h1v1h-1zM20 11h1v1h-1zM0 12h1v1h-1zM3 12h1v1h-1zM8 12h1v1h-1zM17 12h1v1h-1zM6 13h1v1h-1zM10 13h1v1h-1zM17 13h1v1h-1zM18 13h1v1h-1zM8 14h1v1h-1zM10 14h1v1h-1zM11 14h1v1h-1zM13 14h1v1h-1zM14 14h1v1h-1zM17 14h1v1h-1zM18 14h1v1h-1zM19 14h1v1h-1zM7 15h1v1h-1zM9 15h1v1h-1zM12 15h1v1h-1zM14 15h1v1h-1zM15 15h1v1h-1zM16 15h1v1h-1zM19 15h1v1h-1zM20 15h1v1h-1zM8 16h1v1h-1zM9 16h1v1h-1zM11 16h1v1h-1zM12 16h1v1h-1zM13 16h1v1h-1zM18 16h1v1h-1zM19 16h1v1h-1zM20 16h1v1h-1zM7 17h1v1h-1zM8 17h1v1h-1zM9 17h1v1h-1zM12 17h1v1h-1zM14 17h1v1h-1zM15 17h1v1h-1zM16 17h1v1h-1zM19 17h1v1h-1zM9 18h1v1h-1zM12 18h1v1h-1zM13 18h1v1h-1zM14 18h1v1h-1zM15 18h1v1h-1zM19 18h1v1h-1zM20 18h1v1h-1zM7 19h1v1h-1zM8 19h1v1h-1zM13 19h1v1h-1zM15 19h1v1h-1zM19 19h1v1h-1zM20 19h1v1h-1zM9 20h1v1h-1zM10 20h1v1h-1zM16 20h1v1h-1zM17 20h1v1h-1zM18 20h1v1h-1zM19 20h1v1h-1z"
      />
    </svg>
  );
}
