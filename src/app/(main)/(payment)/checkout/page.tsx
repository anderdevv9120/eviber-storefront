"use client";

import * as yup from "yup";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Dropdown from "@/components/ui/Dropdown";
import { useState, useEffect } from "react";
import { getProvinces, getDistricts, getWards } from "vietnam-provinces";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import {
  ADDRESS_REQUIRED_MESSAGE,
  DISTRICT_REQUIRED_MESSAGE,
  EMAIL_INVALID_MESSAGE,
  EMAIL_REQUIRED_MESSAGE,
  FULL_NAME_REQUIRED_MESSAGE,
  PAYMENT_METHOD_MESSAGE,
  PHONE_NUMBER_INVALID_MESSAGE,
  PHONE_NUMBER_REQUIRED_MESSAGE,
  PROVINCE_REQUIRED_MESSAGE,
  WARD_REQUIRED_MESSAGE,
} from "@/constants/validate";
import ProductItem from "@/components/ui/ProductItem";
import { ICartResponse } from "@/@types/Cart.type";
import { ICheckoutReview } from "@/@types/Order.type";
import { PaymentMethod } from "@/constants/payment";
import { useRouter } from "next/navigation";
import { getCart } from "@/apis/cart";
import { checkoutReview, makeOrder } from "@/apis/order";
import Spin from "@/components/ui/Spin";
import { formatPrice } from "@/utils/formatPrice";
import { removeLocalStorage } from "@/utils/localStorage";
import FieldController from "@/components/ui/FieldController";
import { InferType } from "yup";
import { RadioGroup } from "@/components/ui/InputRadio/Radio";
import { ILocation, IOption } from "@/@types/Address.type";
import { ChevronLeft } from "@/components/icons";

// value PHẢI khớp enum BE (make-order.dto.ts) — xem constants/payment.ts
const paymentMethodOptions = [
  { label: "Thanh toán khi nhận hàng (COD)", value: "CASH" },
  { label: "Thanh toán chuyển khoản", value: "BANK_TRANSFER" },
  { label: "Thanh toán qua thẻ", value: "CARD", disabled: true },
];

const schema = yup
  .object({
    fullName: yup.string().required(FULL_NAME_REQUIRED_MESSAGE),
    email: yup
      .string()
      .required(EMAIL_REQUIRED_MESSAGE)
      .email(EMAIL_INVALID_MESSAGE),
    phoneNumber: yup
      .string()
      .required(PHONE_NUMBER_REQUIRED_MESSAGE)
      .matches(/^[0-9]+$/, PHONE_NUMBER_INVALID_MESSAGE),
    address: yup.string().required(ADDRESS_REQUIRED_MESSAGE),
    province: yup.string().nullable().required(PROVINCE_REQUIRED_MESSAGE),
    district: yup.string().nullable().required(DISTRICT_REQUIRED_MESSAGE),
    ward: yup.string().nullable().required(WARD_REQUIRED_MESSAGE),
    paymentMethod: yup.string().required(PAYMENT_METHOD_MESSAGE),
  })
  .required();

