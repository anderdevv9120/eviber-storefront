import * as yup from "yup";
import Input from "@/components/ui/Input";
import Dropdown from "@/components/ui/Dropdown";
import Checkbox from "@/components/ui/Checkbox";
import { cn } from "@/config/utils";
import { useState, useEffect } from "react";
import { getProvinces, getDistricts, getWards } from "vietnam-provinces";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import {
  ADDRESS_REQUIRED_MESSAGE,
  DISTRICT_REQUIRED_MESSAGE,
  FULL_NAME_REQUIRED_MESSAGE,
  PHONE_NUMBER_INVALID_MESSAGE,
  PHONE_NUMBER_REQUIRED_MESSAGE,
  PROVINCE_REQUIRED_MESSAGE,
  WARD_REQUIRED_MESSAGE,
  ZIP_REQUIRED_MESSAGE,
} from "@/constants/validate";
import Modal from "@/components/ui/Modal";
import { IAddressProps } from "@/apis/profile";
import { ILocation, IOption } from "@/@types/Address.type";

interface IDropdownItem {
  label: string;
  value: BaseValueInputType;
}

interface IAddressModalProps {
  className?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: IAddressProps;
  onChange?: (data: IAddressProps, isEdit?: boolean) => void;
  isEdit?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const schema = yup.object({
  name: yup.string().required(FULL_NAME_REQUIRED_MESSAGE),
  phoneNumber: yup
    .string()
    .required(PHONE_NUMBER_REQUIRED_MESSAGE)
    .matches(/^[0-9]+$/, PHONE_NUMBER_INVALID_MESSAGE),
  specificAddress: yup.string().required(ADDRESS_REQUIRED_MESSAGE),
  city: yup.string().required(PROVINCE_REQUIRED_MESSAGE),
  district: yup.string().required(DISTRICT_REQUIRED_MESSAGE),
  ward: yup.string().required(WARD_REQUIRED_MESSAGE),
  zip: yup.string().required(ZIP_REQUIRED_MESSAGE),
  primary: yup.boolean().default(false),
});

const AddressModal = ({
  className,
  onCancel,
  initialData,
  onChange,
  isOpen,
}: IAddressModalProps) => {
  const [cityOptions, setCityOptions] = useState<IOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<IOption[]>([]);
  const [wardOptions, setWardOptions] = useState<IOption[]>([]);
  const [isPrimary, setIsPrimary] = useState(false);

  const methods = useForm<IAddressProps>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const {
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    formState: { errors },
  } = methods;

  useEffect(() => {
    const fields: (keyof IAddressProps)[] = [
      "name",
      "phoneNumber",
      "specificAddress",
      "city",
      "district",
      "ward",
      "zip",
    ];

    fields.forEach((field) => setValue(field, initialData?.[field] ?? ""));
    setIsPrimary(initialData?.primary ?? false);

    if (initialData) {
      if (initialData.city) {
        const districts = mapOptions(getDistricts(initialData.city));
        setDistrictOptions(districts);
      }
      if (initialData.district) {
        const wards = mapOptions(getWards(initialData.district));
        setWardOptions(wards);
      }
    }
  }, [initialData, setValue]);

  useEffect(() => {
    const provinces = mapOptions(getProvinces());
    setCityOptions(provinces);
  }, []);

  const handleDropdownChange =
    (field: "city" | "district" | "ward") =>
    (selectedValue: string, selectedItem: IDropdownItem) => {
      const actions = {
        city: () => {
          let districts = mapOptions(getDistricts(selectedValue));
          setDistrictOptions(districts);
          setWardOptions([]);
          setValue("district", "");
          setValue("ward", "");
        },
        district: () => {
          let wards = mapOptions(getWards(selectedValue));
          setWardOptions(wards);
          setValue("district", selectedItem.label);
          setValue("ward", "");
        },
        ward: () => {
          setValue("ward", selectedItem.label);
        },
      };

      actions[field]?.();
      clearErrors(field);
      setValue(field, selectedItem.label);
    };

  const handleCheckboxChange = (primary: boolean) => {
    setIsPrimary(primary);
  };

  const mapOptions = (items: ILocation[]) => {
    return items.map((item) => ({
      value: item.code.toString(),
      label: item.name,
    }));
  };

  const onSubmit: SubmitHandler<IAddressProps> = (data) => {
    const formData = {
      ...data,
      primary: isPrimary,
    };
    onChange && onChange(formData, initialData ? true : false);
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onCancel={onCancel}
      onOk={handleSubmit(onSubmit)}
      cancelText="Thoát"
      okText="Cập Nhật"
      title={initialData ? "Cập nhật địa chỉ" : "Thông tin địa chỉ"}
      className="w-[700px]"
    >
      <FormProvider {...methods}>
        <form className={cn(className, "border-t py-3")}>
          <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8 py-4">
            <Input
              label="Họ tên"
              name="name"
              type="text"
              placeholder="Họ tên"
              onChange={(e) => setValue("name", e.target.value)}
            />
            <Input
              label="Số điện thoại"
              name="phoneNumber"
              placeholder="Số điện thoại"
              onChange={(e) => setValue("phoneNumber", e.target.value)}
            />

            <Dropdown
              size="lg"
              defaultValue={methods.watch("city")}
              className="w-full"
              placeholder="Chọn Tỉnh/Thành"
              isShowSearch
              options={cityOptions}
              error={errors?.city?.message}
              onChange={handleDropdownChange("city")}
            />

            <Dropdown
              size="lg"
              defaultValue={methods.watch("district")}
              className="w-full"
              placeholder="Chọn Quận/Huyện"
              isShowSearch={districtOptions.length > 0}
              options={districtOptions}
              error={errors?.district?.message}
              onChange={handleDropdownChange("district")}
              disabled={districtOptions.length === 0}
            />

            <Dropdown
              size="lg"
              defaultValue={methods.watch("ward")}
              className="w-full"
              placeholder="Chọn Phường/Xã"
              isShowSearch={wardOptions.length > 0}
              options={wardOptions}
              error={errors?.ward?.message}
              onChange={handleDropdownChange("ward")}
              disabled={wardOptions.length === 0}
            />

            <Input
              type="text"
              name="specificAddress"
              placeholder="Địa chỉ chi tiết"
              onChange={(e) => setValue("specificAddress", e.target.value)}
            />
            <Input
              type="text"
              name="zip"
              placeholder="Mã ZIP"
              onChange={(e) => setValue("zip", e.target.value)}
            />
          </div>
          <Checkbox
            checked={isPrimary}
            label="Đặt làm địa chỉ mặc định"
            onChange={handleCheckboxChange}
          />
        </form>
      </FormProvider>
    </Modal>
  );
};

export default AddressModal;
