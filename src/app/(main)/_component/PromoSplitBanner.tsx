import Image from "next/image";
import Link from "next/link";
import { cn } from "@/config/utils";
import type { IPromoTile, PromoTileTheme } from "@/@types/StoreContent.type";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

// GĐ2: href gắn query lọc sẵn của collection (onSale / mới nhất) khi collection
// hỗ trợ URL searchParams — hiện dẫn về collection chung.
// Class Tailwind phải nằm trong src/app để được generate — map theme ở đây, không ở constants
export const TILE_THEME: Record<
  PromoTileTheme,
  { overlayClass: string; isDark: boolean }
> = {
  light: {
    overlayClass:
      "bg-gradient-to-r from-primary-100/95 via-primary-50/70 to-transparent",
    isDark: false,
  },
  dark: {
    overlayClass:
      "bg-gradient-to-r from-dark-800/80 via-dark-800/40 to-transparent",
    isDark: true,
  },
};

const PromoSplitBanner = ({ tiles }: { tiles: IPromoTile[] }) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {tiles.map((tile, index) => {
        const { overlayClass, isDark } = TILE_THEME[tile.theme];
        return (
          <Link
            key={index}
            href={tile.href}
            className="relative block overflow-hidden rounded-xl group/tile aspect-[2.5/1] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2"
          >
            <Image
              src={resolveImageUrl(tile.image)}
              alt={tile.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover/tile:scale-105"
            />
            <div className={cn("absolute inset-0", overlayClass)} />

            <div className="absolute inset-y-0 left-6 md:left-8 flex flex-col justify-center max-w-[260px]">
              <h3
                className={cn(
                  "text-lg md:text-2xl font-extrabold",
                  isDark ? "text-white" : "text-dark-800"
                )}
              >
                {tile.title}
              </h3>
              <p
                className={cn(
                  "mt-1 mb-3 text-xs md:text-sm",
                  isDark ? "text-white-300" : "text-dark-500"
                )}
              >
                {tile.description}
              </p>
              <span
                className={cn(
                  "inline-flex items-center w-max h-9 md:h-10 px-5 rounded-xl text-sm font-bold transition-colors",
                  isDark
                    ? "bg-white text-dark-800 group-hover/tile:bg-white-100"
                    : "bg-primary text-white group-hover/tile:bg-primary-700"
                )}
              >
                {tile.ctaLabel}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default PromoSplitBanner;