export default function Checkout() {
  const [provinceOptions, setProvinceOptions] = useState<IOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<IOption[]>([]);
  const [wardOptions, setWardOptions] = useState<IOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataCart, setDataCart] = useState<ICartResponse>();
  const [review, setReview] = useState<ICheckoutReview>();
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const router = useRouter();

  type IFormInput = InferType<typeof schema>;
  const methods = useForm<IFormInput>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const {
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = methods;

  useEffect(() => {
    const provinces = mapOptions(getProvinces());
    setProvinceOptions(provinces);
  }, []);

  useEffect(() => {
    const fetchCartAndReview = async () => {
      try {
        const cartRes = await getCart();
        const cart: ICartResponse | undefined = cartRes?.data;
        setDataCart(cart);
        if (cart?.cartId && cart.totalQuantity > 0) {
          const reviewRes = await checkoutReview(cart.cartId);
          setReview(reviewRes?.data);
        }
      } catch {
        // interceptor đã toast lỗi — giữ state undefined để render empty
      } finally {
        setIsLoadingCart(false);
      }
    };
    fetchCartAndReview();
  }, []);

  const handleDropdownChange =
    (field: "province" | "district" | "ward") =>
    (selectedValue: BaseValueType) => {
      const stringValue = selectedValue as string;
      const actions = {
        province: () => {
          const districts = mapOptions(getDistricts(stringValue));
          setDistrictOptions(districts);
          setWardOptions([]);
          setValue("district", "");
          setValue("ward", "");
        },
        district: () => {
          const wards = mapOptions(getWards(stringValue));
          setWardOptions(wards);
          setValue("district", stringValue);
          setValue("ward", "");
        },
        ward: () => {
          setValue("ward", stringValue);
        },
      };

      actions[field]?.();
      clearErrors(field);
      setValue(field, stringValue);
    };

  const mapOptions = (items: ILocation[]) => {
    return items.map((item) => ({
      value: item.code,
      label: item.name,
    }));
  };

  const handlePaymentMethodChange = (value: BaseValueType) => {
    setValue("paymentMethod", String(value));
  };

  // Dropdown giữ CODE địa giới — BE nhận TÊN text → map ngược từ options
  const labelOf = (options: IOption[], code: string) =>
    options.find((o) => o.value === code)?.label ?? code;

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    if (!dataCart?.cartId) return;
    setIsLoading(true);
    try {
      // Lấy cartId TƯƠI ngay trước khi đặt: nếu accessToken hết hạn giữa chừng,
      // danh tính (user/guest) của 2 request này vẫn nhất quán — tránh lỗi
      // "Cart does not belong to this session" khi cartId cũ thuộc danh tính cũ
      const freshCart = await getCart();
      const freshCartId: string | undefined = freshCart?.data?.cartId;
      const freshQuantity: number = freshCart?.data?.totalQuantity ?? 0;
      if (!freshCartId || freshQuantity === 0) {
        setDataCart(freshCart?.data);
        setIsLoading(false);
        return;
      }
      const res = await makeOrder({
        cartId: freshCartId,
        shippingInfo: {
          name: data.fullName,
          phoneNumber: data.phoneNumber,
          email: data.email,
          city: labelOf(provinceOptions, data.province),
          district: labelOf(districtOptions, data.district),
          ward: labelOf(wardOptions, data.ward),
          specificAddress: data.address,
        },
        paymentInfo: { method: data.paymentMethod as PaymentMethod },
      });
      removeLocalStorage("countdownTimer");
      const orderNumber = res?.data?.orderNumber ?? "";
      router.push(
        `/payment-success?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(data.email)}`
      );
    } catch {
      // interceptor đã toast lỗi (vd hết hàng giữa chừng) — giữ nguyên form
      setIsLoading(false);
    }
  };

  const canOrder = !!dataCart?.cartId && (dataCart?.totalQuantity ?? 0) > 0;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex md:flex-col flex-col-reverse gap-6 md:gap-0 w-full">
            <div className="w-full">
              <div className="custom-card pb-6">
                <h2 className="text-xl pb-4 font-semibold">Giao tới</h2>
                <div className="mx-auto mb-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8 text-">
                  <Input name="fullName" placeholder="Họ tên" />
                  <Input
                    name="phoneNumber"
                    type="text"
                    placeholder="Số điện thoại"
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email nhận thông tin đơn hàng"
                  />
                  <Dropdown
                    size="lg"
                    className="w-full"
                    placeholder="Chọn Tỉnh/Thành"
                    isShowSearch
                    options={provinceOptions}
                    error={errors?.province?.message}
                    onChange={handleDropdownChange("province")}
                  />

                  <Dropdown
                    size="lg"
                    className="w-full"
                    placeholder="Chọn Quận/Huyện"
                    isShowSearch={districtOptions.length > 0}
                    disabled={districtOptions.length === 0}
                    options={districtOptions}
                    error={errors?.district?.message}
                    onChange={handleDropdownChange("district")}
                  />
                  <Dropdown
                    size="lg"
                    className="w-full"
                    placeholder="Chọn Phường/Xã"
                    isShowSearch={wardOptions.length > 0}
                    disabled={wardOptions.length === 0}
                    options={wardOptions}
                    error={errors?.ward?.message}
                    onChange={handleDropdownChange("ward")}
                  />
                  <Input
                    name="address"
                    type="text"
                    placeholder="Địa chỉ chi tiết"
                  />
                </div>
              </div>

              <div className="custom-card">
                <FieldController
                  name="paymentMethod"
                  title="Phương thức thanh toán"
                  isUncontrolled={true}
                  defaultValue="CASH"
                  className="font-semibold"
                >
                  <RadioGroup
                    options={paymentMethodOptions}
                    onChange={handlePaymentMethodChange}
                  />
                </FieldController>
              </div>
            </div>

            <div
              className="text-xl text-primary-700 flex gap-2 items-center hover:text-primary-500 pt-6 cursor-pointer"
              onClick={() => {
                removeLocalStorage("countdownTimer");
                router.push("/cart");
              }}
            >
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </div>
          </div>

          <div className="custom-card w-full lg:max-w-[500px] h-full p-4 md:p-8 bg-white-100/85 rounded-lg">
            <CheckoutSummary
              dataCart={dataCart}
              review={review}
              isLoading={isLoadingCart}
            />
            <Spin
              isLoading={isLoading}
              className="text-dark-200 fill-primary-500"
            >
              <Button
                type="submit"
                disabled={!canOrder || isLoading}
                className="w-full text-xl font-normal select-none uppercase"
              >
                {isLoading ? "Đang xử lý..." : "Đặt hàng"}
              </Button>
            </Spin>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

interface CheckoutSummaryProps {
  dataCart?: ICartResponse;
  review?: ICheckoutReview;
  isLoading: boolean;
}

const CheckoutSummary = ({
  dataCart,
  review,
  isLoading,
}: CheckoutSummaryProps) => {
  const summaryItems = [
    {
      label: "Tạm tính",
      value: formatPrice(review?.subtotal ?? dataCart?.totalPrice ?? 0),
    },
    { label: "Giảm giá", value: formatPrice(review?.discountAmount ?? 0) },
    { label: "Phí vận chuyển", value: formatPrice(review?.shippingFee ?? 0) },
  ];

  const total = review?.totalPrice ?? dataCart?.totalPrice ?? 0;

  return (
    <Spin isLoading={isLoading} className="text-dark-200 fill-primary-500">
      <h2 className="text-lg font-semibold">Thông tin thanh toán</h2>
      <div>
        {dataCart?.items?.map((item) => (
          <ProductItem
            key={item.variantId}
            item={item}
            isPayment={false}
            className="border-b border-b-white-400"
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 mt-6 mb-12 text-dark-500">
        {summaryItems?.map((item, index) => (
          <p className="flex justify-between" key={index}>
            {item.label}
            <span className="text-dark-800">{item.value}</span>
          </p>
        ))}

        <p className="flex justify-between pt-3 text-lg border-t font-bold border-t-white-400">
          Tổng cộng
          <span className="text-dark-800">{formatPrice(total)}</span>
        </p>
      </div>
    </Spin>
  );
};
