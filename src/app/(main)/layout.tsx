import Footer from "@/layouts/Footer";
import Header from "@/layouts/Header";
import { ReactNode } from "react";
import Authentication from "@/components/organisms/Authentication";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 flex-col pt-12 xl:pt-[74px]">{children}</div>
      <Authentication />
      <Footer />
    </div>
  );
}
