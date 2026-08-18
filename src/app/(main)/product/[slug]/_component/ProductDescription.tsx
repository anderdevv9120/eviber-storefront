"use client";

import { useState } from "react";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";

interface ProductDescriptionProps {
  descriptionHtml: string;
}

const ProductDescription = ({ descriptionHtml }: ProductDescriptionProps) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => setExpanded(!expanded);

  return (
    <div className="my-4 p-4 pb-1 rounded-md bg-white-50">
      <Accordion
        headerTitle="MÔ TẢ SẢN PHẨM"
        className="text-lg font-medium border-primary-50"
      >
        <ProductDescriptionList
          expanded={expanded}
          descriptionHtml={descriptionHtml}
        />

        <div className="flex justify-center">
          <Button
            variant="outlined"
            className="h-9 px-3 text-base font-normal rounded-l-3xl rounded-r-3xl"
            onClick={toggleExpand}
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
          </Button>
        </div>
      </Accordion>
    </div>
  );
};

type ProductDescriptionListProps = {
  expanded: boolean;
  descriptionHtml: string;
};

const ProductDescriptionList = ({
  expanded,
  descriptionHtml,
}: ProductDescriptionListProps) => {
  return (
    <div className={expanded ? "max-h-full" : "h-52 overflow-hidden"}>
      <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
    </div>
  );
};

export default ProductDescription;
