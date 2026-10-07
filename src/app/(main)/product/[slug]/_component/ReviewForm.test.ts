import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { IOwnerReview } from "@/@types/Review.type";
import { useAppStore } from "@/store/useAppStore";
import ReviewForm from "./ReviewForm";
import {
  reviewDraft,
  reviewPayload,
  reviewRequestScope,
} from "./ReviewForm.helpers";

const { identity } = vi.hoisted(() => ({ identity: { current: "" } }));
vi.mock("@/store/useAppStore", () => {
  const listeners = new Set<(state: { profile: { _id: string } }) => void>();
  const state = () => ({ profile: { _id: identity.current } });
  const store = Object.assign(
    (selector: (value: ReturnType<typeof state>) => unknown) =>
      selector(state()),
    {
      getState: state,
      setState: (value: ReturnType<typeof state>) => {
        identity.current = value.profile._id;
        listeners.forEach((listener) => listener(state()));
      },
      subscribe: (listener: (value: ReturnType<typeof state>) => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    }
  );
  return { useAppStore: store };
});

afterEach(() => {
  identity.current = "";
  vi.restoreAllMocks();
});

const owner: IOwnerReview = {
  _id: "review",
  productId: "product",
  rating: 4,
  title: "Saved",
  content: "Body",
  images: ["https://images.test/saved.png"],
  status: "pending",
  contentRevision: 7,
  adminReply: null,
  created_at: "2026-10-07",
  updated_at: "2026-10-07",
};
const switchAccount = (id: string) =>
  useAppStore.setState({
    profile: { ...useAppStore.getState().profile, _id: id },
  });

describe("review multipart payload", () => {
  it("supports rating-only create and clears optional fields", () => {
    const payload = reviewPayload(
      "product",
      { ...reviewDraft(null), rating: 5 },
      null
    );
    expect(Object.fromEntries(payload.entries())).toEqual({
      productId: "product",
      rating: "5",
      title: "",
      content: "",
    });
  });
  it("sends the loaded revision, explicit retention and files on edit", () => {
    const file = new File(["bytes"], "photo.png", { type: "image/png" });
    const payload = reviewPayload(
      "product",
      {
        ...reviewDraft(owner),
        title: "",
        content: "",
        retainedImages: [],
        files: [file],
      },
      owner
    );
    expect(payload.get("expectedContentRevision")).toBe("7");
    expect(payload.get("retainedImages")).toBe("[]");
    expect(payload.get("title")).toBe("");
    expect(payload.get("content")).toBe("");
    expect(payload.has("productId")).toBe(false);
    expect((payload.get("images") as File).name).toBe("photo.png");
    expect([...payload.keys()]).toEqual([
      "rating",
      "title",
      "content",
      "expectedContentRevision",
      "retainedImages",
      "images",
    ]);
  });
  it("allows exactly five combined photos and rejects six", () => {
    const file = new File(["image"], "photo.png");
    expect(
      reviewPayload(
        "product",
        { ...reviewDraft(owner), files: Array(4).fill(file) },
        owner
      ).getAll("images")
    ).toHaveLength(4);
    expect(() =>
      reviewPayload(
        "product",
        { ...reviewDraft(owner), files: Array(5).fill(file) },
        owner
      )
    ).toThrow("5 ảnh");
  });
  it.each([0, 6, 1.5, NaN])("rejects invalid rating %s", (rating) => {
    expect(() =>
      reviewPayload("product", { ...reviewDraft(null), rating }, null)
    ).toThrow("1 đến 5 sao");
  });
  it("rejects duplicate/foreign retained URLs and excessive text", () => {
    for (const retainedImages of [
      [...owner.images, ...owner.images],
      ["https://foreign.test/image"],
    ])
      expect(() =>
        reviewPayload(
          "product",
          { ...reviewDraft(owner), retainedImages },
          owner
        )
      ).toThrow("Ảnh giữ lại");
    for (const fields of [
      { title: "x".repeat(256) },
      { content: "x".repeat(4001) },
    ])
      expect(() =>
        reviewPayload("product", { ...reviewDraft(owner), ...fields }, owner)
      ).toThrow("255");
    const draft = reviewDraft(owner);
    draft.retainedImages.pop();
    expect(owner.images).toHaveLength(1);
  });
});

describe("review identity isolation", () => {
  it.each(["", "customer-b"])(
    "aborts eligibility and writes after switch to '%s'",
    async (nextId) => {
      switchAccount("customer-a");
      const scope = reviewRequestScope("customer-a");
      const applied = vi.fn();
      let resolve!: (value: string) => void;
      const delayed = new Promise<string>((done) => {
        resolve = done;
      }).then((value) => {
        if (!scope.signal.aborted) applied(value);
      });
      switchAccount(nextId);
      resolve("private customer-a result");
      await delayed;
      expect(scope.signal.aborted).toBe(true);
      expect(applied).not.toHaveBeenCalled();
      scope.dispose();
    }
  );
  it("cannot revive an old A request after A → B → A", () => {
    switchAccount("a");
    const first = reviewRequestScope("a");
    switchAccount("b");
    switchAccount("a");
    const fresh = reviewRequestScope("a");
    expect(first.signal.aborted).toBe(true);
    expect(fresh.signal.aborted).toBe(false);
    first.dispose();
    fresh.dispose();
  });
  it("keeps same-account updates alive and aborts on unmount or stale mount", () => {
    switchAccount("a");
    const scope = reviewRequestScope("a");
    switchAccount("a");
    expect(scope.signal.aborted).toBe(false);
    scope.dispose();
    expect(scope.signal.aborted).toBe(true);
    const stale = reviewRequestScope("b");
    expect(stale.signal.aborted).toBe(true);
    stale.dispose();
  });
  it("renders login CTA without private content when signed out", () => {
    const html = renderToStaticMarkup(
      createElement(ReviewForm, { productId: "product", onSaved: vi.fn() })
    );
    expect(html).toContain('href="/login"');
    expect(html).not.toContain("Lưu đánh giá");
  });
  it("never treats loading as eligible", () => {
    switchAccount("a");
    const props = { productId: "product", onSaved: vi.fn() };
    const html = renderToStaticMarkup(createElement(ReviewForm, props));
    expect(html).toContain("Đang kiểm tra quyền đánh giá");
    expect(html).not.toContain("Viết đánh giá");
    expect(html).not.toContain("Lưu đánh giá");
  });
});
