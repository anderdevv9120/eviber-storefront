import { afterEach, describe, expect, it, vi } from "vitest";
import { getParams } from "./getParams";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getParams", () => {
  it("trả null khi không có window (môi trường SSR)", () => {
    expect(getParams("token")).toBeNull();
  });

  it("đọc đúng giá trị param từ query string", () => {
    vi.stubGlobal("window", { location: { search: "?token=abc&id=42" } });
    expect(getParams("token")).toBe("abc");
    expect(getParams("id")).toBe("42");
  });

  it("trả null khi param không tồn tại trong query", () => {
    vi.stubGlobal("window", { location: { search: "?token=abc" } });
    expect(getParams("missing")).toBeNull();
  });
});
