// Tách tiêu đề banner thành phần thường + phần nhấn (in nghiêng màu clay ở Hero).
// < 3 từ → không nhấn. Vế sau dấu phẩy cuối ≤ 3 từ → nhấn cả vế (giữ nguyên cụm như
// "bước chân vững"); còn lại nhấn 2 từ cuối (3 từ → 1 từ cuối).
const MAX_CLAUSE_WORDS = 3;

export function titleSplit(title: string): {
  lead: string;
  accent: string | null;
} {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length < 3) return { lead: words.join(" "), accent: null };

  const lastComma = words.findLastIndex((word) => word.endsWith(","));
  const clauseWords = words.length - 1 - lastComma;
  const accentCount =
    lastComma >= 0 && clauseWords > 0 && clauseWords <= MAX_CLAUSE_WORDS
      ? clauseWords
      : words.length >= 4
        ? 2
        : 1;

  return {
    lead: words.slice(0, -accentCount).join(" "),
    accent: words.slice(-accentCount).join(" "),
  };
}
