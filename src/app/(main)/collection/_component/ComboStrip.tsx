"use client";

import { useEffect, useState } from "react";
import { IComboCard } from "@/@types/Combo.type";
import { getCombos } from "@/apis/combo";
import ComboCardList from "@/components/ui/ComboCardList";
import ContentSlider from "@/components/ui/ContentSlider";

export default function ComboStrip({ categoryKey }: { categoryKey: string }) {
  const [combos, setCombos] = useState<IComboCard[] | null>(null);

  useEffect(() => {
    let active = true;

    getCombos({ category: categoryKey, pageSize: 10 })
      .then((response) => {
        if (active) setCombos(response?.data?.data ?? []);
      })
      .catch(() => {
        if (active) setCombos([]);
      });

    return () => {
      active = false;
    };
  }, [categoryKey]);

  if (!combos?.length) return null;

  return (
    <ContentSlider title="Combo" className="my-6 md:my-8">
      <ComboCardList combos={combos} />
    </ContentSlider>
  );
}
