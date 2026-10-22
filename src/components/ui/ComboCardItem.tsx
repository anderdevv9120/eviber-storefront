import Image from "next/image";
import ItemPrice from "@/components/ui/ItemPrice";
import { IComboCard } from "@/@types/Combo.type";
import { PATH } from "@/constants/paths";
import { formatPrice } from "@/utils/formatPrice";
import Link from "next/link";

const ComboCardItem = ({ combo }: { combo: IComboCard }) => {
  const isOutOfStock = combo.price == null;
  const savings =
    combo.price != null && combo.originalPrice != null
      ? combo.originalPrice - combo.price
      : 0;

  return (
    <Link
      href={`${PATH.COMBO}/${combo.slug}`}
      className="group/card block bg-white rounded-xl border border-white-200 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden cursor-pointer"
    >
      <div className="relative overflow-hidden bg-white-100 aspect-[3/4]">
        {combo.image ? (
          <Image
            src={combo.image}
            alt={combo.name}
            width={400}
            height={533}
            className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover/card:scale-105"
          />
        ) : (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
            {combo.pieceImages.slice(0, 4).map((src, index) => (
              <Image
                key={`${src}-${index}`}
                src={src}
                alt=""
                width={200}
                height={267}
                className="w-full h-full min-h-0 object-cover mix-blend-multiply"
              />
            ))}
          </div>
        )}
        <div className="absolute inset-x-2.5 top-2.5 flex flex-wrap items-center gap-2 pointer-events-none">
          <div className="px-2 py-0.5 text-xs font-semibold text-white bg-primary-700 rounded-md">
            COMBO · {combo.pieceCount} món
          </div>
          {combo.pricing.mode === "PERCENT" && (
            <div className="px-2 py-0.5 text-xs font-semibold text-white bg-terracotta rounded-md">
              -{combo.pricing.value}%
            </div>
          )}
          {isOutOfStock && (
            <div className="px-2 py-0.5 text-xs font-semibold text-white bg-dark-300 rounded-md">
              Hết hàng
            </div>
          )}
        </div>
      </div>

      <div className="px-2.5 md:px-3.5 pt-3 pb-3.5">
        <h3
          title={combo.name}
          className="text-sm font-semibold text-dark-800 line-clamp-1 mb-2 group-hover/card:text-primary-700 transition-colors"
        >
          {combo.name}
        </h3>

        {isOutOfStock ? (
          <p className="text-sm text-dark-500">Hết hàng</p>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline gap-x-1.5">
              {combo.hasChoice && <span className="text-sm">Từ</span>}
              <ItemPrice
                price={combo.price ?? undefined}
                originalPrice={combo.originalPrice ?? undefined}
                currentPriceClass="text-base md:text-lg font-bold text-dark-800"
                priceClass="text-xs"
              />
              {combo.originalPrice != null &&
                combo.originalPrice === combo.price && (
                  <span className="text-dark-500 text-xs line-through">
                    {formatPrice(combo.originalPrice)}
                  </span>
                )}
            </div>
            {combo.originalPrice != null && (
              <p className="mt-2.5 text-xs text-terracotta">
                Tiết kiệm {formatPrice(savings)}
              </p>
            )}
          </>
        )}
      </div>
    </Link>
  );
};

export default ComboCardItem;
