import { getDetailProduct } from "@/apis/product";
import dynamicImport from "next/dynamic";
import Carousel from "@/components/ui/Carousel";
import ProductHeader from "./_component/ProductHeader";
import ProductContactSocial from "./_component/ProductContactSocial";
import ProductPolicy from "@/components/ui/ProductPolicy";
import ProductForm from "./_component/ProductForm";
import { Clock, Group, HeartInsurance } from "@/components/icons";
import ProductDescription from "./_component/ProductDescription";
import Review from "@/components/ui/Review";
import { dataReview } from "@/mocks/fetchData";
import PageNotFound from "@/components/organisms/PageNotFound";
import { IProductDetailResponse } from "@/@types/Product.type";

export const dynamic = "force-dynamic"; // Đảm bảo API luôn fetch từ server, không cache

const FlashDeal = dynamicImport(() => import("@/components/ui/FlashDeal"), {
  ssr: false,
});

const policies = [
  {
    Icon: HeartInsurance,
    title: "Cam kết 1 đổi 1",
    description: "Trong 30 ngày",
  },
  {
    Icon: Group,
    title: "100% Uy tín",
    description: "Các loại gỗ cao cấp",
  },
  {
    Icon: Clock,
    title: "Giao hàng toàn quốc",
    description: "Giao hàng nhanh chóng",
  },
];

export default async function Product({
  params,
}: {
  params: { slug: string };
}) {
  const productId = params.slug?.split("-").pop();
  let res;
  try {
    res = await getDetailProduct(productId || "");
  } catch {
    return <PageNotFound />;
  }

  if (!res?.data) return <PageNotFound />;

  const productDetail: IProductDetailResponse = res.data;
  const isInStock = productDetail.variants.some((v) => v.inventoryCount > 0);

  return (
    <div className="container-base">
      <div className="mt-10 block xl:flex">
        <Carousel
          images={productDetail?.images}
          isShowImageBottom
          className="mb-8 xl:w-1/2"
        />

        <div className="mb-8 xl:px-8 xl:w-1/2">
          <ProductHeader
            title={productDetail?.name}
            rating={5}
            numberReview={50}
            totalSold={147}
            status={isInStock ? "Còn hàng" : "Hết hàng"}
          />

          <div className="h-16">
            <FlashDeal
              endTime={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
            />
          </div>

          <ProductForm
            options={productDetail.options}
            variants={productDetail.variants}
          />
          <ProductContactSocial totalFavorite={345} />
        </div>
      </div>

      <ProductPolicy policies={policies} />
      <ProductDescription descriptionHtml={productDetail?.description ?? ""} />
      <Review dataReviews={dataReview} />
    </div>
  );
}
