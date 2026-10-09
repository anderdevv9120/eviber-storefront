import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PATH } from "@/constants/paths";
import { POLICY_SLUGS } from "@/constants/storeContent";
import { formatDate } from "@/utils/formatTime";
import { loadPolicy } from "./loadPolicy";
import styles from "./PolicyContent.module.scss";

// 4 slug cố định — slug lạ 404 ngay, không gọi BE; revalidate 300 kế thừa (main)/layout
export const dynamicParams = false;
export const generateStaticParams = () =>
  POLICY_SLUGS.map((slug) => ({ slug }));

// Dedupe giữa generateMetadata và Page trong cùng lượt render
const fetchPolicy = cache(loadPolicy);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchPolicy(slug);
  if (!page) return {};
  return {
    title: page.title,
    alternates: { canonical: `${PATH.POLICY}/${slug}` },
  };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await fetchPolicy(slug);
  if (!page) notFound();

  return (
    <div className="container-base container-narrow py-10 md:py-14">
      <article>
        <h1 className="text-2xl md:text-3xl font-extrabold text-dark-800">
          {page.title}
        </h1>
        {page.updatedAt && (
          <p className="mt-2 text-sm text-dark-500">
            Cập nhật lần cuối: {formatDate(page.updatedAt, "DD/MM/YYYY")}
          </p>
        )}
        <div
          className={`${styles.prose} mt-8 text-dark-700`}
          // HTML đã sanitize ở BE lúc lưu (allowlist sanitize-html)
          dangerouslySetInnerHTML={{ __html: page.contentHtml }}
        />
      </article>
    </div>
  );
}
