import { Metadata } from "next";
import { getProducts } from "@/apis/product";
import { fetchCategoriesCached } from "@/apis/home.server";
import { PATH } from "@/constants/paths";
import CollectionContent from "./_component/CollectionContent";
import {
  ICollectionQuery,
  ICollectionResult,
  parseCollectionQuery,
  toProductApiParams,
} from "./_component/collection.query";

interface CollectionPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

// SSR lần đầu theo URL; lỗi BE → null để CLIENT tự fetch lại khi mount
// (trả rỗng là user thấy "không có sản phẩm" sai bản chất, không có đường retry)
async function fetchInitialProducts(
  query: ICollectionQuery
): Promise<ICollectionResult | null> {
  try {
    const response = await getProducts(toProductApiParams(query));
    const list = response?.data;
    return {
      items: list?.data ?? [],
      total: list?.total ?? 0,
      totalPage: list?.totalPage ?? 1,
    };
  } catch {
    return null;
  }
}

// Trang đọc searchParams → Next tự render dynamic mỗi request, không khai revalidate
const Collection = async ({ searchParams }: CollectionPageProps) => {
  const query = parseCollectionQuery(searchParams);
  const [initialResult, categories] = await Promise.all([
    fetchInitialProducts(query),
    fetchCategoriesCached(),
  ]);

  return (
    <div className="container-base">
      <div className="pt-8 pb-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Tất cả sản phẩm</h1>

        <CollectionContent
          categories={categories}
          initialQuery={query}
          initialResult={initialResult}
        />
      </div>
    </div>
  );
};

export default Collection;

const TITLE = "Tất cả sản phẩm";
const DESCRIPTION = "Khám phá và tìm sản phẩm phù hợp với phong cách của bạn.";

// Canonical trỏ URL sạch — mỗi tổ hợp filter/sort/page là 1 biến thể trùng nội dung,
// không để index; title/description không sinh theo filter
const BASE_METADATA: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH.COLLECTION },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH.COLLECTION,
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Có từ khóa: title phản ánh từ khóa cho tab/history, nhưng noindex — trang kết quả
// search là vô hạn biến thể, canonical vẫn về /collection
export function generateMetadata({
  searchParams,
}: CollectionPageProps): Metadata {
  const { search } = parseCollectionQuery(searchParams);
  if (!search) return BASE_METADATA;

  const title = `Kết quả cho “${search}”`;
  return {
    ...BASE_METADATA,
    title,
    robots: { index: false, follow: true },
    openGraph: { ...BASE_METADATA.openGraph, title },
    twitter: { ...BASE_METADATA.twitter, title },
  };
}
