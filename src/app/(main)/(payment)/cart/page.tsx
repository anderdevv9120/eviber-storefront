"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { getCart, removeFromCart, updateQuantity } from "@/apis/cart";
import { formatPrice } from "@/utils/formatPrice";
import useDebounce from "@/hooks/useDebounce";
import Spin from "@/components/ui/Spin";
import Modal from "@/components/ui/Modal";
import { successToast } from "@/utils/toast";
import ProductItem from "@/components/ui/ProductItem";
import { ICartResponse, ICartProductPayload } from "@/@types/Cart.type";
import { useRouter } from "next/navigation";
import { RightArrow } from "@/components/icons";

export default function Cart() {
  const router = useRouter();
  const [dataCart, setDataCart] = useState<ICartResponse>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [variantIdRemove, setVariantIdRemove] = useState("");
  const [quantityChange, setQuantityChange] = useState<ICartProductPayload>({
    variantId: "",
    quantity: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const debouncedQuantity = useDebounce(quantityChange, 1000);

  useEffect(() => {
    handleGetCart();
  }, []);

  useEffect(() => {
    if (debouncedQuantity.variantId) {
      handleChangeQuantity(debouncedQuantity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuantity]);

  const handleGetCart = async () => {
    try {
      const res = await getCart();
      setDataCart(res?.data);
    } catch {
      // interceptor đã toast lỗi
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCart = (variantId: string) => {
    setIsModalOpen(true);
    setVariantIdRemove(variantId);
  };

  const handleChangeQuantity = async (data: ICartProductPayload) => {
    try {
      await updateQuantity(data);
      await handleGetCart();
      successToast("Cập nhật số lượng thành công");
    } catch {
      // interceptor đã toast lỗi — reload để đồng bộ lại số lượng thật
      handleGetCart();
    }
  };

  const handleDeleteModal = async () => {
    setIsLoading(true);
    try {
      setIsModalOpen(false);
      await removeFromCart({ variantId: variantIdRemove });
      await handleGetCart();
      successToast("Xóa sản phẩm thành công");
    } catch {
      // interceptor đã toast lỗi
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleCheckout = () => {
    setIsLoading(true);
    router.push("/checkout");
  };

  const items = dataCart?.items ?? [];

  return (
    <>
      <div>
        <h1 className="text-4xl md:text-6xl font-semibold pb-6">Giỏ hàng</h1>
        <div className="flex flex-col lg:flex-row gap-7 mt-6">
          <div className="w-full">
            <div className="hidden md:flex justify-between items-center text-lg text-dark-400 font-semibold pb-4 border-b border-b-white-400">
              <div>Sản phẩm</div>
              <div className="flex gap-32">
                <span>Số lượng</span>
                <span>Thành tiền</span>
              </div>
            </div>
            {items.length > 0 ? (
              items.map((item, index) => (
                <ProductItem
                  key={item.variantId}
                  item={item}
                  isPayment={true}
                  className={
                    index === items.length - 1
                      ? ""
                      : "border-b border-b-white-400"
                  }
                  onDeleteClick={handleDeleteCart}
                  onQuantityChange={(variantId, quantity) =>
                    setQuantityChange({ variantId, quantity })
                  }
                />
              ))
            ) : (
              <div className="min-h-28 flex flex-col items-center justify-center h-full text-xl pt-3">
                <span className="text-dark-500">Giỏ hàng trống</span>
                <Image
                  src="/images/cart-empty.png"
                  width={500}
                  height={500}
                  alt="empty-cart"
                  className="w-40 md:w-52"
                />
              </div>
            )}
          </div>

          <div className="w-full lg:w-[500px] h-full px-4 py-8 bg-white-100/85 rounded-lg">
            <h2 className="text-lg mb-3">Tổng tiền</h2>
            <div className="flex justify-between items-center">
              <span className="text-sm">{`${dataCart?.totalQuantity || 0} sản phẩm`}</span>
              <span className="text-base font-bold text-primary-600">
                {formatPrice(dataCart?.totalPrice || 0)}
              </span>
            </div>
            <div className="text-red text-end text-xs mb-6">
              Tiết kiệm: {formatPrice(dataCart?.totalSavings || 0)}
            </div>
            <Spin
              isLoading={isLoading}
              className="text-dark-200 fill-primary-500"
            >
              <Button
                className="w-full text-xl font-extralight select-none"
                onClick={handleCheckout}
                disabled={!dataCart || dataCart.totalQuantity === 0}
              >
                {isLoading ? "Đang xử lý..." : "Thanh toán"}
              </Button>
            </Spin>
          </div>
        </div>
        <a href="/collection" className="hover-underline">
          <div className="text-xl text-primary-700 flex gap-2 items-center hover:text-primary-500 pt-5">
            Tiếp tục mua sắm <RightArrow />
          </div>
        </a>
      </div>

      <Modal
        isOpen={isModalOpen}
        onCancel={handleCancel}
        onOk={handleDeleteModal}
        title="Xác nhận xóa"
        okText="Đồng ý"
        cancelText="Bỏ qua"
      >
        <p>Bạn có muốn xóa sản phẩm ra khỏi giỏ hàng ?</p>
      </Modal>
    </>
  );
}
