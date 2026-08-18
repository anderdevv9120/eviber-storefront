import type { Column } from "@/components/ui/Table/type";

/** Row đơn giản cho Table generic. */
export interface DemoRow {
  id: string;
  name: string;
  email: string;
  status: string;
}

export const tableColumns: Column<DemoRow>[] = [
  { key: "name", title: "Tên", type: "text" },
  { key: "email", title: "Email", type: "text" },
  {
    key: "status",
    title: "Trạng thái",
    type: "badge",
    classBadges: {
      active: "text-green",
      inactive: "text-red",
    },
    booleanText: {
      active: "Hoạt động",
      inactive: "Ngừng",
    },
  },
];

export const tableData: DemoRow[] = [
  { id: "u1", name: "Nguyễn Văn A", email: "a@example.com", status: "active" },
  { id: "u2", name: "Trần Thị B", email: "b@example.com", status: "inactive" },
  { id: "u3", name: "Lê Văn C", email: "c@example.com", status: "active" },
  { id: "u4", name: "Phạm Thị D", email: "d@example.com", status: "active" },
  { id: "u5", name: "Hoàng Văn E", email: "e@example.com", status: "inactive" },
];
