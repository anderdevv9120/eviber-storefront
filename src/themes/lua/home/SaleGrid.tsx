import Link from "next/link";
import type { IProductListItem } from "@/@types/Product.type";
import { getProducts } from "@/apis/product";
import CardItem from "@/components/ui/CardItem";
import { PATH } from "@/constants/paths";

// Mockup .grid4: 4 cột × 2 hàng ở desktop. page.tsx chỉ fetch 5 (1 hàng của classic/rosier, không đổi được)
// → lua tự lấy 8; lỗi/rỗng thì dùng lại 5 món page.tsx đã có
const SALE_GRID_SIZE = 8;

async function fetchSaleProducts(
  fallback: IProductListItem[]
): Promise<IProductListItem[]> {
  try {
    const response = await getProducts({
      onSale: true,
      pageSize: SALE_GRID_SIZE,
    });
    const data: IProductListItem[] = response?.data?.data ?? [];
    return data.length > 0 ? data : fallback;
  } catch {
    return fallback;
  }
}

// Mockup #sale: .head (tiêu đề trái max 13ch, mô tả đáy phải) + .grid4 + .more (nút giữa, cuối section)
const SaleGrid = async ({ fallback }: { fallback: IProductListItem[] }) => {
  const products = await fetchSaleProducts(fallback);

  return (
    <section aria-labelledby="sale-h" className="container-base my-16 md:my-24">
      <div className="mb-[clamp(28px,3.5vw,48px)] flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
        <h2 id="sale-h" className="type-display-section max-w-[13ch] text-deep">
          Công sở — dấu ấn của nàng
        </h2>
        <p className="type-section-sub text-dark-500">
          Đang khuyến mãi: những thiết kế công sở được yêu thích nhất, giá tốt
          trong tuần này.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-[clamp(14px,1.8vw,24px)] md:grid-cols-4">
        {products.slice(0, SALE_GRID_SIZE).map((item) => (
          <CardItem key={item._id} productItem={item} />
        ))}
      </div>

      <div className="mt-[clamp(32px,4vw,48px)] flex justify-center">
        <Link
          href={PATH.COLLECTION}
          className="inline-flex items-center rounded-btn border-[1.5px] border-primary-700 bg-primary-700 px-[26px] py-[13px] text-[13px] font-semibold uppercase tracking-[.08em] text-white transition-colors hover:border-primary-800 hover:bg-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
        >
          Xem tất cả ưu đãi
        </Link>
      </div>
    </section>
  );
};

export default SaleGrid;
