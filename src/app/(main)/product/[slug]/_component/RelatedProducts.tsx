import CardItemSlider from "@/components/ui/CardItemSlider";
import { IProductListItem } from "@/@types/Product.type";

interface RelatedProductsProps {
  products: IProductListItem[];
}

const RelatedProducts = ({ products }: RelatedProductsProps) => {
  // Đồng quy ước home: section rỗng ẩn hẳn, không để khung trống
  if (products.length === 0) return null;

  return (
    <section>
      <h2 className="type-display-sub font-display mb-5">
        Sản phẩm cùng danh mục
      </h2>
      <CardItemSlider dataProduct={products} />
    </section>
  );
};

export default RelatedProducts;
