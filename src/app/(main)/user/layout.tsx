import { ReactNode } from "react";
import { Metadata } from "next";
import UserSidebar from "@/components/ui/UserSidebar";

// Trang tài khoản yêu cầu đăng nhập — không cho search engine index
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const ProfileLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <div className="container-base min-h-screen py-8 md:py-10">
      <div className="flex flex-col gap-6 xl:flex-row xl:gap-8">
        <UserSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
};

export default ProfileLayout;
