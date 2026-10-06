// Upload CMS lưu path tương đối (`/images/x.jpg`) do backend serve — next/image sẽ tìm trên host
// storefront nếu không ghép origin API. URL tuyệt đối (seed Unsplash) giữ nguyên.
export function resolveImageUrl(
  src: string,
  apiUrl: string = process.env.NEXT_PUBLIC_API_URL ?? ""
): string {
  if (/^https?:\/\//i.test(src) || !apiUrl) return src;
  return new URL(src, apiUrl).toString();
}
