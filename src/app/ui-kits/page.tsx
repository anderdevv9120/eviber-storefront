"use client";

import { useState } from "react";
import { Search, CartPlus } from "@/components/icons";
import { cn } from "@/config/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import CardItem from "@/components/ui/CardItem";
import Category from "@/components/ui/Category";
import FilterPrice from "@/components/ui/FilterPrice";
import Pagination from "@/components/ui/Pagination";
import Filter from "../../components/ui/Filter";
import Image from "next/image";
import Header from "@/layouts/Header";
import Footer from "@/layouts/Footer";
import Carousel from "@/components/ui/Carousel";
import Counter from "@/components/ui/Counter";
import Selector from "@/components/ui/Selector";
import ProgressStepper from "@/components/ui/ProgressStepper";
import ProductReview from "@/components/ui/Review";
import { addToCart } from "@/apis/cart";
import Tabs from "@/components/ui/Tabs";
import Modal from "@/components/ui/Modal";
import Checkbox from "@/components/ui/Checkbox";
import ToggleButton from "@/components/ui/ToggleButton";

import {
  dataFilter,
  dataReview,
  dataCategory,
  images,
  cardItems,
  optionsDropdown,
  products,
} from "@/mocks/fetchData";
import Table from "@/components/ui/Table";
import TableDemo from "./_component/TableDemo";
import { RadioGroup } from "@/components/ui/InputRadio/Radio";
import InputPassword from "@/components/ui/InputPassword";

const selectorValues = [
  { label: "xl", value: "a", isAvailable: true },
  { label: "sm", value: "v", isAvailable: true },
  { label: "2xl", value: "g", isAvailable: false },
  { label: "3xl", value: "e", isAvailable: true },
  { label: "m", value: "k", isAvailable: false },
  { label: "l", value: "x", isAvailable: false },
];

const tabData = [
  {
    key: "1",
    label: "Tab 1",
    children: "Nội dung tab 1",
    disabled: true,
  },
  {
    key: "2",
    label: "Tab 2",
    children: "Nội dung tab 2",
  },
  {
    key: "3",
    label: "Tab 3",
    children: "Nội dung tab 3",
  },
];

