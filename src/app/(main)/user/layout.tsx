import { ReactNode } from "react";
import { Metadata } from "next";
import UserSidebar from "@/components/ui/UserSidebar";

// Trang tài khoản yêu cầu đăng nhập — không cho search engine index
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const ProfileLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <div className="flex flex-col min-h-screen container-base py-10">
      <div className="md:flex gap-0">
        <UserSidebar />
        <div className="flex-1 md:mt-0 mt-50">{children}</div>
      </div>
    </div>
  );
};

export default ProfileLayout;
