"use client";

import { useEffect, useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, FormProvider } from "react-hook-form";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { FORM_LABEL_CLASS } from "@/components/ui/FieldController";
import Dropdown from "@/components/ui/Dropdown";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import { IAddressProps } from "@/apis/profile";
import { IAddress } from "@/@types/Address.type";
import { REGEX_PHONE_NUMBER } from "@/constants";
import {
  ADDRESS_REQUIRED_MESSAGE,
  FULL_NAME_REQUIRED_MESSAGE,
  PHONE_NUMBER_INVALID_MESSAGE,
  PHONE_NUMBER_REQUIRED_MESSAGE,
  PROVINCE_REQUIRED_MESSAGE,
  WARD_REQUIRED_MESSAGE,
  ZIP_REQUIRED_MESSAGE,
} from "@/constants/validate";
import {
  findProvinceByName,
  getProvinces,
  getWards,
  IWard,
} from "@/constants/address";

interface IAddressModalProps {
  isOpen: boolean;
  initialData?: IAddress;
  defaultPrimary?: boolean;
  isSaving?: boolean;
  onCancel: () => void;
  onSubmit: (data: IAddressProps) => void;
}

interface IAddressForm {
  name: string;
  phoneNumber: string;
  specificAddress: string;
  city: string;
  ward: string;
  zip: string;
}

const EMPTY_FORM: IAddressForm = {
  name: "",
  phoneNumber: "",
  specificAddress: "",
  city: "",
  ward: "",
  zip: "",
};

const schema = yup.object({
  name: yup.string().required(FULL_NAME_REQUIRED_MESSAGE),
  phoneNumber: yup
    .string()
    .required(PHONE_NUMBER_REQUIRED_MESSAGE)
    .matches(REGEX_PHONE_NUMBER, PHONE_NUMBER_INVALID_MESSAGE),
  specificAddress: yup.string().required(ADDRESS_REQUIRED_MESSAGE),
  city: yup.string().required(PROVINCE_REQUIRED_MESSAGE),
  ward: yup.string().required(WARD_REQUIRED_MESSAGE),
  zip: yup.string().required(ZIP_REQUIRED_MESSAGE),
});

const PROVINCE_OPTIONS = getProvinces().map((province) => ({
  value: String(province.code),
  label: province.name,
}));

