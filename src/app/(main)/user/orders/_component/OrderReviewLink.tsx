"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { IReviewEligibility } from "@/@types/Review.type";
import { getReviewEligibility } from "@/apis/review";
import { reviewRequestScope } from "@/app/(main)/product/[slug]/_component/ReviewForm.helpers";
import { PATH } from "@/constants/paths";
import { useAppStore } from "@/store/useAppStore";

export function reviewActionLabel(eligibility: IReviewEligibility | null) {
  if (eligibility?.review) return "Xem đánh giá";
  return eligibility?.canCreate ? "Đánh giá ngay" : null;
}

interface Props {
  productId: string;
  orderNumber: string;
}

export default function OrderReviewLink(props: Props) {
  const customerId = useAppStore((state) => state.profile._id);
  return customerId ? (
    <CustomerReviewLink
      key={`${props.productId}:${customerId}`}
      {...props}
      customerId={customerId}
    />
  ) : null;
}

function CustomerReviewLink({
  productId,
  orderNumber,
  customerId,
}: Props & { customerId: string }) {
  const [eligibility, setEligibility] = useState<IReviewEligibility | null>(
    null
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const scope = reviewRequestScope(customerId);
    getReviewEligibility(productId, scope.signal)
      .then(({ data }) => {
        if (!scope.signal.aborted) setEligibility(data);
      })
      .catch(() => {
        if (!scope.signal.aborted) setFailed(true);
      });
    return () => scope.dispose();
  }, [productId, customerId]);

  const label = failed ? "Thử lại đánh giá" : reviewActionLabel(eligibility);
  return label ? (
    <Link
      href={`${PATH.ORDER}/${encodeURIComponent(orderNumber)}#review-${productId}`}
      className="mt-2 inline-flex min-h-11 items-center rounded-md border border-primary-600 px-3 text-sm font-semibold text-primary-700 hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600"
    >
      {label}
    </Link>
  ) : null;
}
