export const stepIndex = (
  current: number,
  count: number,
  dir: 1 | -1
): number => (count <= 1 ? 0 : (current + dir + count) % count);
