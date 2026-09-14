import { ICartProductPayload, ICartRemovePayload } from "@/@types/Cart.type";
import axiosRequest from "@/config/axios";

export const getCart = () => {
  // Fetch nền từ Header trên MỌI trang — toast lỗi global ở đây thành toast đỏ
  // vô nghĩa ngoài màn cart; CartView có error UI + nút Thử lại riêng
  return axiosRequest.get("/carts", { toastError: false });
};

/**
 * BE nhận quantity là DELTA — cộng dồn vào số lượng đang có trong giỏ, KHÔNG phải giá trị
 * tuyệt đối (muốn đặt số tuyệt đối thì dùng `updateQuantity`). Gọi hai lần là nhân đôi.
 *
 * silent: dùng cho Mua lại — thêm nhiều variant tuần tự, món lỗi được gom lại báo
 * một lượt nên không để interceptor toast từng lỗi một
 */
export const addToCart = (
  data: ICartProductPayload,
  options?: { silent?: boolean }
) => {
  return axiosRequest.post("/carts/add-to-cart", data, {
    toastError: !options?.silent,
  });
};

export const removeFromCart = (data: ICartRemovePayload) => {
  return axiosRequest.delete("/carts/remove-from-cart", { data });
};

/** BE nhận quantity TUYỆT ĐỐI (số lượng mới), không phải delta tăng/giảm */
export const updateQuantity = (data: ICartProductPayload) => {
  return axiosRequest.put("/carts/update-quantity", data);
};

const cartAPI = {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
};

export default cartAPI;