const AddressModal = ({
  isOpen,
  initialData,
  defaultPrimary = false,
  isSaving,
  onCancel,
  onSubmit,
}: IAddressModalProps) => {
  // Một object mới mỗi lần mở form / đổi tỉnh để effect nạp xã LUÔN chạy lại —
  // tách 2 state primitive thì mở lại cùng địa chỉ (deps không đổi) là danh sách xã
  // rỗng. wardName: xã cần prefill của tỉnh đang sửa, rỗng khi đổi tỉnh (243 tên xã
  // trùng giữa các tỉnh, match lại theo tên ở tỉnh mới sẽ hiện "đã chọn" sai)
  const [wardQuery, setWardQuery] = useState<{
    provinceCode: string;
    wardName: string;
  }>({ provinceCode: "", wardName: "" });
  const [wards, setWards] = useState<IWard[]>([]);
  const [wardCode, setWardCode] = useState<string>("");
  const [isLoadingWards, setIsLoadingWards] = useState<boolean>(false);
  const [isPrimary, setIsPrimary] = useState<boolean>(false);
  const provinceCode = wardQuery.provinceCode;

  const methods = useForm<IAddressForm>({
    resolver: yupResolver(schema),
    mode: "onBlur",
    defaultValues: EMPTY_FORM,
  });
  const {
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    formState: { errors },
  } = methods;

  const isEditingPrimary = !!initialData?.primary;

  useEffect(() => {
    if (!isOpen) return;
    // city/ward chỉ đổ vào form khi còn trong danh mục 2 cấp — địa chỉ cũ (tên tỉnh
    // không tiền tố, xã đã sáp nhập) để trống để validate bắt chọn lại, không PUT lại tên cũ
    const province = findProvinceByName(initialData?.city);
    reset({
      name: initialData?.name ?? "",
      phoneNumber: initialData?.phoneNumber ?? "",
      specificAddress: initialData?.specificAddress ?? "",
      city: province ? province.name : "",
      ward: "",
      zip: initialData?.zip ?? "",
    });
    setIsPrimary(initialData ? !!initialData.primary : defaultPrimary);
    setWardQuery({
      provinceCode: province ? String(province.code) : "",
      wardName: province ? (initialData?.ward ?? "") : "",
    });
    setWardCode("");
  }, [isOpen, initialData, defaultPrimary, reset]);

  useEffect(() => {
    const { provinceCode: code, wardName } = wardQuery;
    if (!code) {
      setWards([]);
      return;
    }
    let cancelled = false;
    setIsLoadingWards(true);
    getWards(Number(code))
      .then((list) => {
        if (cancelled) return;
        setWards(list);
        const matched = wardName
          ? list.find((ward) => ward.name === wardName)
          : undefined;
        if (matched) {
          setWardCode(String(matched.code));
          setValue("ward", matched.name);
        }
      })
      .catch(() => {
        if (!cancelled) setWards([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingWards(false);
      });
    return () => {
      cancelled = true;
    };
  }, [wardQuery, setValue]);

  const wardOptions = wards.map((ward) => ({
    value: String(ward.code),
    label: ward.name,
  }));

  const handleProvinceChange = (value: string, item: { label: string }) => {
    setWardQuery({ provinceCode: value, wardName: "" });
    setWardCode("");
    setValue("city", item.label, { shouldDirty: true });
    setValue("ward", "");
    clearErrors("city");
  };

  const handleWardChange = (value: string, item: { label: string }) => {
    setWardCode(value);
    setValue("ward", item.label, { shouldDirty: true });
    clearErrors("ward");
  };

  const submit = (data: IAddressForm) => {
    onSubmit({ ...data, primary: isPrimary });
  };

  return (
    <Modal
      isOpen={isOpen}
      onCancel={onCancel}
      closable={!isSaving}
      title={initialData ? "Sửa địa chỉ" : "Thêm địa chỉ"}
      titleClassName="text-xl"
      bodyScrollable={false}
      className="w-[640px]"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="px-5"
            onClick={onCancel}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            className="px-5"
            onClick={handleSubmit(submit)}
            loading={isSaving}
          >
            Lưu địa chỉ
          </Button>
        </div>
      }
    >
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(submit)}
          className="grid gap-4 md:grid-cols-2"
        >
          <Input
            label="Họ tên người nhận"
            name="name"
            placeholder="Nguyễn Văn An"
            maxLength={255}
            className="text-base"
            labelClassName={FORM_LABEL_CLASS}
          />
          <Input
            label="Số điện thoại"
            name="phoneNumber"
            placeholder="0912345678"
            inputMode="numeric"
            className="text-base"
            labelClassName={FORM_LABEL_CLASS}
          />

          <div>
            <p id="address-city-label" className={FORM_LABEL_CLASS}>
              Tỉnh/Thành phố
            </p>
            <Dropdown
              size="md"
              ariaLabelledBy="address-city-label"
              className="w-full"
              placeholder="Chọn Tỉnh/Thành"
              isShowSearch
              noResultsText="Không tìm thấy"
              options={PROVINCE_OPTIONS}
              value={provinceCode}
              error={errors.city?.message}
              onChange={handleProvinceChange}
            />
          </div>
          <div>
            <p id="address-ward-label" className={FORM_LABEL_CLASS}>
              Phường/Xã
            </p>
            <Dropdown
              size="md"
              ariaLabelledBy="address-ward-label"
              className="w-full"
              placeholder={
                provinceCode ? "Chọn Phường/Xã" : "Chọn Tỉnh/Thành trước"
              }
              isShowSearch={wardOptions.length > 0}
              noResultsText="Không tìm thấy"
              options={wardOptions}
              value={wardCode}
              disabled={!provinceCode || isLoadingWards}
              error={errors.ward?.message}
              onChange={handleWardChange}
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Số nhà, tên đường"
              name="specificAddress"
              placeholder="12 Nguyễn Huệ"
              maxLength={500}
              className="text-base"
              labelClassName={FORM_LABEL_CLASS}
            />
          </div>
          <Input
            label="Mã bưu chính"
            name="zip"
            placeholder="700000"
            maxLength={10}
            inputMode="numeric"
            className="text-base"
            labelClassName={FORM_LABEL_CLASS}
          />

          <div className="md:col-span-2">
            <Checkbox
              checked={isPrimary}
              disabled={isEditingPrimary}
              onChange={setIsPrimary}
              labelClassName="text-base font-normal text-dark"
              label={
                isEditingPrimary
                  ? "Đang là địa chỉ mặc định"
                  : "Đặt làm địa chỉ mặc định"
              }
            />
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default AddressModal;
