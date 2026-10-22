"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { IComboDetailItem } from "@/@types/Combo.type";
import type { IProductVariant } from "@/@types/Product.type";
import ItemPrice from "@/components/ui/ItemPrice";
import { PATH } from "@/constants/paths";
import { variantsForQuantity } from "@/utils/combo";
import VariantSelector from "../../../product/[slug]/_component/VariantSelector";

interface ComboPieceBlockProps {
  item: IComboDetailItem;
  selectedVariantId: string | undefined;
  onPick: (variantId: string) => void;
}

export default function ComboPieceBlock({
  item,
  selectedVariantId,
  onPick,
}: ComboPieceBlockProps) {
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const variant = item.variants.find((v) => v.id === selectedVariantId);
    return Object.fromEntries(
      (variant?.attributeValues ?? []).map((av) => [av.attributeId, av._id])
    );
  });
  const variant = item.variants.find(
    (v) =>
      v.id === (item.mode === "LOCKED" ? item.variantId : selectedVariantId)
  );

  const handleSelect = (attributeId: string, valueId: string) => {
    const next = { ...selected, [attributeId]: valueId };
    setSelected(next);
    const matchingVariant = variantsForQuantity(
      item.variants,
      item.quantity
    ).find(
      (candidate) =>
        candidate.inventoryCount > 0 &&
        item.product.options.every((option) =>
          candidate.attributeValues.some(
            (av) =>
              av.attributeId === option.attributeId._id &&
              av._id === next[option.attributeId._id]
          )
        )
    );
    onPick(matchingVariant?.id ?? "");
  };

  const lockedLabels = (variant: IProductVariant) =>
    variant.attributeValues
      .map((av) => {
        const name = item.product.options.find(
          (option) => option.attributeId._id === av.attributeId
        )?.attributeId.name;
        return name ? `${name}: ${av.value}` : av.value;
      })
      .join(" · ") || "Mặc định";

  return (
    <div className="rounded-xl border border-white-200 p-4">
      <div className="flex gap-3">
        {item.product.image ? (
          <Image
            src={item.product.image}
            alt={item.product.name}
            width={80}
            height={80}
            className="w-20 h-20 shrink-0 rounded-lg object-cover bg-white-100"
          />
        ) : (
          <div className="w-20 h-20 shrink-0 rounded-lg bg-white-100" />
        )}
        <div className="min-w-0 flex-1">
          <Link
            href={`${PATH.PRODUCT}/${item.product.slug}`}
            className="font-semibold text-dark-800 hover:text-primary-700"
          >
            {item.product.name}
          </Link>
          {item.quantity > 1 && (
            <span className="ml-2 text-sm text-dark-500">×{item.quantity}</span>
          )}
          {variant && (
            <div className="mt-1">
              <ItemPrice price={variant.price} currentPriceClass="text-sm" />
            </div>
          )}
        </div>
      </div>
      {item.mode === "LOCKED" ? (
        <p className="mt-3 text-sm text-dark-500">
          Cố định: {variant ? lockedLabels(variant) : "Mặc định"}
        </p>
      ) : (
        <div className="mt-4">
          <VariantSelector
            options={item.product.options}
            variants={variantsForQuantity(item.variants, item.quantity)}
            selected={selected}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}
