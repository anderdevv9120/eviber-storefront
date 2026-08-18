import { ReactNode, memo } from "react";
import Link from "next/link";
import { ChevronLeft } from "../icons";

interface IContentSliderProps {
  title: string;
  href?: string;
  children?: ReactNode;
}

const ContentSlider = ({ title, href, children }: IContentSliderProps) => {
  return (
    <div className="overflow-hidden my-24 md:my-24">
      {/* <div className="mb-4"> */}
      <h2 className="text-2xl text-primary-800 text-center uppercase font-medium mb-4">
        {title}
      </h2>
      <div className="flex justify-end mb-5">
        <Link
          href={href || "#"}
          className=" hover-underline"
          style={
            { "--hover-color": "var(--color-primary)" } as React.CSSProperties
          }
        >
          <div className="flex items-center text-dark-900 cursor-pointer transition-colors duration-200 group hover:text-primary-500">
            <span className="font-medium">Xem tất cả</span>
            <ChevronLeft className="w-3 h-3 ml-1 rotate-180 transform transition-all duration-300 ease-out group-hover:translate-x-[2px] group-hover:text-primary-500" />
          </div>
        </Link>
      </div>

      {/* </div> */}

      {children}
    </div>
  );
};

export default memo(ContentSlider);
