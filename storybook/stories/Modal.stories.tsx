import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent, fn, waitFor } from "storybook/test";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { withPortalRoot } from "../decorators/withPortalRoot";

const meta = {
  title: "UI/Modal",
  component: Modal,
  tags: ["autodocs"],
  decorators: [withPortalRoot],
  args: {
    title: "Xác nhận",
    onCancel: fn(),
    onOk: fn(),
  },
  parameters: { a11y: { test: "todo" }, layout: "fullscreen" },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Modal mở sẵn (render vào #portal)
export const Open: Story = {
  args: {
    isOpen: true,
    children: <p>Bạn có chắc chắn muốn tiếp tục không?</p>,
  },
};

export const NoFooter: Story = {
  args: {
    isOpen: true,
    isShowFooter: false,
    children: <p>Modal không có footer.</p>,
  },
};

// Demo open/close bằng state thật
export const Interactive: Story = {
  args: { children: <p>Nội dung modal.</p> },
  render: (args) => {
    const InteractiveModal = () => {
      const [open, setOpen] = useState(false);
      return (
        <div className="p-8">
          <Button onClick={() => setOpen(true)}>Mở Modal</Button>
          <Modal
            {...args}
            isOpen={open}
            onCancel={() => setOpen(false)}
            onOk={() => setOpen(false)}
          />
        </div>
      );
    };
    return <InteractiveModal />;
  },
};

/**
 * Click overlay đóng modal → onCancel được gọi đúng 1 lần.
 * (Modal render trong #portal nên dùng screen/document.body, không dùng canvas.)
 */
export const OverlayClickClosesOnce: Story = {
  args: {
    isOpen: true,
    children: <p>Click ra ngoài để đóng.</p>,
  },
  play: async ({ args }) => {
    const dialog = await screen.findByRole("dialog");
    await expect(dialog).toBeInTheDocument();

    // Overlay là phần tử aria-hidden bên trong dialog
    const overlay = dialog.querySelector<HTMLElement>('[aria-hidden="true"]');
    await expect(overlay).toBeTruthy();

    await userEvent.pointer({ target: overlay!, keys: "[MouseLeft]" });
    await waitFor(() => expect(args.onCancel).toHaveBeenCalledTimes(1));
  },
};
