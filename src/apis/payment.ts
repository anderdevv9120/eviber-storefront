import axiosRequest from "@/config/axios";

/** STK nhận chuyển khoản của shop — nguồn duy nhất là env BE, không hardcode ở FE */
export const getBankTransferAccount = (signal?: AbortSignal) => {
  // Khối chuyển khoản tự render trạng thái lỗi tại chỗ (giữ nội dung + hướng liên hệ)
  return axiosRequest.get("/payments/bank-transfer-account", {
    signal,
    toastError: false,
  });
};

const paymentAPI = { getBankTransferAccount };

export default paymentAPI;
