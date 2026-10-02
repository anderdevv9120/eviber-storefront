"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/apis/cart";
import { IOrderProduct } from "@/@types/Order.type";
import { ApiError } from "@/config/axios";
import { PATH } from "@/constants/paths";
import { useCartStore } from "@/store/useCartStore";
import { errorToast, successToast, warningToast } from "@/utils/toast";

const MAX_NAMES_IN_TOAST = 2;

const listNames = (names: string[]) => {
  const shown = names.slice(0, MAX_NAMES_IN_TOAST).join(", ");
  const rest = names.length - MAX_NAMES_IN_TOAST;
  return rest > 0 ? `${shown} và ${rest} sản phẩm khác` : shown;
};

/**
 * Lỗi của RIÊNG một món (hết hàng, không đủ số lượng, variant đã gỡ bán) thì bỏ qua món đó
 * rồi đi tiếp. Lỗi hạ tầng (mất mạng, hết phiên, 500) phải dừng cả lượt — không thì mất mạng
 * bị báo thành "tất cả sản phẩm đều không mua lại được", sai hẳn nguyên nhân.
 */
const isItemLevelError = (error: unknown) =>
  error instanceof ApiError && (error.status === 400 || error.status === 404);

/**
 * Mua lại: thêm lại sản phẩm của một đơn cũ vào giỏ.
 *
 * BE không có API thêm nhiều variant một lượt nên gọi tuần tự — và cố tình KHÔNG
 * dừng ở món đầu tiên lỗi: đơn càng cũ thì khả năng vài món đã hết hàng hoặc gỡ bán
 * càng cao, chặn cả đơn vì một món là hỏng luôn thao tác. Món lỗi gom lại báo một lượt.
 */
export const useReorder = () => {
  const [reorderingId, setReorderingId] = useState<string>();
  const router = useRouter();
  const fetchCart = useCartStore((state) => state.fetchCart);

  const reorder = async (orderId: string, products: IOrderProduct[]) => {
    if (reorderingId) return;
    setReorderingId(orderId);

    const skipped: string[] = [];
    try {
      for (const product of products) {
        try {
          await addToCart(
            { variantId: product.variantId, quantity: product.quantity },
            { silent: true }
          );
        } catch (error: unknown) {
          if (!isItemLevelError(error)) {
            errorToast("Không thêm được vào giỏ hàng, vui lòng thử lại.");
            return;
          }
          skipped.push(product.productNameAtOrder ?? "một sản phẩm");
        }
      }

      if (skipped.length === products.length) {
        errorToast(
          "Sản phẩm trong đơn này hiện chưa mua lại được, chưa thêm được gì vào giỏ."
        );
        return;
      }

      // force: refetch sau mutation, badge Header phải khớp giỏ mới trước khi điều hướng
      await fetchCart(true);

      if (skipped.length > 0) {
        warningToast(
          `Đã thêm vào giỏ. ${listNames(skipped)} hiện chưa mua lại được.`
        );
      } else {
        successToast("Đã thêm vào giỏ hàng");
      }
      router.push(PATH.CART);
    } finally {
      setReorderingId(undefined);
    }
  };

  return { reorder, reorderingId };
};
