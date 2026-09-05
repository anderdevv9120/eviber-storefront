import provinces from "./provinces.json";

// Khớp MAX_ADDRESSES phía BE (addAddress từ chối khi đủ) — FE chặn trước để không toast lỗi
export const MAX_ADDRESSES = 10;

export interface IProvince {
  code: number;
  name: string;
}

export interface IWard extends IProvince {
  provinceCode: number;
}

export const getProvinces = (): IProvince[] => provinces;

export const findProvinceByName = (name?: string): IProvince | undefined =>
  provinces.find((province) => province.name === name);

// Danh sách xã (~3.3k dòng) chỉ cần khi mở form — tách chunk, không vào bundle trang
export const getWards = async (provinceCode: number): Promise<IWard[]> => {
  const { default: wards } = await import("./wards.json");
  return (wards as IWard[]).filter(
    (ward) => ward.provinceCode === provinceCode
  );
};
