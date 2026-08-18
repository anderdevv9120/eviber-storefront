import { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { PATH } from "@/constants/paths";

// Layout Style D (chốt tại tasks/phase1/audit/ui-auth-layout.html):
// nền gradient Pine nhẹ, logo standalone về home, card viền trên accent primary.
const AuthLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-7 bg-gradient-to-b from-primary-50 to-white to-55% px-4 py-10">
      <Link
        href={PATH.HOME}
        aria-label="Về trang chủ"
        className="rounded text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
      >
        <Logo />
      </Link>
      <main className="w-full max-w-[460px] rounded-3xl bg-white px-5 py-10 shadow-auth-card sm:px-12">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
