import Footer from "@/layouts/Footer";
import theme from "@active-theme";
import { ReactNode } from "react";
import Authentication from "@/components/organisms/Authentication";
import {
  fetchCategoriesCached,
  fetchStoreSettingsCached,
} from "@/apis/home.server";

// Mức revalidate NỀN cho mọi route con chưa tự khai báo — thiếu là route static
// (collection/cart/user...) cache categories nav VĨNH VIỄN tại thời điểm build
export const revalidate = 300;

export default async function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [categories, storeSettings] = await Promise.all([
    fetchCategoriesCached(),
    fetchStoreSettingsCached(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <theme.Header categories={categories} />
      <div className="flex flex-1 flex-col">{children}</div>
      <Authentication />
      <theme.Footer settings={storeSettings} />
    </div>
  );
}
