export const formatPrice = (price: number) => {
  return (price || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
};

export const calculateCurrentPrice = (price: number, discount: number) => {
  return parseFloat(((price || 0) * (1 - (discount || 0) / 100)).toFixed(0));
};

export const calculateDiscountPrice = (price: number, currentPrice: number) => {
  return parseFloat(((price || 0) - (currentPrice || 0)).toFixed(0));
};

/**
 * Nhãn dòng giảm giá của đơn đã đặt — đọc snapshot lúc mua, KHÔNG đọc quy tắc mã hiện tại.
 * Đơn cũ không có couponDiscountType vẫn rơi về mã + % như trước.
 */
export const formatCouponDiscountLabel = (checkoutInfo: {
  couponCode?: string;
  couponDiscountType?: "percentage" | "fixed_amount";
  couponDiscountValue?: number;
  couponDiscountPercentage?: number;
}) => {
  const {
    couponCode,
    couponDiscountType,
    couponDiscountValue,
    couponDiscountPercentage,
  } = checkoutInfo;
  if (!couponCode) return "Giảm giá";
  const percentage =
    couponDiscountType === "percentage"
      ? couponDiscountValue
      : couponDiscountPercentage;
  let amount = "";
  if (couponDiscountType === "fixed_amount") {
    if (couponDiscountValue !== undefined)
      amount = formatPrice(couponDiscountValue);
  } else if (percentage !== undefined) amount = `${percentage}%`;
  return amount
    ? `Mã giảm giá ${couponCode} · ${amount}`
    : `Mã giảm giá ${couponCode}`;
};
