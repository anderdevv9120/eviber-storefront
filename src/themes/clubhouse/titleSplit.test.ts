import { describe, expect, it } from "vitest";
import { titleSplit } from "./titleSplit";

describe("titleSplit", () => {
  it("không tách tiêu đề dưới 3 từ", () => {
    expect(titleSplit("Vợt mới")).toEqual({ lead: "Vợt mới", accent: null });
    expect(titleSplit("Pickleball")).toEqual({
      lead: "Pickleball",
      accent: null,
    });
  });

  it("3 từ → nhấn từ cuối", () => {
    expect(titleSplit("Trọn bộ pickleball")).toEqual({
      lead: "Trọn bộ",
      accent: "pickleball",
    });
  });

  it("từ 4 từ trở lên → nhấn 2 từ cuối", () => {
    expect(titleSplit("Trọn bộ đồ chơi pickleball")).toEqual({
      lead: "Trọn bộ đồ",
      accent: "chơi pickleball",
    });
  });

  it("vế sau dấu phẩy cuối ngắn (≤ 3 từ) → nhấn cả vế", () => {
    expect(titleSplit("Chơi chậm, chơi chất.")).toEqual({
      lead: "Chơi chậm,",
      accent: "chơi chất.",
    });
    expect(titleSplit("Giày đế bám sân, bước chân vững")).toEqual({
      lead: "Giày đế bám sân,",
      accent: "bước chân vững",
    });
  });

  it("vế sau dấu phẩy dài → quay về 2 từ cuối", () => {
    expect(
      titleSplit("Ra sân tự tin, tư vấn chọn vợt cho mọi trình độ")
    ).toEqual({
      lead: "Ra sân tự tin, tư vấn chọn vợt cho mọi",
      accent: "trình độ",
    });
  });

  it("dấu phẩy ở từ cuối → không coi là vế, quay về 2 từ cuối", () => {
    expect(titleSplit("Một hai ba bốn,")).toEqual({
      lead: "Một hai",
      accent: "ba bốn,",
    });
  });

  it("gom khoảng trắng thừa", () => {
    expect(titleSplit("  Trọn   bộ \n đồ  chơi ")).toEqual({
      lead: "Trọn bộ",
      accent: "đồ chơi",
    });
  });

  it("chuỗi rỗng → không nhấn", () => {
    expect(titleSplit("   ")).toEqual({ lead: "", accent: null });
  });
});
