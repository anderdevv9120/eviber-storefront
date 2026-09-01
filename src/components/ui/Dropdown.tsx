"use client";

import { ChevronDown } from "@/components/icons";
import { cn } from "@/config/utils";
import useClickOutside from "@/hooks/useClickOutside";
import { useState, useRef, useMemo, useEffect, useId } from "react";
import ErrorMessage from "./ErrorMessage";

interface IDropdownItem {
  label: string;
  value: BaseValueInputType;
}

interface DropdownProps<T extends BaseValueType> {
  size?: "sm" | "lg";
  placeholder?: string;
  options: IDropdownItem[];
  disabled?: boolean;
  className?: string;
  isShowSearch?: boolean;
  value?: T;
  defaultValue?: T;
  error?: string;
  noResultsText?: string;
  onChange?: (selectedValue: T, selectedItem: IDropdownItem) => void;
  onSearchChange?: (searchValue: string) => void;
}

const Dropdown = <T extends BaseValueType>({
  size = "sm",
  placeholder = "Select an option",
  options,
  value,
  defaultValue,
  className,
  error,
  disabled = false,
  isShowSearch = false,
  noResultsText = "No results found",
  onChange,
  onSearchChange,
}: DropdownProps<T>) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownTop, setIsDropdownTop] = useState(false);
  const [selectedValue, setSelectedValue] =
    useState<BaseValueType>(defaultValue);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : selectedValue;

  // Sync selected value with options when they change
  useEffect(() => {
    if (
      currentValue !== undefined &&
      !options.find((option) => option.value === currentValue)
    ) {
      if (!isControlled) {
        setSelectedValue(defaultValue);
      }
    }
  }, [options, currentValue, defaultValue, isControlled]);

  const selectedItem = useMemo(
    () => options.find((option) => option.value === currentValue),
    [options, currentValue]
  );

  const filteredOptions = useMemo(() => {
    return isShowSearch
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;
  }, [searchTerm, options, isShowSearch]);

  const toggleDropdown = (forceOpen?: boolean) => {
    if (disabled) return;

    const newIsOpen = forceOpen !== undefined ? forceOpen : !isOpen;

    if (newIsOpen && !isOpen) {
      // Calculate position for dropdown
      const dropdownEl = dropdownRef.current;
      if (dropdownEl) {
        const rect = dropdownEl.getBoundingClientRect();
        setIsDropdownTop(window.innerHeight - rect.bottom < 300);
      }
    }

    setIsOpen(newIsOpen);
    setActiveIndex(-1);
  };

  const handleSelectItem = (item: IDropdownItem) => {
    if (!isControlled) {
      setSelectedValue(item.value);
    }

    // Call onChange callback
    onChange?.(item.value as T, item);

    // Clear search and close dropdown
    setSearchTerm("");
    onSearchChange?.("");
    setIsOpen(false);
  };

  const onChangeSearch = (value: string) => {
    setSearchTerm(value);
    setActiveIndex(-1);
    onSearchChange?.(value);
  };

  useClickOutside(dropdownRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  useEffect(() => {
    if (isOpen && isShowSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isShowSearch]);

  return (
    <div className={cn("relative w-fit h-fit", className)} ref={dropdownRef}>
      <div
        className={cn(
          "flex items-center justify-between select-none border transition-colors h-full focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-100",
          {
            // sm: viền hairline + bo lớn (form checkout dùng lg — giữ nguyên border đậm)
            "px-3 py-2 rounded-lg border-white-600": size === "sm",
            "px-3.5 py-3 rounded-xl border-dark-200": size === "lg",
            "cursor-pointer hover:border-primary": !disabled,
            "text-dark-300": (!currentValue && !searchTerm) || disabled,
            "opacity-75 cursor-not-allowed": disabled,
            "border-red-500": error,
          }
        )}
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          // Sự kiện từ search input bên trong cũng bubble tới đây —
          // chỉ Enter/Space GÕ TRÊN CHÍNH TRIGGER mới toggle, còn trong input
          // phải giữ nguyên hành vi gõ chữ (Space từng bị nuốt + đóng dropdown)
          const fromTrigger = e.target === e.currentTarget;
          if (e.key === "Escape") {
            toggleDropdown(false);
            return;
          }
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!isOpen) {
              toggleDropdown(true);
              return;
            }
            const max = filteredOptions.length - 1;
            if (max < 0) return;
            setActiveIndex((prev) =>
              e.key === "ArrowDown"
                ? prev >= max
                  ? 0
                  : prev + 1
                : prev <= 0
                  ? max
                  : prev - 1
            );
            return;
          }
          if (e.key === "Enter") {
            if (isOpen && activeIndex >= 0 && filteredOptions[activeIndex]) {
              e.preventDefault();
              handleSelectItem(filteredOptions[activeIndex]);
            } else if (fromTrigger) {
              e.preventDefault();
              toggleDropdown();
            }
            return;
          }
          if (e.key === " " && fromTrigger) {
            e.preventDefault();
            toggleDropdown();
          }
        }}
        onClick={(e) => {
          // Click đặt con trỏ vào search input không được đóng dropdown
          if ((e.target as HTMLElement).tagName === "INPUT") return;
          toggleDropdown();
        }}
      >
        <div className="flex-1 min-w-0">
          {isShowSearch && isOpen ? (
            <input
              ref={inputRef}
              placeholder={selectedItem?.label || placeholder}
              value={searchTerm}
              onChange={(e) => onChangeSearch(e.target.value)}
              className="w-full border-none outline-none focus:ring-0 bg-transparent placeholder:text-dark-300"
              disabled={disabled}
            />
          ) : (
            <span
              className={cn(
                "block truncate",
                size === "sm" ? "text-sm" : "text-lg",
                !currentValue ? "text-dark-300" : "text-dark"
              )}
            >
              {selectedItem?.label || placeholder}
            </span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "ml-2 transition-transform flex-shrink-0",
            size === "sm" ? "w-3 h-3 text-dark-400" : "w-4 h-4",
            isOpen && "rotate-180"
          )}
        />
      </div>
      {error && <ErrorMessage message={error} className="mt-1" />}

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className={cn(
            "absolute w-full py-1 z-50 rounded-lg bg-white shadow-lg border border-white-500 max-h-64 overflow-auto scrollbarStyle",
            isDropdownTop
              ? "bottom-full mb-1 animate-[fadeInUp_0.15s]"
              : "top-full mt-1 animate-[fadeInDown_0.15s]"
          )}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-dark-300">{noResultsText}</div>
          ) : (
            filteredOptions.map((item, index) => (
              <div
                key={`dropdown-${String(item.value)}-${index}`}
                role="option"
                aria-selected={item.value === currentValue}
                onClick={() => handleSelectItem(item)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "cursor-pointer transition-colors",
                  {
                    "px-3 py-2.5 text-sm": size === "sm",
                    "px-4 py-3": size === "lg",
                  },
                  item.value === currentValue
                    ? "bg-primary-50 font-medium text-primary-700"
                    : "text-dark hover:bg-white-100",
                  activeIndex === index &&
                    item.value !== currentValue &&
                    "bg-white-100"
                )}
              >
                {item.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

Dropdown.displayName = "Dropdown";

export default Dropdown;
