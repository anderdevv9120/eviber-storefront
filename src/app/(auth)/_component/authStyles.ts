// Style cụm auth theo bản tham khảo user chốt (xem worknotes-auth.md):
// label 14px semibold giữ hoa/thường gốc; input/button bo rounded-xl, cao hơn mặc định
export const AUTH_FIELD_LABEL = "text-sm font-semibold normal-case pb-1.5";
export const AUTH_INPUT = "rounded-xl border-white-600 px-4 py-3.5 text-base";
// Ngoại lệ màu CTA của cụm auth (nấc 700 theo ảnh tham khảo user chốt — quy ước
// palette toàn site vẫn là 600 nền CTA). Geometry/variant đã gộp vào Button
// (size="lg", secondary/outline); phase 2 chốt nấc màu chính thức thì xóa nốt dòng này.
export const AUTH_CTA_COLOR = "bg-primary-700 hover:bg-primary-800";
