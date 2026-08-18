import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./getErrorMessage";

const FALLBACK = "Có lỗi xảy ra, vui lòng thử lại";

function axiosErrorWithData(data: unknown, message = "request failed") {
  const err = new AxiosError(message);
  err.response = { data } as unknown as AxiosError["response"];
  return err;
}

describe("getErrorMessage", () => {
  it("trả nguyên chuỗi khi err đã là string", () => {
    expect(getErrorMessage("Sai thông tin đăng nhập")).toBe(
      "Sai thông tin đăng nhập"
    );
  });

  it("lấy phần tử đầu khi err là mảng message", () => {
    expect(getErrorMessage(["Email không hợp lệ", "Mật khẩu ngắn"])).toBe(
      "Email không hợp lệ"
    );
  });

  it("mảng rỗng dùng message mặc định", () => {
    expect(getErrorMessage([])).toBe(FALLBACK);
  });

  it("bóc message string từ AxiosError.response.data", () => {
    expect(
      getErrorMessage(axiosErrorWithData({ message: "Email đã tồn tại" }))
    ).toBe("Email đã tồn tại");
  });

  it("bóc phần tử đầu khi message trong response là mảng", () => {
    expect(
      getErrorMessage(axiosErrorWithData({ message: ["Sai OTP", "Hết hạn"] }))
    ).toBe("Sai OTP");
  });

  it("dùng err.message khi AxiosError không có response", () => {
    expect(getErrorMessage(new AxiosError("Network Error"))).toBe(
      "Network Error"
    );
  });

  it("dùng err.message khi response có nhưng thiếu field message", () => {
    expect(getErrorMessage(axiosErrorWithData({}, "request failed"))).toBe(
      "request failed"
    );
  });

  it("mảng message rỗng trong response rơi về err.message (không trả 'undefined')", () => {
    expect(
      getErrorMessage(axiosErrorWithData({ message: [] }, "req 400"))
    ).toBe("req 400");
  });

  it("lấy message của Error thường", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("dùng message mặc định cho kiểu không nhận diện được", () => {
    expect(getErrorMessage(123)).toBe(FALLBACK);
    expect(getErrorMessage({ foo: "bar" })).toBe(FALLBACK);
  });
});
