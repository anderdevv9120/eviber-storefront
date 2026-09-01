import CardItem from "./CardItem";
import { IProductListItem } from "@/@types/Product.type";
import { cn } from "@/config/utils";

interface CardItemGridProps {
  dataProduct: IProductListItem[];
}

// Grid tĩnh thay slider cho rail Khuyến mãi: desktop (lg) tối đa 10 (2 hàng × 5),
// mobile/tablet chỉ hiện 6 để section không quá dài — phần còn lại qua "Xem tất cả".
// 5 cột chỉ từ lg — ở md card ~130px là quá chật cho tên + meta + nút
const CardItemGrid = ({ dataProduct }: CardItemGridProps) => {
  if (dataProduct.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 md:gap-x-4 md:gap-y-5 gap-2.5 pb-2">
      {dataProduct.slice(0, 10).map((item, index) => (
        <div key={item._id} className={cn(index >= 6 && "hidden lg:block")}>
          <CardItem productItem={item} />
        </div>
      ))}
    </div>
  );
};

export default CardItemGrid;
