import { notFound } from "next/navigation";

// Trang playground nội bộ — không tồn tại trên production
export default function UIKitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return children;
}
