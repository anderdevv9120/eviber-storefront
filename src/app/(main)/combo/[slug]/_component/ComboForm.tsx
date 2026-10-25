"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IComboDetail } from "@/@types/Combo.type";
import { addComboToCart } from "@/apis/cart";
import { getCheckoutSettings } from "@/apis/order";
import Button from "@/components/ui/Button";
import Counter from "@/components/ui/Counter";
import ItemPrice from "@/components/ui/ItemPrice";
import { useRefundPolicy } from "@/components/ui/RefundPolicyNotice";
import SvgIcon from "@/components/ui/SvgIcon";
import { PATH } from "@/constants/paths";
import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import { comboTotals, isPicksComplete, maxComboQuantity } from "@/utils/combo";
import { infoToast, successToast } from "@/utils/toast";
import ComboPieceBlock from "./ComboPieceBlock";

export default function ComboForm({ combo }: { combo: IComboDetail }) {
  const router = useRouter();
  const refundPolicy = useRefundPolicy();
  const [picks, setPicks] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      combo.items
        .filter((item) => item.mode === "CHOOSE")
        .map((item) => [
          item.productId,
          item.variants.find(
            (variant) => variant.inventoryCount >= item.quantity
          )?.id ?? "",
        ])
    )
  );
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const variantsById = Object.fromEntries(
    combo.items.flatMap((item) =>
      item.variants.map((variant) => [variant.id, variant])
    )
  );
  const maxQuantity = maxComboQuantity(combo.items, picks, variantsById);
  const complete = isPicksComplete(combo.items, picks);
  const selectedPieces = combo.items.map((item) => {
    const id = item.mode === "LOCKED" ? item.variantId : picks[item.productId];
    const variant = id ? item.variants.find((v) => v.id === id) : undefined;
    return variant
      ? {
          price: variant.price,
          originalPrice: variant.originalPrice,
          quantity: item.quantity,
        }
      : null;
  });
  const hasValidPicks =
    complete && selectedPieces.every((piece) => piece !== null);
  const totals = hasValidPicks
    ? comboTotals(
        combo.pricing,
        selectedPieces.filter((piece) => piece !== null)
      )
    : null;
  const listPrice = hasValidPicks
    ? selectedPieces.reduce(
        (sum, piece) =>
          sum + (piece?.originalPrice ?? 0) * (piece?.quantity ?? 0),
        0
      )
    : combo.originalPrice;
  const outOfStock =
    combo.availability === "OUT_OF_STOCK" || (hasValidPicks && maxQuantity < 1);
  const canBuy = !outOfStock && hasValidPicks && !isSubmitting;

  const setPick = (productId: string, variantId: string) => {
    setPicks((previous) => ({ ...previous, [productId]: variantId }));
    setQuantity(1);
  };

  const submit = async (buyNow: boolean) => {
    if (!canBuy || quantity > maxQuantity) return;
    setIsSubmitting(true);
    try {
      await addComboToCart({
        comboId: combo._id,
        quantity,
        picks: combo.items.map((item) => ({
          productId: item.productId,
          variantId:
            item.mode === "LOCKED" ? item.variantId! : picks[item.productId],
        })),
      });
      await useCartStore.getState().fetchCart(true);
      if (!buyNow) {
        successToast("Thêm vào giỏ hàng thành công");
        return;
      }

      const guestBlocked =
        !useAppStore.getState().profile._id &&
        (await getCheckoutSettings().then(
          (response) => response?.data?.allowGuestCheckout === false,
          () => false
        ));
      if (guestBlocked) {
        infoToast(
          "Vui lòng đăng nhập để đặt hàng. Giỏ hàng của bạn được giữ nguyên."
        );
        router.push(PATH.LOGIN);
        return;
      }
      router.push(PATH.CART);
    } catch {
      // Axios interceptor shows the error; leave the current page and selections intact.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <p className="mt-3 text-sm font-semibold text-primary-700">
        COMBO · {combo.pieceCount} món
      </p>
      {outOfStock ? (
        <p className="mt-6 font-semibold text-dark-500">Hết hàng</p>
      ) : (
        <div className="mt-6 flex flex-wrap items-baseline gap-2">
          {!totals && combo.hasChoice && <span className="text-sm">Từ</span>}
          <ItemPrice
            price={totals?.combo ?? combo.price ?? undefined}
            originalPrice={listPrice ?? undefined}
            currentPriceClass="text-xl md:text-2xl font-bold text-terracotta"
          />
        </div>
      )}

      <div className="mt-6 space-y-4">
        {combo.items.map((item) => (
          <ComboPieceBlock
            key={item.productId}
            item={item}
            selectedVariantId={
              item.mode === "LOCKED"
                ? (item.variantId ?? undefined)
                : picks[item.productId]
            }
            onPick={(variantId) => setPick(item.productId, variantId)}
            refundPolicy={refundPolicy}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-6">
        <span className="text-sm font-bold">Số lượng combo</span>
        <Counter
          key={combo.items
            .map((item) => picks[item.productId] ?? item.variantId)
            .join(":")}
          defaultValue={1}
          min={1}
          max={Math.max(maxQuantity, 1)}
          onChangeCount={setQuantity}
          disabled={!canBuy}
          variant="pill"
        />
        {!outOfStock && complete && (
          <span className="text-sm text-dark-500">Còn {maxQuantity} combo</span>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-stretch gap-4 mt-4 lg:mt-6">
        <Button
          size="lg"
          className="min-w-0 sm:flex-1 px-2 sm:order-2"
          onClick={() => submit(true)}
          disabled={!canBuy}
          loading={isSubmitting}
        >
          Mua ngay
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="min-w-0 sm:flex-1 px-2 sm:order-1"
          onClick={() => submit(false)}
          disabled={!canBuy}
        >
          <SvgIcon name="cart-outline" className="w-5 h-5 shrink-0" />
          Thêm combo vào giỏ
        </Button>
      </div>
    </>
  );
}
