import Image from "next/image";
import Link from "next/link";
import { PATH } from "@/constants/paths";
import { cn } from "@/config/utils";

// GĐ2: href gắn query lọc sẵn của collection (onSale / mới nhất) khi collection
// hỗ trợ URL searchParams — hiện dẫn về collection chung.
const PROMO_TILES = [
  {
    title: "Ưu đãi đến 50%",
    description: "Hàng trăm item đang giảm giá — số lượng có hạn.",
    ctaLabel: "Mua ngay",
    href: PATH.COLLECTION,
    image:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1200&auto=format&fit=crop",
    overlayClass:
      "bg-gradient-to-r from-primary-100/95 via-primary-50/70 to-transparent",
    isDark: false,
  },
  {
    title: "Hàng mới về mỗi tuần",
    description: "Cập nhật thiết kế mới nhất của mùa này.",
    ctaLabel: "Khám phá",
    href: PATH.COLLECTION,
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop",
    overlayClass:
      "bg-gradient-to-r from-dark-800/80 via-dark-800/40 to-transparent",
    isDark: true,
  },
];

const PromoSplitBanner = () => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {PROMO_TILES.map((tile) => (
        <Link
          key={tile.title}
          href={tile.href}
          className="relative block overflow-hidden rounded-3xl group aspect-[2.5/1] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2"
        >
          <Image
            src={tile.image}
            alt={tile.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className={cn("absolute inset-0", tile.overlayClass)} />

          <div className="absolute inset-y-0 left-6 md:left-8 flex flex-col justify-center max-w-[260px]">
            <h3
              className={cn(
                "text-lg md:text-2xl font-extrabold",
                tile.isDark ? "text-white" : "text-dark-800"
              )}
            >
              {tile.title}
            </h3>
            <p
              className={cn(
                "mt-1 mb-3 text-xs md:text-sm",
                tile.isDark ? "text-white-300" : "text-dark-500"
              )}
            >
              {tile.description}
            </p>
            <span
              className={cn(
                "inline-flex items-center w-max h-9 md:h-10 px-5 rounded-full text-sm font-bold transition-colors",
                tile.isDark
                  ? "bg-white text-dark-800 group-hover:bg-white-100"
                  : "bg-primary text-white group-hover:bg-primary-700"
              )}
            >
              {tile.ctaLabel}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PromoSplitBanner;
