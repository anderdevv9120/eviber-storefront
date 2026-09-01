import { PASSWORD_POLICY_MESSAGE } from "@/constants/validate";

// Map message lỗi tiếng Anh của BE → tiếng Việt (map theo message string,
// message ngoài bảng hiển thị nguyên văn). BE đổi text là mất map — có fallback.
const AUTH_ERROR_VI: Record<string, string> = {
  "Email or password is incorrect": "Email hoặc mật khẩu không đúng",
  "Please verify your email before logging in":
    "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn.",
  "User already exists": "Email đã được sử dụng",
  "User not found": "Tài khoản không tồn tại",
  "Email does not belong to any account": "Email chưa được đăng ký tài khoản",
  "Email is already verified": "Email đã được xác nhận trước đó",
  "Email verified successfully": "Xác nhận email thành công",
  "Verification email sent successfully": "Đã gửi lại email xác nhận",
  "Verification token has expired. Please request a new one.":
    "Link xác nhận đã hết hạn",
  "Invalid or malformed verification token": "Link xác nhận không hợp lệ",
  "Invalid token type for email verification": "Link xác nhận không hợp lệ",
  "OTP is expired":
    "Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu link mới.",
  "OTP is invalid": "Link đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng.",
  "Invalid reset token format": "Link đặt lại mật khẩu không hợp lệ.",
  "New password must be different from current password":
    "Mật khẩu mới phải khác mật khẩu hiện tại",
  "Email already registered with password. Please login with email/password or reset your password.":
    "Email này đã đăng ký bằng mật khẩu. Vui lòng đăng nhập bằng email và mật khẩu, hoặc dùng quên mật khẩu.",
  "Password must contain at least 8 characters, including uppercase, lowercase, number and special character":
    PASSWORD_POLICY_MESSAGE,
};

export const translateAuthError = (raw: string): string => {
  const mapped = AUTH_ERROR_VI[raw];
  if (mapped) return mapped;
  if (raw.includes("Too Many Requests")) {
    return "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.";
  }
  return raw;
};
