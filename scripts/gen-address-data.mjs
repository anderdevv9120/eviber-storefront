// Sinh danh mục địa giới 2 cấp (34 tỉnh/thành → phường/xã, mã GSO) từ
// provinces.open-api.vn v2 vào src/constants/address/*.json. Chạy tay khi
// danh mục đổi: `node scripts/gen-address-data.mjs`. Chỉ giữ code/name/provinceCode
// để chunk xã đủ nhẹ cho lazy-import phía client.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const API = "https://provinces.open-api.vn/api/v2";
const OUT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/constants/address"
);
const collator = new Intl.Collator("vi");

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

const [rawProvinces, rawWards] = await Promise.all([
  fetchJson(`${API}/p/`),
  fetchJson(`${API}/w/`),
]);

const provinces = rawProvinces
  .map((p) => ({ code: p.code, name: p.name }))
  .sort((a, b) => collator.compare(a.name, b.name));

const provinceCodes = new Set(provinces.map((p) => p.code));
const wards = rawWards
  .filter((w) => provinceCodes.has(w.province_code))
  .map((w) => ({ code: w.code, name: w.name, provinceCode: w.province_code }))
  .sort(
    (a, b) =>
      a.provinceCode - b.provinceCode || collator.compare(a.name, b.name)
  );

if (wards.length !== rawWards.length) {
  throw new Error(
    `${rawWards.length - wards.length} xã không khớp tỉnh nào — kiểm tra lại nguồn`
  );
}

await writeFile(
  path.join(OUT_DIR, "provinces.json"),
  JSON.stringify(provinces, null, 2) + "\n"
);
await writeFile(path.join(OUT_DIR, "wards.json"), JSON.stringify(wards) + "\n");

console.log(`provinces: ${provinces.length}, wards: ${wards.length}`);
