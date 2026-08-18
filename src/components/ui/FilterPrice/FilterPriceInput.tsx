import InputNumber from "@/components/ui/InputNumber";

interface FilterPriceInputProps {
  label: string;
  value: number;
  maxPrice?: number;
  minPrice?: number;
  onChange: (value: number) => void;
}

const FilterPriceInput = ({
  label,
  value,
  maxPrice,
  minPrice = 0,
  onChange,
}: FilterPriceInputProps) => {
  const displayText = label === "Từ" ? "Giá thấp nhất" : "Giá cao nhất";

  return (
    <div>
      <span className="flex font-normal">
        <p className="text-dark-300">{displayText}</p>
      </span>
      <InputNumber
        className="w-24 text-center mt-1 p-0 py-2 border border-dark-100 border-solid rounded-sm outline-none select-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-100"
        onChange={onChange}
        min={minPrice}
        max={maxPrice}
        placeholder={label}
        value={value}
      />
    </div>
  );
};

export default FilterPriceInput;
