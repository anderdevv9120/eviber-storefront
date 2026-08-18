import { ICartProductPayload, ICartRemovePayload } from "@/@types/Cart.type";
import axiosRequest from "@/config/axios";

export const getCart = () => {
  return axiosRequest.get("/carts");
};

export const addToCart = (data: ICartProductPayload) => {
  return axiosRequest.post("/carts/add-to-cart", data);
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
