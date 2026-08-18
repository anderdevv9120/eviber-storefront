export const formatPrice = (price: number) => {
  return (price || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
};

export const calculateCurrentPrice = (price: number, discount: number) => {
  return parseFloat(((price || 0) * (1 - (discount || 0) / 100)).toFixed(0));
};

export const calculateDiscountPrice = (price: number, currentPrice: number) => {
  return parseFloat(((price || 0) - (currentPrice || 0)).toFixed(0));
};
