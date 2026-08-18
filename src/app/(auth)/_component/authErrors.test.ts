import { describe, expect, it } from "vitest";
import { translateAuthError } from "./authErrors";
import { PASSWORD_POLICY_MESSAGE } from "@/constants/validate";

describe("translateAuthError", () => {
  it("map các message auth chính của BE sang tiếng Việt", () => {
    expect(translateAuthError("Email or password is incorrect")).toBe(
      "Email hoặc mật khẩu không đúng"
    );
    expect(
      translateAuthError("Please verify your email before logging in")
    ).toBe("Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn.");
    expect(translateAuthError("User already exists")).toBe(
      "Email đã được sử dụng"
    );
    expect(
      translateAuthError("New password must be different from current password")
    ).toBe("Mật khẩu mới phải khác mật khẩu hiện tại");
  });

  it("message PASSWORD_WEAK của BE map về đúng message policy dùng chung với yup", () => {
    expect(
      translateAuthError(
        "Password must contain at least 8 characters, including uppercase, lowercase, number and special character"
      )
    ).toBe(PASSWORD_POLICY_MESSAGE);
  });

  it("throttle 429 (mọi biến thể chứa 'Too Many Requests') → message chờ chung", () => {
    expect(translateAuthError("ThrottlerException: Too Many Requests")).toBe(
      "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút."
    );
  });

  it("message ngoài bảng map → hiển thị nguyên văn (fallback, không nuốt lỗi)", () => {
    expect(translateAuthError("Some brand new backend error")).toBe(
      "Some brand new backend error"
    );
    expect(translateAuthError("")).toBe("");
  });
});
