"use client";

import { Eye, Trash } from "@/components/icons";
import Table from "@/components/ui/Table";
import { useState } from "react";

export interface DataItem {
  id: string;
  thumbnail?: string;
  design_id?: string;
  title?: string;
  status: "waiting" | "running" | "success" | "error";
  message?: string;
  member_info?: {
    username?: string;
  };
  added_timestamp?: string;
  [key: string]: any;
}

const columns = [
  {
    title: "ID",
    key: "id",
    type: "text",
  },
  {
    title: "Thumbnail",
    key: "thumbnail",
    type: "image",
    className: "max-w-80",
    isQuickLook: true,
  },
  {
    title: "DesignID",
    key: "design_id",
    type: "text",
  },
  {
    title: "Title",
    key: "title",
    type: "text",
  },
  {
    title: "State",
    key: "status",
    type: "badge",
    classBadges: {
      waiting: "text-gray",
      running: "text-blue",
      success: "text-green",
      error: "text-red",
    },
  },
  { title: "Message", key: "message" },
  { title: "Export By", key: "member_info.username" },
  {
    title: "Export Date",
    key: "added_timestamp",
    type: "time",
  },
  {
    title: "Action",
    key: "",
    type: "action",
    className: "w-48",
    actions: [
      {
        icon: <Eye />,
        onClick: (item: DataItem) => console.log(item),
        tooltip: "Download",
      },
      {
        icon: <Trash />,
        onClick: (item: DataItem) => console.log(item),
        tooltip: "Delete Export",
      },
    ],
  },
];

const DataTable: DataItem[] = [
  {
    id: "1",
    thumbnail:
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lt6iilixnqv849",
    design_id: "D001",
    title: "Design Title 1",
    status: "waiting",
    message: "Pending approval",
    member_info: {
      username: "user1",
    },
    added_timestamp: "2024-10-01T10:00:00Z",
  },
  {
    id: "2",
    thumbnail:
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lt6iilixnqv849",
    design_id: "D002",
    title: "Design Title 2",
    status: "running",
    message: "In progress",
    member_info: {
      username: "user2",
    },
    added_timestamp: "2024-10-01T11:30:00Z",
  },
  {
    id: "3",
    thumbnail: "/images/avatar.png",
    design_id: "D003",
    title: "Design Title 3",
    status: "success",
    message: "Completed successfully",
    member_info: {
      username: "user3",
    },
    added_timestamp: "2024-10-01T12:15:00Z",
  },
  {
    id: "4",
    thumbnail: "/images/avatar.png",
    design_id: "D004",
    title: "Design Title 4",
    status: "error",
    message: "Error occurred",
    member_info: {
      username: "user4",
    },
    added_timestamp: "2024-10-01T13:45:00Z",
  },
  {
    id: "5",
    thumbnail: "/images/avatar.png",
    design_id: "D005",
    title: "Design Title 5",
    status: "waiting",
    message: "Pending approval",
    member_info: {
      username: "user5",
    },
    added_timestamp: "2024-10-01T14:30:00Z",
  },
];

export default function TableDemo() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExport, setTotalExport] = useState(0);
  const [idsExportDelete, setIdsExportDelete] = useState<string[]>([]);

  const onSelectChange = (value: string[]) => {
    setIdsExportDelete(value);
  };

  const rowSelection = {
    selectedRowKey: "id",
    onChange: onSelectChange,
  };

  return (
    <Table<DataItem>
      data={DataTable}
      columns={columns}
      rowKey="id"
      rowSelection={rowSelection}
      classNodata="bg-white"
      pagination={{
        total: totalExport,
        currentPage,
        onPageChange: (page) => {
          setCurrentPage(page);
        },
      }}
    />
  );
}
