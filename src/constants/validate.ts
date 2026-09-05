export const MIN_PASSWORD_LENGTH = 8;

export const EMAIL_REQUIRED_MESSAGE = "Vui lòng nhập email";
export const EMAIL_INVALID_MESSAGE = "Email không hợp lệ";
export const PASSWORD_REQUIRED_MESSAGE = "Vui lòng nhập mật khẩu";
export const FIRST_NAME_REQUIRED_MESSAGE = "Vui lòng nhập tên";
export const LAST_NAME_REQUIRED_MESSAGE = "Vui lòng nhập họ";
export const FULL_NAME_REQUIRED_MESSAGE = "Vui lòng nhập họ tên của bạn";
export const CONFIRM_PASSWORD_REQUIRED_MESSAGE = "Vui lòng nhập lại mật khẩu";
export const PASSWORD_MIN_LENGTH_MESSAGE = `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`;
export const PASSWORD_CONFIRMATION_REQUIRED_MESSAGE =
  "Vui lòng xác nhận mật khẩu";
export const PASSWORD_CONFIRMATION_MATCH_MESSAGE = "Mật khẩu không trùng khớp";
export const PHONE_NUMBER_REQUIRED_MESSAGE = "Vui lòng nhập số điện thoại";
export const PHONE_NUMBER_INVALID_MESSAGE = "Số điện thoại không hợp lệ";
// Khớp BE ShippingInfo.phoneNumber @Length(10, 20) — ngắn hơn là 400 khó hiểu
export const PHONE_NUMBER_MIN_LENGTH = 10;
export const PHONE_NUMBER_MIN_LENGTH_MESSAGE = `Số điện thoại cần ít nhất ${PHONE_NUMBER_MIN_LENGTH} chữ số`;
export const ADDRESS_REQUIRED_MESSAGE = "Vui lòng nhập địa chỉ chi tiết";
export const PROVINCE_REQUIRED_MESSAGE = "Vui lòng nhập Tỉnh/Thành phố";
export const WARD_REQUIRED_MESSAGE = "Vui lòng nhập Phường/Xã";
export const WARD_LOAD_ERROR_MESSAGE =
  "Không tải được danh sách phường/xã, chọn lại Tỉnh/Thành để thử lại";
export const ZIP_REQUIRED_MESSAGE = "Vui lòng nhập mã zip";
export const COUNTRY_REQUIRED_MESSAGE = "Vui lòng chọn đất nước của bạn";
export const PAYMENT_METHOD_MESSAGE = "Vui lòng chọn phương thức thanh toán";
// Khớp BE MakeOrderDto.customerNote @MaxLength(1000)
export const NOTE_MAX_LENGTH = 1000;
export const NOTE_MAX_LENGTH_MESSAGE = `Ghi chú tối đa ${NOTE_MAX_LENGTH} ký tự`;
export const CURRENT_PASSWORD_CONFIRMATION_REQUIRED_MESSAGE =
  "Vui lòng nhập mật khẩu hiện tại";
export const USER_AVATAR_URL_REQUIRED_MESSAGE = "Vui lòng chọn ảnh";

// Đồng bộ với BE AUTH_CONSTANTS.PASSWORD_REGEX (modules/auth/auth.constants.ts) —
// lệch là user qua được validation FE rồi dính 400 khó hiểu từ BE
export const PASSWORD_POLICY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
export const PASSWORD_POLICY_MESSAGE =
  "Mật khẩu cần có chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)";

export const MAX_AVATAR_SIZE_MB = 5;
export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
export const IMAGE_TYPE_MESSAGE = "Chỉ nhận ảnh PNG, JPG hoặc WEBP";
export const IMAGE_SIZE_MESSAGE = `Ảnh tối đa ${MAX_AVATAR_SIZE_MB}MB`;
