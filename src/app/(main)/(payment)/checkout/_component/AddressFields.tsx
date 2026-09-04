"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { getProvinces, getDistricts, getWards } from "vietnam-provinces";
import Dropdown from "@/components/ui/Dropdown";
import Input from "@/components/ui/Input";
import { ILocation, IOption } from "@/@types/Address.type";
import { FIELD_LABEL } from "./checkoutForm";

export default function AddressFields() {
  const {
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const [provinceOptions, setProvinceOptions] = useState<IOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<IOption[]>([]);
  const [wardOptions, setWardOptions] = useState<IOption[]>([]);
  // Dropdown làm việc bằng CODE để cascade; form giữ TÊN vì BE nhận text
  const [provinceCode, setProvinceCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [wardCode, setWardCode] = useState("");

  useEffect(() => {
    setProvinceOptions(mapOptions(getProvinces()));
  }, []);

  const handleProvinceChange = (value: BaseValueType, item: IDropdownLabel) => {
    const code = String(value);
    setProvinceCode(code);
    setDistrictCode("");
    setWardCode("");
    setDistrictOptions(mapOptions(getDistricts(code)));
    setWardOptions([]);
    setValue("province", item.label);
    setValue("district", "");
    setValue("ward", "");
    clearErrors(["province", "district", "ward"]);
  };

  const handleDistrictChange = (value: BaseValueType, item: IDropdownLabel) => {
    const code = String(value);
    setDistrictCode(code);
    setWardCode("");
    setWardOptions(mapOptions(getWards(code)));
    setValue("district", item.label);
    setValue("ward", "");
    clearErrors(["district", "ward"]);
  };

  const handleWardChange = (value: BaseValueType, item: IDropdownLabel) => {
    setWardCode(String(value));
    setValue("ward", item.label);
    clearErrors("ward");
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Dropdown
          {...DROPDOWN_PROPS}
          label="Tỉnh / Thành phố"
          placeholder="Chọn Tỉnh/Thành"
          options={provinceOptions}
          value={provinceCode}
          isShowSearch
          error={errorMessage(errors.province)}
          onChange={handleProvinceChange}
        />
        <Dropdown
          {...DROPDOWN_PROPS}
          label="Quận / Huyện"
          placeholder="Chọn Quận/Huyện"
          options={districtOptions}
          value={districtCode}
          isShowSearch={districtOptions.length > 0}
          disabled={districtOptions.length === 0}
          error={errorMessage(errors.district)}
          onChange={handleDistrictChange}
        />
        <Dropdown
          {...DROPDOWN_PROPS}
          label="Phường / Xã"
          placeholder="Chọn Phường/Xã"
          options={wardOptions}
          value={wardCode}
          isShowSearch={wardOptions.length > 0}
          disabled={wardOptions.length === 0}
          error={errorMessage(errors.ward)}
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

const mapOptions = (items: ILocation[]): IOption[] =>
  items.map((item) => ({ value: item.code, label: item.name }));

const errorMessage = (error: unknown): string | undefined =>
  typeof error === "object" &&
  error !== null &&
  "message" in error &&
  typeof error.message === "string"
    ? error.message
    : undefined;
