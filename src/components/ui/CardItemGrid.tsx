import CardItem from "./CardItem";
import { IProductListItem } from "@/@types/Product.type";
import { cn } from "@/config/utils";

interface CardItemGridProps {
  dataProduct: IProductListItem[];
}

// Grid tĩnh cho rail Khuyến mãi, đúng 1 hàng ở md (3) / lg (5); mobile 2 hàng × 2 —
// phần còn lại qua "Xem tất cả". 5 cột chỉ từ lg — ở md card ~130px là quá chật
const VISIBLE_CLASS = ["", "", "", "md:hidden lg:block", "hidden lg:block"];

const CardItemGrid = ({ dataProduct }: CardItemGridProps) => {
  if (dataProduct.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 md:gap-4 pb-2">
      {dataProduct.slice(0, VISIBLE_CLASS.length).map((item, index) => (
        <div key={item._id} className={cn(VISIBLE_CLASS[index])}>
          <CardItem productItem={item} />
        </div>
      ))}
    </div>
  );
};

export default CardItemGrid;
