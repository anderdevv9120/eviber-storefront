import * as yup from "yup";
import { InferType } from "yup";
import type { ICheckoutReview } from "@/@types/Order.type";
import type { RefundTerms } from "@/@types/Refund.type";
import {
  ADDRESS_REQUIRED_MESSAGE,
  EMAIL_INVALID_MESSAGE,
  EMAIL_REQUIRED_MESSAGE,
  FULL_NAME_REQUIRED_MESSAGE,
  NOTE_MAX_LENGTH,
  NOTE_MAX_LENGTH_MESSAGE,
  PAYMENT_METHOD_MESSAGE,
  PHONE_NUMBER_INVALID_MESSAGE,
  PHONE_NUMBER_MIN_LENGTH,
  PHONE_NUMBER_MIN_LENGTH_MESSAGE,
  PHONE_NUMBER_REQUIRED_MESSAGE,
  PROVINCE_REQUIRED_MESSAGE,
  WARD_REQUIRED_MESSAGE,
} from "@/constants/validate";

export const FIELD_LABEL = "pb-2 text-sm font-medium normal-case text-dark-500";

export interface CheckoutSchemaContext {
  /** true = user đăng nhập chọn địa chỉ đã lưu → bỏ validate cụm form địa chỉ */
  useSavedAddress: boolean;
  noPaymentRequired: boolean;
}

const requiredUnlessSaved = (message: string) =>
  yup.string().when("$useSavedAddress", {
    is: true,
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.required(message),
  });

export const checkoutSchema = yup
  .object({
    fullName: requiredUnlessSaved(FULL_NAME_REQUIRED_MESSAGE),
    phoneNumber: yup.string().when("$useSavedAddress", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) =>
        schema
          .required(PHONE_NUMBER_REQUIRED_MESSAGE)
          .matches(/^[0-9]+$/, PHONE_NUMBER_INVALID_MESSAGE)
          .min(PHONE_NUMBER_MIN_LENGTH, PHONE_NUMBER_MIN_LENGTH_MESSAGE),
    }),
    email: yup
      .string()
      .required(EMAIL_REQUIRED_MESSAGE)
      .email(EMAIL_INVALID_MESSAGE),
    address: requiredUnlessSaved(ADDRESS_REQUIRED_MESSAGE),
    province: requiredUnlessSaved(PROVINCE_REQUIRED_MESSAGE),
    // Địa giới 2 cấp không còn huyện — giữ field để payload/DTO không đổi, luôn rỗng
    district: yup.string().default(""),
    ward: requiredUnlessSaved(WARD_REQUIRED_MESSAGE),
    paymentMethod: yup.string().when("$noPaymentRequired", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required(PAYMENT_METHOD_MESSAGE),
    }),
    note: yup
      .string()
      .max(NOTE_MAX_LENGTH, NOTE_MAX_LENGTH_MESSAGE)
      .default(""),
    saveAddress: yup.boolean().default(true),
  })
  .required();

export type CheckoutFormInput = InferType<typeof checkoutSchema>;

/** Điều khoản hoàn tiền của review đã chấp nhận, copy đúng key của contract để gửi kèm đơn */
export const toExpectedRefundTerms = ({
  refundTerms,
}: Pick<ICheckoutReview, "refundTerms">): RefundTerms => ({
  policyRevision: refundTerms.policyRevision,
  products: refundTerms.products.map(({ productId, refundEnabled }) => ({
    productId,
    refundEnabled,
  })),
});
