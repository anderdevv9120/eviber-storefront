import { describe, expect, it, vi } from "vitest";
import { CartQuantityQueue } from "./cartQuantityQueue";

function deferred() {
  let resolve!: (value: boolean) => void;
  const promise = new Promise<boolean>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("CartQuantityQueue", () => {
  it("waits for a newer same-line update even when timer and checkout flush together", async () => {
    const first = deferred();
    const second = deferred();
    const update = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const queue = new CartQuantityQueue(update);

    queue.enqueue("combo:abc", 2);
    const firstFlush = queue.flush("combo:abc");
    queue.enqueue("combo:abc", 3);
    const timerFlush = queue.flush("combo:abc");
    queue.freeze();
    const checkout = queue.flushAll();
    const navigated = vi.fn();
    checkout.then(navigated);

    expect(update).toHaveBeenCalledTimes(1);
    first.resolve(true);
    await vi.waitFor(() => expect(update).toHaveBeenCalledTimes(2));
    expect(update.mock.calls).toEqual([
      ["combo:abc", 2],
      ["combo:abc", 3],
    ]);
    expect(navigated).not.toHaveBeenCalled();

    second.resolve(true);
    expect(await checkout).toBe(true);
    expect(await firstFlush).toBe(true);
    expect(await timerFlush).toBe(true);
    expect(navigated).toHaveBeenCalledTimes(1);
  });

  it("keeps a newer edit debounced until its timer or checkout explicitly flushes it", async () => {
    const first = deferred();
    const update = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValue(true);
    const queue = new CartQuantityQueue(update);

    queue.enqueue("product:a", 2);
    const running = queue.flush("product:a");
    queue.enqueue("product:a", 3);
    first.resolve(true);
    expect(await running).toBe(true);
    expect(update).toHaveBeenCalledTimes(1);

    expect(await queue.flush("product:a")).toBe(true);
    expect(update.mock.calls).toEqual([
      ["product:a", 2],
      ["product:a", 3],
    ]);
  });

  it("rejects edits while frozen and drains independent product and combo keys", async () => {
    const product = deferred();
    const combo = deferred();
    const update = vi.fn((key: string) =>
      key.startsWith("product:") ? product.promise : combo.promise
    );
    const queue = new CartQuantityQueue(update);

    expect(queue.enqueue("product:same", 2)).toBe(true);
    expect(queue.enqueue("combo:same", 3)).toBe(true);
    queue.freeze();
    expect(queue.enqueue("product:later", 9)).toBe(false);
    const checkout = queue.flushAll();
    expect(update).toHaveBeenCalledTimes(2);
    product.resolve(true);
    let completed = false;
    checkout.then(() => {
      completed = true;
    });
    await Promise.resolve();
    expect(completed).toBe(false);
    combo.resolve(true);
    expect(await checkout).toBe(true);
    expect(update.mock.calls.map(([key]) => key).sort()).toEqual([
      "combo:same",
      "product:same",
    ]);
    queue.unfreeze();
  });

  it("discards a deleted line's pending edit but waits for its running PUT", async () => {
    const request = deferred();
    const update = vi.fn(() => request.promise);
    const queue = new CartQuantityQueue(update);
    queue.enqueue("product:a", 2);
    queue.flush("product:a");
    queue.enqueue("product:a", 3);
    queue.discard("product:a");
    const deleting = queue.flush("product:a");
    request.resolve(true);
    expect(await deleting).toBe(true);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("a failed key clears only its own pending changes", async () => {
    const failing = deferred();
    const other = deferred();
    const update = vi.fn((key: string) =>
      key === "combo:a" ? failing.promise : other.promise
    );
    const queue = new CartQuantityQueue(update);
    queue.enqueue("combo:a", 2);
    queue.flush("combo:a");
    queue.enqueue("combo:a", 3);
    queue.enqueue("product:b", 4);
    queue.freeze();
    const checkout = queue.flushAll();
    failing.resolve(false);
    other.resolve(true);
    expect(await checkout).toBe(false);
    expect(update.mock.calls).toEqual([
      ["combo:a", 2],
      ["product:b", 4],
    ]);
  });
});
