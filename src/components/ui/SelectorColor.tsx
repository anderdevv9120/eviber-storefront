"use client";

import { useState } from "react";
import { cn } from "@/config/utils";
import Button from "@/components/ui/Button";

type ISelectorColorProps = {
  title: string;
  defaultValue: string;
  colors: string[];
  onChangeColor?: (color: string) => void;
  className?: string;
};

const SelectorColor = ({
  title,
  defaultValue,
  colors,
  onChangeColor,
  className,
}: ISelectorColorProps) => {
  const [selectedColor, setSelectedColor] = useState<string>(defaultValue);

  const handleSelectedColor = (color: string) => {
    setSelectedColor(color);
    onChangeColor?.(color);
  };

  return (
    <div className={cn(className)}>
      <p className="mb-2">{title}</p>
      <div className="flex">
        {colors.map((color, index) => (
          <Button
            key={index}
            aria-label={`Chọn màu ${color}`}
            aria-pressed={selectedColor === color}
            className={cn(
              "w-5 h-5 mr-2 rounded-full cursor-pointer",
              selectedColor === color
                ? "outline outline-offset-2 outline-1"
                : ""
            )}
            style={{ backgroundColor: color, outlineColor: color }}
            onClick={() => handleSelectedColor(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default SelectorColor;