const profileTabData = [
  {
    key: "profile",
    label: "Profile",
    children: (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">User Profile</h3>
        <p>Manage your personal information and account settings.</p>
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" defaultValue="John" />
          <Input label="Last Name" defaultValue="Doe" />
        </div>
      </div>
    ),
  },
  {
    key: "settings",
    label: "Settings",
    children: (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Account Settings</h3>
        <div className="space-y-3">
          <Checkbox label="Enable notifications" defaultChecked />
          <Checkbox label="Email marketing" />
          <div className="flex items-center gap-3">
            <ToggleButton defaultToggle={true} />
            <span>Dark mode</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "security",
    label: "Security",
    children: (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Security Settings</h3>
        <p>Manage your password and security preferences.</p>
        <Button variant="outlined">Change Password</Button>
      </div>
    ),
  },
  {
    key: "billing",
    label: "Billing",
    children: (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Billing Information</h3>
        <p>View and manage your billing details.</p>
        <div className="text-sm text-gray-600">
          Next billing date: January 15, 2024
        </div>
      </div>
    ),
    disabled: true,
  },
];

export default function UIKits() {
  const [selectedItem, setSelectedItem] = useState("");
  const [page, setPage] = useState(1);
  const [orderCount, setOrderCount] = useState(0);
  const [activeItem, setActiveItem] = useState<string | number>("43");
  const [count, setCount] = useState(1);
  const [activeTab, setActiveTab] = useState<BaseValueType>(tabData[1].key);
  const [profileActiveTab, setProfileActiveTab] = useState<BaseValueType>(
    profileTabData[0].key
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [toggleValue, setToggleValue] = useState(false);

  const handlePaymentMethodChange = (value: BaseValueType) => {
    console.log(value);
  };

  const onPaginationChange = (currentPage: number) => {
    setPage(currentPage);
  };

  const [selectedValue, setSelectedValue] = useState<BaseValueType>(1);

  const handleChange = (selectedValue: BaseValueType, selectedItem: any) => {
    setSelectedValue(selectedValue);
    console.log("Selected Value:", selectedValue);
    console.log("Selected Item:", selectedItem);
  };

  const handleChangePrice = (min: number, max: number) => {
    console.log("max: ", min, max);
  };

  const handleAddToCart = async (data: {
    variantId: string;
    quantity: number;
  }) => {
    try {
      await addToCart(data);
    } catch {
      // playground — bỏ qua lỗi
    }
  };

  return (
    <>
      <main className={cn("mx-10 mt-10 mb-20 space-y-8")}>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-center mb-8">
            UI Components Showcase
          </h1>

          {/* Buttons Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Buttons</h2>
            <h3 className="text-sm font-medium text-dark-500">
              Size md (mặc định)
            </h3>
            <div className="space-x-2 flex flex-wrap gap-2">
              <Button
                variant="outlined"
                onClick={() => {
                  console.log("outlined button clicked");
                }}
              >
                <CartPlus /> Outlined (legacy)
              </Button>
              <Button disabled variant="outlined">
                <CartPlus /> Disabled Outlined
              </Button>
              <Button>
                <CartPlus /> Primary Button
              </Button>
              <Button disabled>
                <CartPlus /> Disabled Primary
              </Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button loading>Đang xử lý</Button>
            </div>
            <h3 className="text-sm font-medium text-dark-500">
              Size lg — primary/outline tự nhận bold, secondary giữ medium
            </h3>
            <div className="space-x-2 flex flex-wrap gap-2 items-center">
              <Button size="lg">Primary lg</Button>
              <Button size="lg" variant="secondary">
                Secondary lg
              </Button>
              <Button size="lg" variant="outline">
                Outline lg
              </Button>
              <Button size="lg" variant="secondary" disabled>
                Gửi lại sau 60s
              </Button>
              <Button size="lg" variant="outline" disabled>
                Gửi lại sau 60s
              </Button>
              <Button size="lg" loading>
                Đang xử lý
              </Button>
            </div>
          </section>

          {/* Inputs Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Inputs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Outlined Input"
                placeholder="Enter text..."
                error="Sample error message"
                icon={<Search className="text-primary-500" />}
              />
              <Input
                type="text"
                label="Standard Input"
                variant="standard"
                placeholder="Enter text..."
                icon={<Search className="text-primary-500" />}
              />
              <Input
                type="text"
                label="Filled Input"
                variant="filled"
                placeholder="Enter text..."
              />
              <Input
                type="text"
                label="Disabled Input"
                disabled
                placeholder="Disabled input"
              />
            </div>
            <InputPassword
              label="Password Input"
              placeholder="Enter password"
            />
          </section>

          {/* Dropdowns Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Dropdowns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Dropdown
                size="lg"
                isShowSearch
                value={selectedItem}
                onChange={setSelectedItem}
                placeholder="Search provinces..."
                options={[
                  { value: "HN", label: "Hà Nội" },
                  { value: "HD", label: "Hải Dương" },
                  { value: "HP", label: "Hải Phòng" },
                  { value: "HB", label: "Hòa Bình" },
                  { value: "PT", label: "Phú Thọ" },
                  { value: "CB", label: "Cao Bằng" },
                  { value: "LS", label: "Lạng Sơn" },
                  { value: "DB", label: "Điện Biên" },
                  { value: "TH", label: "Thanh Hóa" },
                ]}
              />
              <Dropdown
                size="lg"
                placeholder="Select city..."
                onChange={(value) => console.log("Selected:", value)}
                options={[
                  { value: "DB2", label: "Điện Biên 2" },
                  { value: "TH2", label: "Thanh Hóa 2" },
                ]}
              />
              <Dropdown
                size="lg"
                disabled
                placeholder="Disabled dropdown"
                options={[
                  { value: "HN", label: "Hà Nội" },
                  { value: "HD", label: "Hải Dương" },
                ]}
              />
            </div>
          </section>

          {/* Modal Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Modal</h2>
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            <Modal
              isOpen={isModalOpen}
              title="Sample Modal"
              onCancel={() => setIsModalOpen(false)}
              onOk={() => {
                console.log("Modal confirmed");
                setIsModalOpen(false);
              }}
              cancelText="Cancel"
              okText="Confirm"
            >
              <p>
                This is a sample modal with accessibility features including
                keyboard navigation (ESC to close), focus management, and ARIA
                attributes.
              </p>
              <p className="mt-2">
                Try pressing the ESC key to close this modal!
              </p>
            </Modal>
          </section>

          {/* Checkbox & Toggle Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Checkboxes & Toggles</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Checkboxes</h3>
                <div className="space-y-3">
                  <Checkbox
                    label="Sample Checkbox"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <Checkbox label="Disabled Checkbox" disabled defaultChecked />
                  <Checkbox
                    label="Uncontrolled Checkbox"
                    defaultChecked={false}
                    onChange={(checked) =>
                      console.log("Uncontrolled:", checked)
                    }
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Toggle Buttons</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <ToggleButton
                      value={toggleValue}
                      onChange={setToggleValue}
                    />
                    <span>
                      Controlled Toggle (current: {toggleValue ? "ON" : "OFF"})
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <ToggleButton
                      defaultToggle={false}
                      onChange={(value) =>
                        console.log("Uncontrolled toggle:", value)
                      }
                    />
                    <span>Uncontrolled Toggle (check console)</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <ToggleButton
                      defaultToggle={true}
                      onChange={(value) =>
                        console.log("Default ON toggle:", value)
                      }
                    />
                    <span>Uncontrolled Toggle (default ON)</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <ToggleButton disabled defaultToggle={true} />
                    <span>Disabled Toggle (ON)</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <ToggleButton disabled defaultToggle={false} />
                    <span>Disabled Toggle (OFF)</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <ToggleButton value={false} disabled />
                    <span>Disabled Controlled Toggle</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Tabs</h2>

            <div>
              <h3 className="text-lg font-medium mb-3">
                Basic Tabs (with disabled tab)
              </h3>
              <Tabs
                tabItems={tabData}
                onChange={setActiveTab}
                activeKey={activeTab}
              />
              <div className="text-sm text-gray-600 mt-2">
                Tab 1 is disabled. Current active: {activeTab}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">
                Profile Settings Tabs
              </h3>
              <Tabs
                tabItems={profileTabData}
                onChange={setProfileActiveTab}
                activeKey={profileActiveTab}
              />
              <div className="text-sm text-gray-600 mt-2">
                Interactive tabs with form components. Billing tab is disabled.
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Uncontrolled Tabs</h3>
              <Tabs
                tabItems={[
                  {
                    key: "overview",
                    label: "Overview",
                    children: (
                      <div>
                        <h4 className="font-medium mb-2">System Overview</h4>
                        <p>
                          This is an uncontrolled tab component that manages its
                          own state.
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "analytics",
                    label: "Analytics",
                    children: (
                      <div>
                        <h4 className="font-medium mb-2">
                          Analytics Dashboard
                        </h4>
                        <p>View your application analytics and metrics here.</p>
                      </div>
                    ),
                  },
                  {
                    key: "reports",
                    label: "Reports",
                    children: (
                      <div>
                        <h4 className="font-medium mb-2">Generated Reports</h4>
                        <p>Access and download your reports.</p>
                      </div>
                    ),
                  },
                ]}
                defaultActiveKey="analytics"
                onChange={(key) =>
                  console.log("Uncontrolled tab changed:", key)
                }
              />
            </div>

            <div className="text-gray-600 text-sm">
              <strong>Features:</strong> Keyboard navigation (Enter/Space),
              disabled state support, controlled/uncontrolled modes
            </div>
          </section>

          {/* Counter Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Counter</h2>
            <Counter
              min={0}
              max={10}
              defaultValue={1}
              onChangeCount={(count) => {
                console.log("Counter value:", count);
              }}
            />
            <Counter disabled defaultValue={5} min={0} max={10} />
          </section>

          {/* Selector Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Selector</h2>
            <Selector
              options={selectorValues}
              value={selectedValue}
              onChange={handleChange}
            />
          </section>

          {/* Pagination Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Pagination</h2>
            <Pagination
              total={200}
              currentPage={page}
              pageSize={10}
              onPageChange={onPaginationChange}
            />
          </section>

          {/* Progress Stepper Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Progress Stepper</h2>
            <div className="flex gap-4 items-center mb-4">
              <button
                className="px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-600"
                onClick={() => setCount(Math.max(1, count - 1))}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-600"
                onClick={() => setCount(Math.min(4, count + 1))}
              >
                Next
              </button>
              <span>Current Step: {count}</span>
            </div>
            <ProgressStepper
              currentStep={count}
              stepItems={[
                { title: "Đăng nhập", stepNumber: 1 },
                { title: "Nhập thông tin", stepNumber: 2 },
                { title: "Thanh toán", stepNumber: 3 },
                { title: "Hoàn thành", stepNumber: 4 },
              ]}
            />
          </section>

          {/* Radio Group Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Radio Group</h2>
            <RadioGroup
              options={[
                { label: "Thanh toán khi nhận hàng", value: "cod" },
                { label: "Thanh toán chuyển khoản", value: "bank" },
                {
                  label: "Thanh toán qua thẻ",
                  value: "card",
                  disabled: true,
                },
              ]}
              defaultValue="bank"
              onChange={handlePaymentMethodChange}
            />
          </section>

          {/* Filter Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Filters</h2>
            <div className="max-w-64 space-y-4">
              <Filter data={dataFilter} onChange={console.log} />
              <FilterPrice
                maxPrice={1_000_000}
                step={50_000}
                onChange={handleChangePrice}
              />
            </div>
          </section>

          {/* Table Demo */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Table</h2>
            <TableDemo />
          </section>

          <div className="text-center py-8 border-t border-gray-200">
            <p className="text-gray-600">
              All components are optimized with React.memo, accessibility
              features, and keyboard navigation support.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
