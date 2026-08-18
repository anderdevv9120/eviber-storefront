/**
 * Shape chung của mọi response list phân trang từ BE.
 * Đối chiếu: x-ecommerce-backend/src/share/common/app.interface.ts (IResponseList)
 */
export interface IResponseList<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPage: number;
}
