import type { ICartResponse } from "@/@types/Cart.type";

export function checkoutVoucherKey(
  accountId: string,
  cart: ICartResponse,
  code: string,
  generation: number
): string {
  const items = cart.items
    .map(({ variantId, quantity, price, isAvailable }) => [
      variantId,
      quantity,
      price,
      isAvailable,
    ])
    .sort(([left], [right]) => String(left).localeCompare(String(right)));
  return JSON.stringify([
    accountId,
    cart.cartId,
    items,
    code.trim().toUpperCase(),
    generation,
  ]);
}

export function canSubmitReviewedCheckout(input: {
  currentKey: string;
  acceptedKey?: string;
  hasPendingDraft: boolean;
  reviewReady: boolean;
  existingPolicyAllowed: boolean;
}): boolean {
  return (
    !!input.acceptedKey &&
    input.currentKey === input.acceptedKey &&
    !input.hasPendingDraft &&
    input.reviewReady &&
    input.existingPolicyAllowed
  );
}

export function createVoucherReviewScope() {
  let context = "";
  let generation = 0;
  let controller: AbortController | undefined;
  return {
    get key() {
      return `${context}:${generation}`;
    },
    sync(next: string) {
      if (context !== next) {
        context = next;
        this.invalidate();
      }
      return this.key;
    },
    invalidate() {
      controller?.abort();
      generation += 1;
      return this.key;
    },
    async run<T>(
      next: string,
      load: (signal: AbortSignal, isCurrent: () => boolean) => Promise<T>
    ): Promise<{ key: string; data: T } | undefined> {
      this.sync(next);
      this.invalidate();
      controller = new AbortController();
      const signal = controller.signal;
      const key = this.key;
      const isCurrent = () => !signal.aborted && this.key === key;
      try {
        const data = await load(signal, isCurrent);
        return isCurrent() ? { key, data } : undefined;
      } catch (cause) {
        if (isCurrent()) throw cause;
        return undefined;
      }
    },
  };
}
