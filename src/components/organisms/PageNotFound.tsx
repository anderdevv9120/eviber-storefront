import Link from "next/link";
import Button from "@/components/ui/Button";
import StatusScreen from "@/components/ui/StatusScreen";
import { NotFoundIllustration } from "@/components/ui/StatusIllustrations";
import { PATH } from "@/constants/paths";

const PageNotFound = () => {
  return (
    <StatusScreen
      illustration={<NotFoundIllustration />}
      title="Không tìm thấy trang"
      description="Đường dẫn có thể đã đổi hoặc sản phẩm không còn bán. Bộ sưu tập vẫn ở đây."
      actions={
        <>
          <Link href={PATH.HOME}>
            <Button size="lg" className="px-6">
              Về trang chủ
            </Button>
          </Link>
          <Link href={PATH.COLLECTION}>
            <Button size="lg" variant="outline" className="px-6">
              Xem sản phẩm
            </Button>
          </Link>
        </>
      }
    />
  );
};

export default PageNotFound;
