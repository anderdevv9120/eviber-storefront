"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addComboToCart, addToCart } from "@/apis/cart";
import { IOrderProduct } from "@/@types/Order.type";
import type { IOrderCombo } from "@/@types/Combo.type";
import { ApiError } from "@/config/axios";
import { PATH } from "@/constants/paths";
import { useCartStore } from "@/store/useCartStore";
import { errorToast, successToast, warningToast } from "@/utils/toast";
import { planReorder } from "./reorder-plan";

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

  const reorder = async (
    orderId: string,
    products: IOrderProduct[],
    combos?: IOrderCombo[]
  ) => {
    if (reorderingId) return;
    setReorderingId(orderId);

    const skipped: string[] = [];
    let added = 0;
    try {
      for (const entry of planReorder(products, combos)) {
        if (entry.kind === "combo") {
          try {
            const { comboId, quantity, picks } = entry;
            await addComboToCart(
              { comboId, quantity, picks },
              { silent: true }
            );
            added += 1;
            continue;
          } catch (error: unknown) {
            if (!isItemLevelError(error)) throw error;
          }
        }

        const fallback = entry.kind === "combo" ? entry.fallback : [entry];
        for (const { variantId, quantity } of fallback) {
          try {
            await addToCart({ variantId, quantity }, { silent: true });
            added += 1;
          } catch (error: unknown) {
            if (!isItemLevelError(error)) throw error;
            skipped.push(
              products.find((product) => product.variantId === variantId)
                ?.productNameAtOrder ?? "một sản phẩm"
            );
          }
        }
      }

      if (added === 0) {
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
    } catch {
      errorToast("Không thêm được vào giỏ hàng, vui lòng thử lại.");
    } finally {
      setReorderingId(undefined);
    }
  };

  return { reorder, reorderingId };
};
