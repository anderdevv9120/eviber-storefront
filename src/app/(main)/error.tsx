"use client";

import PageError from "@/components/organisms/PageError";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Boundary cụm (main): giữ Header/Footer của layout cha, chỉ vùng nội dung đổi
export default function MainError({ reset }: ErrorPageProps) {
  return <PageError reset={reset} />;
}
