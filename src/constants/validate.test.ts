import { describe, expect, it } from "vitest";
import { PASSWORD_POLICY_REGEX, MIN_PASSWORD_LENGTH } from "./validate";

// Regex này PHẢI đồng bộ với BE AUTH_CONSTANTS.PASSWORD_REGEX
// (x-ecommerce-backend/src/modules/auth/auth.constants.ts) — lệch là user qua được
// validation FE rồi dính 400 từ BE. Case dưới ghim đúng hành vi của regex BE.
describe("PASSWORD_POLICY_REGEX", () => {
  it("chấp nhận mật khẩu đủ hoa + thường + số + ký tự đặc biệt", () => {
    expect("Thuc1147@").toMatch(PASSWORD_POLICY_REGEX);
    expect("Str0ng@Pass").toMatch(PASSWORD_POLICY_REGEX);
    expect("aB3$aB3$").toMatch(PASSWORD_POLICY_REGEX);
  });

  it("từ chối khi thiếu ký tự đặc biệt (case thật đã bắt được khi test: Thuc1147)", () => {
    expect("Thuc1147").not.toMatch(PASSWORD_POLICY_REGEX);
  });

  it("từ chối khi thiếu một trong các nhóm còn lại", () => {
    expect("thuc1147@").not.toMatch(PASSWORD_POLICY_REGEX); // thiếu hoa
    expect("THUC1147@").not.toMatch(PASSWORD_POLICY_REGEX); // thiếu thường
    expect("ThucThuc@").not.toMatch(PASSWORD_POLICY_REGEX); // thiếu số
  });

  it("chỉ nhận ký tự đặc biệt trong bộ @$!%*?& (giống BE — ký tự ngoài bộ chặn từ ký tự đầu)", () => {
    expect("Thuc1147!").toMatch(PASSWORD_POLICY_REGEX);
    // '#' không thuộc bộ cho phép của BE — đứng đầu chuỗi là fail match từ ký tự đầu tiên
    expect("#Thuc1147").not.toMatch(PASSWORD_POLICY_REGEX);
  });

  it("MIN_PASSWORD_LENGTH khớp policy BE (8) — yup check độ dài, regex check thành phần", () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);
  });
});
