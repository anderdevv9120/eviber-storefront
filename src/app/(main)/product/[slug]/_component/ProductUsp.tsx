import SvgIcon from "@/components/ui/SvgIcon";

// Rút 4 → 3 cam kết sức nặng nhất với quyết định mua (chốt A-F5b):
// bỏ "bảo hành đường may" — niche, đã có trong mô tả sản phẩm
const USP_ITEMS = [
  "Giao toàn quốc 2–4 ngày",
  "Đổi size miễn phí 30 ngày",
  "Thanh toán khi nhận (COD)",
];

// Check-list cam kết NGAY DƯỚI CTA trong cột mua (chốt A-F5b /ui-audit vòng 2 —
// thay band icon full-width giữa header và Mô tả). Mỗi item 1 hàng riêng
// (user chốt — 3 item flex-wrap thành 2+1 lệch; không tìm được item thứ 4
// đủ giá trị để về lưới 2×2). Margin dọc thuộc caller.
const ProductUsp = () => {
  return (
    <div className="flex flex-col gap-2.5">
      {USP_ITEMS.map((item) => (
        <span
          key={item}
          className="flex items-center gap-2 text-sm text-dark-600 font-semibold"
        >
          <SvgIcon
            name="check-outline"
            className="w-4 h-4 shrink-0 text-primary-700"
          />
          {item}
        </span>
      ))}
    </div>
  );
};

export default ProductUsp;
