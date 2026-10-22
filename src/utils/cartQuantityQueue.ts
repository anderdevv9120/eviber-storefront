/** Serializes updates per line so every waiter sees the latest queued quantity. */
export class CartQuantityQueue {
  private readonly pending = new Map<string, number>();
  private readonly ready = new Set<string>();
  private readonly running = new Map<string, Promise<boolean>>();
  private frozen = false;

  constructor(
    private readonly update: (key: string, quantity: number) => Promise<boolean>
  ) {}

  enqueue(key: string, quantity: number): boolean {
    if (this.frozen) return false;
    this.pending.set(key, quantity);
    // Reset the debounce window if a new edit arrives during an active PUT.
    this.ready.delete(key);
    return true;
  }

  freeze(): void {
    this.frozen = true;
  }

  unfreeze(): void {
    this.frozen = false;
  }

  discard(key: string): void {
    this.pending.delete(key);
    this.ready.delete(key);
  }

  flush(key: string): Promise<boolean> {
    if (this.pending.has(key)) this.ready.add(key);
    const running = this.running.get(key);
    if (running) return running;
    if (!this.pending.has(key)) return Promise.resolve(true);

    const task = (async () => {
      try {
        while (this.pending.has(key) && this.ready.has(key)) {
          const quantity = this.pending.get(key)!;
          this.pending.delete(key);
          this.ready.delete(key);
          let successful = false;
          try {
            successful = await this.update(key, quantity);
          } catch (error) {
            console.error("Cart quantity update failed", error);
          }
          if (!successful) {
            // A failed PUT invalidates only this line's later optimistic edits.
            this.pending.delete(key);
            this.ready.delete(key);
            return false;
          }
        }
        return true;
      } finally {
        // Clear before settling the promise, so a new edit starts a new drain.
        this.running.delete(key);
      }
    })();

    this.running.set(key, task);
    return task;
  }

  async flushAll(): Promise<boolean> {
    const keys = new Set([...this.running.keys(), ...this.pending.keys()]);
    const results = await Promise.all([...keys].map((key) => this.flush(key)));
    return results.every(Boolean);
  }
}
