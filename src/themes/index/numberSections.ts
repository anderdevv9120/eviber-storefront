export function numberSections<T extends string>(
  sections: readonly (T | false)[]
): Partial<Record<T, string>> {
  const numbers: Partial<Record<T, string>> = {};
  let count = 0;
  for (const section of sections) {
    if (section !== false) numbers[section] = String(++count).padStart(2, "0");
  }
  return numbers;
}
