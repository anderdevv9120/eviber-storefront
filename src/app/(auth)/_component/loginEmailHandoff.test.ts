import { afterEach, describe, expect, it, vi } from "vitest";
import { rememberLoginEmail, takeLoginEmail } from "./loginEmailHandoff";

const memoryStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  };
};

describe("loginEmailHandoff", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("đọc đúng một lần: lần mở Login sau không bị điền email cũ", () => {
    vi.stubGlobal("sessionStorage", memoryStorage());
    rememberLoginEmail("khach@demo.local");

    expect(takeLoginEmail()).toBe("khach@demo.local");
    expect(takeLoginEmail()).toBe("");
  });

  it("storage bị chặn: không ném lỗi, coi như không có email", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("SecurityError");
      },
      removeItem: () => undefined,
    });

    expect(() => rememberLoginEmail("khach@demo.local")).not.toThrow();
    expect(takeLoginEmail()).toBe("");
  });
});
