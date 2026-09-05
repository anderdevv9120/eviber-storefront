"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import Dropdown from "@/components/ui/Dropdown";
import Input from "@/components/ui/Input";
import { getProvinces, getWards, IWard } from "@/constants/address";
import { WARD_LOAD_ERROR_MESSAGE } from "@/constants/validate";
import { FIELD_LABEL } from "./checkoutForm";

const PROVINCE_OPTIONS = getProvinces().map((province) => ({
  value: String(province.code),
  label: province.name,
}));

export default function AddressFields() {
  const {
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  // Dropdown làm việc bằng CODE để cascade; form giữ TÊN vì BE nhận text.
  // Object mới mỗi lần chọn tỉnh (kể cả chọn lại cùng tỉnh) để effect nạp xã chạy lại —
  // đó là đường retry khi chunk xã tải lỗi
  const [provinceQuery, setProvinceQuery] = useState<{ code: string }>({
    code: "",
  });
  const provinceCode = provinceQuery.code;
  const [wards, setWards] = useState<IWard[]>([]);
  const [wardCode, setWardCode] = useState("");
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [wardsError, setWardsError] = useState("");

  useEffect(() => {
    setWards([]);
    setWardsError("");
    if (!provinceQuery.code) return;
    let cancelled = false;
    setIsLoadingWards(true);
    getWards(Number(provinceQuery.code))
      .then((list) => {
        if (!cancelled) setWards(list);
      })
      .catch(() => {
        if (!cancelled) setWardsError(WARD_LOAD_ERROR_MESSAGE);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingWards(false);
      });
    return () => {
      cancelled = true;
    };
  }, [provinceQuery]);

  const wardOptions = wards.map((ward) => ({
    value: String(ward.code),
    label: ward.name,
  }));

  const handleProvinceChange = (value: BaseValueType, item: IDropdownLabel) => {
    setProvinceQuery({ code: String(value) });
    setWardCode("");
    setValue("province", item.label);
    setValue("ward", "");
    clearErrors(["province", "ward"]);
  };

  const handleWardChange = (value: BaseValueType, item: IDropdownLabel) => {
    setWardCode(String(value));
    setValue("ward", item.label);
    clearErrors("ward");
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Dropdown
          {...DROPDOWN_PROPS}
          label="Tỉnh / Thành phố"
          placeholder="Chọn Tỉnh/Thành"
          options={PROVINCE_OPTIONS}
          value={provinceCode}
          isShowSearch
          noResultsText="Không tìm thấy"
          error={errorMessage(errors.province)}
          onChange={handleProvinceChange}
        />
        <Dropdown
          {...DROPDOWN_PROPS}
          label="Phường / Xã"
          placeholder={
            provinceCode ? "Chọn Phường/Xã" : "Chọn Tỉnh/Thành trước"
          }
          options={wardOptions}
          value={wardCode}
          isShowSearch={wardOptions.length > 0}
          noResultsText="Không tìm thấy"
          disabled={!provinceCode || isLoadingWards}
          error={wardsError || errorMessage(errors.ward)}
          onChange={handleWardChange}
        />
      </div>
      <Input
        name="address"
        label="Địa chỉ chi tiết"
        labelClassName={FIELD_LABEL}
        className="text-base"
        placeholder="Số nhà, tên đường, tòa nhà..."
      />
    </>
  );
}

// Handler chỉ đọc label của option — không ép kiểu về IDropdownItem của Dropdown
interface IDropdownLabel {
  label: string;
}

const DROPDOWN_PROPS = {
  size: "lg",
  className: "w-full",
  labelClassName: FIELD_LABEL,
} as const;

const errorMessage = (error: unknown): string | undefined =>
  typeof error === "object" &&
  error !== null &&
  "message" in error &&
  typeof error.message === "string"
    ? error.message
    : undefined;
