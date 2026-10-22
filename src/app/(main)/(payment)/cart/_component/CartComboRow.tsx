import Image from "next/image";
import Link from "next/link";
import type { ICartComboLine } from "@/@types/Combo.type";
import Counter from "@/components/ui/Counter";
import { TrashOutline } from "@/components/icons";
import { cn } from "@/config/utils";
import { PATH } from "@/constants/paths";
import { formatPrice } from "@/utils/formatPrice";
import { comboUnavailableReason } from "@/utils/cartAvailability";

interface CartComboRowProps {
  line: ICartComboLine;
  counterResetKey: number;
  onDeleteClick: (lineId: string) => void;
  onQuantityChange: (lineId: string, quantity: number) => void;
}

export default function CartComboRow({
  line,
  counterResetKey,
  onDeleteClick,
  onQuantityChange,
}: CartComboRowProps) {
  const reason = comboUnavailableReason(line);
  const name = line.name || "Combo không còn bán";
  const image = line.image || line.pieces[0]?.image;
  const nameNode = line.slug ? (
    <Link
      href={`${PATH.COMBO}/${line.slug}`}
      className="font-semibold line-clamp-2 hover:text-primary-700 transition-colors"
    >
      {name}
    </Link>
  ) : (
    <span className="font-semibold line-clamp-2">{name}</span>
  );

  return (
    <div
      data-testid="cart-combo"
      className={cn(
        "py-5 md:py-6 border-b border-white-500 border-dashed",
        !line.isAvailable && "opacity-60"
      )}
    >
      <div className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto] items-start gap-x-4 md:gap-x-5 gap-y-2">
        <div className="w-24 md:w-28 aspect-square rounded-xl overflow-hidden bg-white-100 row-span-2 md:row-span-1">
          {image && (
            <Image
              src={image}
              alt={name}
              width={112}
              height={112}
              className="w-full h-full object-cover mix-blend-multiply"
            />
          )}
        </div>
        <div className="min-w-0 flex flex-col items-start gap-1.5">
          <span className="bg-primary-100 text-primary-700 rounded-full px-2.5 py-0.5 text-xs font-bold">
            COMBO
          </span>
          {nameNode}
          <p className="text-sm text-dark-500">
            {formatPrice(line.price)} × {line.quantity}
          </p>
          <span className="text-base font-semibold text-dark-800">
            {formatPrice(line.price * line.quantity)}
          </span>
          {reason && (
            <p className="text-sm text-red">
              {reason} — không tính vào tổng tiền
            </p>
          )}
        </div>
        <div className="col-start-2 row-start-2 md:col-start-3 md:row-start-1 flex items-center justify-between md:justify-end gap-2 md:self-center">
          {line.isAvailable && (
            <Counter
              key={counterResetKey}
              variant="pill"
              size="sm-md"
              defaultValue={line.quantity}
              onChangeCount={(quantity) =>
                onQuantityChange(line.lineId, quantity)
              }
              min={1}
              max={line.availableQuantity}
            />
          )}
          <button
            type="button"
            aria-label="Xóa combo"
            data-testid="cart-combo-remove"
            onClick={() => onDeleteClick(line.lineId)}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-dark-400 hover:text-red hover:bg-white-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
          >
            <TrashOutline className="w-5 h-5" />
          </button>
        </div>
      </div>
      {line.pieces.length > 0 && (
        <div className="mt-4 ml-4 md:ml-8 border-l-2 border-white-500 pl-4 md:pl-5 flex flex-col gap-3">
          {line.pieces.map((piece) => {
            const attributes = piece.attributeValues
              .map((attribute) =>
                /^\d+$/.test(attribute.value)
                  ? `${attribute.name} ${attribute.value}`
                  : attribute.value
              )
              .filter(Boolean)
              .join(" · ");
            return (
              <div
                key={`${piece.productId}:${piece.variantId}`}
                className="flex items-center gap-3 text-sm"
              >
                {piece.image && (
                  <Image
                    src={piece.image}
                    alt={piece.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-lg bg-white-100 object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-2">
                    {piece.name} ×{piece.itemQuantity}
                  </p>
                  {attributes && (
                    <p className="text-xs text-dark-500">{attributes}</p>
                  )}
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-semibold">
                    {formatPrice(piece.lineTotal)}
                  </span>
                  <span className="text-xs text-dark-500 line-through">
                    {formatPrice(piece.originalPrice)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
