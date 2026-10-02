"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import StatusScreen from "@/components/ui/StatusScreen";
import { CloudOfflineIllustration } from "@/components/ui/StatusIllustrations";
import { PATH } from "@/constants/paths";

interface PageErrorProps {
  reset: () => void;
}

const PageError = ({ reset }: PageErrorProps) => {
  return (
    <StatusScreen
      illustration={<CloudOfflineIllustration />}
      title="Không tải được trang này"
      description="Máy chủ chưa phản hồi. Thử lại trong giây lát, hoặc quay về trang chủ tiếp tục mua sắm."
      actions={
        <>
          <Button size="lg" className="px-6" onClick={reset}>
            Thử lại
          </Button>
          <Link href={PATH.HOME}>
            <Button size="lg" variant="outline" className="px-6">
              Về trang chủ
            </Button>
          </Link>
        </>
      }
    />
  );
};

export default PageError;
