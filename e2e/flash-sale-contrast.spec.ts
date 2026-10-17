import { expect, test } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`FlashSale: all visible text meets AA contrast at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/product/ao-khoac-hoodie-ni");
    const strip = page.getByText(/^Flash sale/).locator("..");
    await expect(strip).toBeVisible();
    await expect(strip.locator(".tabular-nums").first()).toHaveText(/^\d{2}$/);

    const measurements = await strip.evaluate((root) => {
      type Color = [number, number, number, number];
      const parse = (value: string): Color => {
        if (!/^rgba?\(/.test(value)) {
          throw new Error(`Unsupported computed color: ${value}`);
        }
        const parts = value.match(/[\d.]+/g)!.map(Number);
        return [
          parts[0],
          parts[1],
          parts[2],
          parts.length === 4 ? parts[3] : 1,
        ];
      };
      const over = (front: Color, back: Color): Color => {
        const alpha = front[3] + back[3] * (1 - front[3]);
        if (alpha === 0) return back;
        const channel = (i: number) =>
          (front[i] * front[3] + back[i] * back[3] * (1 - front[3])) / alpha;
        return [channel(0), channel(1), channel(2), alpha];
      };
      const luminance = (color: Color) => {
        const linear = color.slice(0, 3).map((channel) => {
          const srgb = channel / 255;
          return srgb <= 0.04045
            ? srgb / 12.92
            : ((srgb + 0.055) / 1.055) ** 2.4;
        });
        return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
      };

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const rows = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent!.trim();
        if (!text) continue;
        const element = node.parentElement!;
        const range = document.createRange();
        range.selectNodeContents(node);
        if (
          !element.checkVisibility({ checkVisibilityCSS: true }) ||
          !Array.from(range.getClientRects()).some(
            (rect) => rect.width > 0 && rect.height > 0
          )
        ) {
          continue;
        }

        const layers = [];
        for (
          let parent: Element | null = element;
          parent;
          parent = parent.parentElement
        ) {
          const style = getComputedStyle(parent);
          // Fail explicitly if this solid-color component gains effects needing pixel sampling.
          if (
            style.backgroundImage !== "none" ||
            style.opacity !== "1" ||
            style.filter !== "none" ||
            style.mixBlendMode !== "normal"
          ) {
            throw new Error(`Unsupported contrast effect on ${parent.tagName}`);
          }
          layers.unshift(parse(style.backgroundColor));
        }
        // Composite the cell /15 over the strip /10 over its actual ancestors.
        const background = layers.reduce<Color>(
          (back, front) => over(front, back),
          [0, 0, 0, 0]
        );
        if (background[3] !== 1) {
          throw new Error(
            "FlashSale needs an opaque ancestor background to measure"
          );
        }
        const foreground = over(
          parse(getComputedStyle(element).color),
          background
        );
        const light = luminance(foreground);
        const dark = luminance(background);
        rows.push({
          text,
          foreground,
          background,
          ratio:
            (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05),
        });
      }
      return rows;
    });

    console.info(JSON.stringify({ width, measurements }));
    expect(measurements).toHaveLength(width === 390 ? 6 : 8);
    for (const row of measurements) {
      expect(
        row.ratio,
        `${row.text}: ${row.ratio.toFixed(3)}:1`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
}
