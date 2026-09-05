import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Plus, RightArrow } from "@/components/icons";
import { cn } from "@/config/utils";
import { IAddress } from "@/@types/Address.type";
import { PATH } from "@/constants/paths";
import { MAX_ADDRESSES } from "@/constants/address";
import { formatAddress } from "@/utils/formatAddress";
import ChoiceCard from "./ChoiceCard";
import { FIELD_LABEL } from "./checkoutForm";

const COLLAPSED_COUNT = 3;

interface SavedAddressListProps {
  addresses: IAddress[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddClick: () => void;
}

export default function SavedAddressList({
  addresses,
  selectedId,
  onSelect,
  onAddClick,
}: SavedAddressListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mặc định lên đầu, còn lại mới nhất trước (BE trả theo thứ tự thêm)
  const sorted = [...addresses].sort((a, b) => {
    if (a.primary !== b.primary) return a.primary ? -1 : 1;
    return addresses.indexOf(b) - addresses.indexOf(a);
  });
  const hiddenCount = Math.max(sorted.length - COLLAPSED_COUNT, 0);
  const selectedIndex = sorted.findIndex((a) => a._id === selectedId);
  // Card đang chọn nằm ngoài 3 đầu → ép mở và ẩn nút Thu gọn (thu gọn sẽ giấu card đang chọn)
  const isPinnedOpen = selectedIndex >= COLLAPSED_COUNT;
  const isOpen = isExpanded || hiddenCount === 0 || isPinnedOpen;
  const visible = isOpen ? sorted : sorted.slice(0, COLLAPSED_COUNT);

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className={FIELD_LABEL}>Địa chỉ giao hàng</span>
        <Link
          href={PATH.MY_ADDRESS}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-1.5 pb-2 text-sm font-semibold text-primary-700 hover:text-primary-500 transition-colors"
        >
          Quản lý địa chỉ
          <RightArrow className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      </div>
      <div className="flex flex-col gap-3" data-testid="saved-address-list">
        {visible.map((address) => {
          const id = address._id ?? "";
          return (
            <ChoiceCard
              key={id}
              name="savedAddress"
              value={id}
              checked={id === selectedId}
              onSelect={onSelect}
              title={
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {address.name}
                  <span className="font-medium text-dark-500 text-sm">
                    {address.phoneNumber}
                  </span>
                  {address.primary && (
                    <span className="inline-flex items-center h-5 px-2 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                      Mặc định
                    </span>
                  )}
                </span>
              }
              description={formatAddress(address)}
            />
          );
        })}
        {hiddenCount > 0 && !isPinnedOpen && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isOpen}
            // Visual 32px nhưng hit-area 40px qua after: (rule hit-area element nhỏ)
            className="relative self-center inline-flex items-center gap-1 h-8 px-2 text-sm font-semibold text-primary-700 hover:text-primary-500 transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 after:absolute after:-inset-y-1 after:-inset-x-2"
          >
            {isOpen ? "Thu gọn" : `Xem thêm ${hiddenCount} địa chỉ`}
            <ChevronDown
              className={cn(
                "w-3 h-3 mt-px transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
        )}
        {addresses.length < MAX_ADDRESSES && (
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center justify-center gap-2 h-12 rounded-xl border border-dashed border-dark-200 text-sm font-semibold text-primary-700 hover:border-primary-500 hover:bg-primary-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
          >
            <Plus className="w-4 h-4" />
            Thêm địa chỉ mới
          </button>
        )}
      </div>
    </div>
  );
}
