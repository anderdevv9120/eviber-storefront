"use client";

import { useState, useEffect } from "react";
import CardItem from "@/components/ui/CardItem";
import Pagination from "@/components/ui/Pagination";
import { getProducts } from "@/apis/product";
import { IProductListItem } from "@/@types/Product.type";
import useFilterCollectionStore from "@/store/useFilterCollectionStore";
import useIgnoreFirstEffect from "@/hooks/useIgnoreFirstEffect";

const ITEMS_PER_PAGE = 12;

// BE mới hỗ trợ sortBy/sortOrder — filter theo màu/khoảng giá cần BE bổ sung
const SORT_PARAMS: Record<
  string,
  { sortBy: string; sortOrder: "asc" | "desc" }
> = {
  BC: { sortBy: "createdAt", sortOrder: "desc" },
  GT: { sortBy: "price", sortOrder: "asc" },
  GG: { sortBy: "price", sortOrder: "desc" },
};

export default function CollectionProducts() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<IProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const dropdownValue = useFilterCollectionStore(
    (s) => s.filterData.dropdownValue
  );

  useIgnoreFirstEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [dropdownValue]);

  const onPaginationChange = (currentPage: number) => {
    setPage(currentPage);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        const res = await getProducts(
          { page, pageSize: ITEMS_PER_PAGE, ...SORT_PARAMS[dropdownValue] },
          controller.signal
        );
        setItems(res?.data?.data || []);
        setTotal(res?.data?.total || 0);
      } catch (error) {
        // Request bị hủy do đổi page/sort — không phải lỗi, giữ nguyên state
        if (controller.signal.aborted) return;
        setItems([]);
        setTotal(0);
      }
    };
    fetchProducts();

    return () => controller.abort();
  }, [page, dropdownValue]);

  return (
    <div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 h-fit">
        {items.map((item) => (
          <CardItem key={item._id} productItem={item} isVertical />
        ))}
      </div>

      <Pagination
        total={total}
        currentPage={page}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={onPaginationChange}
        className="my-8"
      />
    </div>
  );
}
