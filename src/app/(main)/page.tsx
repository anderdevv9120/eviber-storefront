import { images } from "@/mocks/fetchData";
import { Percent, Guarantee, Exchange } from "@/components/icons";
import Carousel from "@/components/ui/Carousel";
import Category from "@/components/ui/Category";
import CardItemSlider from "@/components/ui/CardItemSlider";
import ProductPolicy from "../../components/ui/ProductPolicy";
import ContentSlider from "@/components/ui/ContentSlider";
import CustomerReview from "@/components/ui/CustomerReview";
import { getProducts } from "@/apis/product";
import { IProductListItem } from "@/@types/Product.type";

const policiesHome = [
  {
    Icon: Guarantee,
    title: "Chất lượng đảm bảo",
    description: "Bảo hành đến 730 ngày",
  },
  {
    Icon: Percent,
    title: "Thanh toán",
    description: "Giảm giá thanh toán online",
  },
  {
    Icon: Exchange,
    title: "Đổi trả dễ dàng",
    description: "Miễn phí đổi trả trong 7 ngày",
  },
];

export default async function Home() {
  let products: IProductListItem[] = [];
  try {
    const res = await getProducts();
    products = res?.data?.data || [];
  } catch {
    products = [];
  }

  return (
    <main>
      <Carousel images={images} timeAnimation={5000} className="w-full" />

      <div className="container-base">
        <Category />

        <ContentSlider title="Sản phẩm khuyến mãi" href="#">
          <CardItemSlider dataProduct={products} />
        </ContentSlider>
        <ContentSlider title="Bán chạy" href="#">
          <CardItemSlider dataProduct={products} />
        </ContentSlider>
        <ContentSlider title="Kệ tủ" href="#">
          <CardItemSlider dataProduct={products} />
        </ContentSlider>
        <ProductPolicy policies={policiesHome} />
        <ContentSlider title="Phản hồi từ khách hàng" href="#">
          <CustomerReview />
        </ContentSlider>
      </div>
    </main>
  );
}

export const metadata = {
  title: "Trang chủ",
  description:
    "Khám phá bộ sưu tập mới và ưu đãi dành riêng cho thành viên tại CLOTHES.",
};
