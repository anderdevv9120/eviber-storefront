import type { ReactNode } from "react";
import Link from "next/link";
import type { IOrderCombo } from "@/@types/Combo.type";
import { cn } from "@/config/utils";
import { PATH } from "@/constants/paths";
import type { GroupedOrderLine } from "@/utils/combo";
import { formatPrice } from "@/utils/formatPrice";
import OrderProductLine from "./OrderProductLine";

interface OrderComboBlockProps {
  combo: IOrderCombo;
  pieces: Extract<GroupedOrderLine, { kind: "combo" }>["pieces"];
  showSku?: boolean;
  className?: string;
  reviewAction?: (productId: string) => ReactNode;
}

export default function OrderComboBlock({
  combo,
  pieces,
  showSku,
  className,
  reviewAction,
}: OrderComboBlockProps) {
  const pieceCount = pieces.reduce((sum, piece) => sum + piece.quantity, 0);

  return (
    <div
      className={cn(
        "rounded-lg border border-white-300 bg-white-50 p-3",
        className
      )}
    >
      <p className="text-xs font-bold text-primary-700">
        COMBO · {pieceCount / combo.quantity} món
      </p>
      <div className="mt-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {combo.slugAtOrder ? (
            <Link
              href={`${PATH.COMBO}/${combo.slugAtOrder}`}
              className="font-semibold hover:underline"
            >
              {combo.nameAtOrder}
            </Link>
          ) : (
            <p className="font-semibold">{combo.nameAtOrder}</p>
          )}
          <p className="text-sm text-dark-400">×{combo.quantity}</p>
        </div>
        <p className="shrink-0 font-bold">{formatPrice(combo.totalAtOrder)}</p>
      </div>
      <div className="mt-2 border-t border-white-300">
        {pieces.map((piece) => (
          <OrderProductLine
            key={piece.variantId}
            product={{ ...piece.product, quantity: piece.quantity }}
            lineTotal={piece.lineTotal}
            showSku={showSku}
            className="border-t border-white-200 py-3 first:border-t-0"
            reviewAction={reviewAction?.(piece.productId)}
          />
        ))}
      </div>
    </div>
  );
}
