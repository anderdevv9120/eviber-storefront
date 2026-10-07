"use client";

import { useEffect } from "react";
import type { IOrderProduct } from "@/@types/Order.type";
import ReviewForm from "@/app/(main)/product/[slug]/_component/ReviewForm";

export default function OrderReviews({
  products,
}: {
  products: IOrderProduct[];
}) {
  useEffect(() => {
    const target = document.getElementById(window.location.hash.slice(1));
    if (target?.id.startsWith("review-")) target.scrollIntoView();
  }, []);

  const uniqueProducts = new Map(
    products.map((product) => [product.productId, product])
  );

  return (
    <section className="mt-4 rounded-xl border border-white-300 bg-white p-4 sm:p-5">
      <h2 className="text-sm font-bold">Đánh giá sản phẩm trong đơn</h2>
      {Array.from(uniqueProducts.values()).map((product) => (
        <div
          key={product.productId}
          id={`review-${product.productId}`}
          className="mt-5 scroll-mt-24"
        >
          <h3 className="font-semibold">
            {product.productNameAtOrder ?? "Sản phẩm"}
          </h3>
          <ReviewForm productId={product.productId} />
        </div>
      ))}
    </section>
  );
}
