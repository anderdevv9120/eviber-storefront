/**
 * Mock TỰ CHỨA cho stories lô 3 (nhóm UI tương tác + trình bày).
 * Không phụ thuộc mạng ngoài; dùng data thuần / icon nội bộ.
 */
import React from "react";
import { Guarantee, Exchange, HeartInsurance } from "@/components/icons";
import { svgPlaceholder } from "./images";

/** Options cho Dropdown / InputRadio. */
export const DROPDOWN_OPTIONS = [
  { label: "Áo thun", value: "tshirt" },
  { label: "Quần jean", value: "jean" },
  { label: "Giày sneaker", value: "sneaker" },
  { label: "Mũ lưỡi trai", value: "cap" },
];

export const RADIO_OPTIONS = [
  { label: "Nam", value: "male" },
  { label: "Nữ", value: "female" },
  { label: "Khác (tạm ẩn)", value: "other", isDisabled: true },
];

/** tabItems cho Tabs. */
export const TAB_ITEMS = [
  { key: "desc", label: "Mô tả", children: <p>Nội dung mô tả sản phẩm.</p> },
  { key: "spec", label: "Thông số", children: <p>Bảng thông số kỹ thuật.</p> },
  {
    key: "review",
    label: "Đánh giá",
    children: <p>Danh sách đánh giá khách hàng.</p>,
  },
];

export const TAB_ITEMS_WITH_DISABLED = [
  { key: "desc", label: "Mô tả", children: <p>Nội dung mô tả sản phẩm.</p> },
  {
    key: "spec",
    label: "Thông số (khoá)",
    children: <p>Bảng thông số kỹ thuật.</p>,
    disabled: true,
  },
  {
    key: "review",
    label: "Đánh giá",
    children: <p>Danh sách đánh giá khách hàng.</p>,
  },
];

/** Bảng màu cho SelectorColor. */
export const COLORS = ["#E01020", "#0089ED", "#009060", "#F9A825", "#242424"];

/** Steps cho ProgressStepper. */
export const STEP_ITEMS = [
  { stepNumber: 1, title: "Giỏ hàng" },
  { stepNumber: 2, title: "Thanh toán" },
  { stepNumber: 3, title: "Hoàn tất" },
];

/** Policies cho ProductPolicy (Icon là component icon nội bộ). */
export const POLICIES = [
  {
    Icon: Guarantee,
    title: "Bảo hành chính hãng",
    description: "12 tháng đổi mới",
  },
  {
    Icon: Exchange,
    title: "Đổi trả 7 ngày",
    description: "Miễn phí đổi trả",
  },
  {
    Icon: HeartInsurance,
    title: "Cam kết chất lượng",
    description: "Hàng đúng mô tả",
  },
];

/** Actions cho Table/ActionCell. */
export type DemoActionItem = { id: string; name: string };

export const ACTION_ITEM: DemoActionItem = { id: "u1", name: "Nguyễn Văn A" };

/** Ảnh data-URI cho ImageCell (tránh URL ngoài). */
export const CELL_IMAGE = svgPlaceholder("Sản phẩm", "#0E7C66", 300, 300);
