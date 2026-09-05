import { IAddress } from "@/@types/Address.type";

// Địa chỉ 2 cấp không có huyện — bỏ phần rỗng để không lòi dấu phẩy thừa.
// Dùng chung my-address và checkout.
export const formatAddress = (
  address: Pick<IAddress, "specificAddress" | "ward" | "district" | "city">
) =>
  [address.specificAddress, address.ward, address.district, address.city]
    .filter(Boolean)
    .join(", ");
