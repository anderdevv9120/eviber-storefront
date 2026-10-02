"use client";

import PageError from "@/components/organisms/PageError";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ reset }: ErrorPageProps) {
  return <PageError reset={reset} />;
}
