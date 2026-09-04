"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAddress,
  deleteAddress,
  editAddress,
  getAddresses,
  IAddressProps,
} from "@/apis/profile";
import { IAddress } from "@/@types/Address.type";
import Button from "@/components/ui/Button";
import { MapPin, PenOutline, Plus, TrashOutline } from "@/components/icons";
import { cn } from "@/config/utils";
import { successToast } from "@/utils/toast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import AddressModal from "./_component/AddressModal";
import DeleteAddressModal from "./_component/DeleteAddressModal";
import SetPrimaryAddressModal from "./_component/SetPrimaryAddressModal";

const COUNTRY = "Việt Nam";

const ICON_BUTTON =
  "relative flex h-8 w-8 items-center justify-center rounded-md text-dark-400 transition-colors after:absolute after:-inset-1 hover:bg-white-100 hover:text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100";

// Địa chỉ 2 cấp không có huyện — bỏ phần rỗng để không lòi dấu phẩy thừa
const formatAddress = (address: IAddress) =>
  [address.specificAddress, address.ward, address.district, address.city]
    .filter(Boolean)
    .join(", ");

const AddressList = () => {
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<IAddress>();
  const [deletingAddress, setDeletingAddress] = useState<IAddress>();
  const [primaryCandidate, setPrimaryCandidate] = useState<IAddress>();
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // silent: tải lại nền khi đã có danh sách (sau khi xóa địa chỉ mặc định) — không
  // thay list đang hiện bằng skeleton
  const fetchAddressList = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) setIsLoading(true);
      setLoadError("");
      try {
        const res = await getAddresses();
        setAddresses(res.data);
      } catch (error: unknown) {
        setLoadError(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAddressList();
  }, [fetchAddressList]);

  const openCreate = () => {
    setEditingAddress(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (address: IAddress) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAddress(undefined);
  };

  const handleSaveAddress = async (data: IAddressProps) => {
    // Enter trong input vẫn submit form khi nút Lưu đang loading
    if (isSaving) return;
    // district gửi rỗng thay vì bỏ field: BE PUT merge từng field, bỏ field là
    // huyện cũ (địa chỉ 3 cấp) còn nguyên trong DB sau khi user đã chọn lại xã
    const body = { ...data, district: "", country: COUNTRY };
    setIsSaving(true);
    try {
      if (editingAddress?._id) {
        const id = editingAddress._id;
        const res = await editAddress(id, body);
        setAddresses((prev) =>
          prev.map((address) =>
            address._id === id
              ? res.data
              : { ...address, primary: body.primary ? false : address.primary }
          )
        );
      } else {
        const res = await createAddress(body);
        setAddresses(res.data);
      }
      successToast("Đã lưu địa chỉ");
      closeForm();
    } catch {
      // interceptor đã toast lỗi — giữ form mở để user sửa rồi lưu lại
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!deletingAddress?._id || isSaving) return;
    const id = deletingAddress._id;
    setIsSaving(true);
    try {
      await deleteAddress(id);
      successToast("Đã xóa địa chỉ");
      setDeletingAddress(undefined);
      if (deletingAddress.primary && addresses.length > 1) {
        await fetchAddressList({ silent: true });
      } else {
        setAddresses((prev) => prev.filter((address) => address._id !== id));
      }
    } catch {
      // interceptor đã toast lỗi
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetPrimary = async () => {
    if (!primaryCandidate?._id || isSaving) return;
    // Strip _id khỏi body — DTO BE forbidNonWhitelisted sẽ reject field lạ
    const { _id, ...body } = primaryCandidate;
    setIsSaving(true);
    try {
      const res = await editAddress(_id, { ...body, primary: true });
      setAddresses((prev) =>
        prev.map((address) =>
          address._id === _id ? res.data : { ...address, primary: false }
        )
      );
      successToast("Đã đặt làm địa chỉ mặc định");
      setPrimaryCandidate(undefined);
    } catch {
      // interceptor đã toast lỗi
    } finally {
      setIsSaving(false);
    }
  };

  const sortedAddresses = [...addresses].sort(
    (a, b) => Number(b.primary) - Number(a.primary)
  );

  const renderBody = () => {
    if (isLoading) {
      return (
        <ul aria-busy aria-label="Đang tải địa chỉ">
          {[0, 1].map((i) => (
            <li
              key={i}
              className="flex items-center gap-4 border-t border-white-300 p-4 first:border-t-0 sm:px-6 sm:py-5"
            >
              <div className="flex flex-1 flex-col gap-2.5">
                <div className="h-3.5 w-2/5 animate-pulse rounded bg-white-300" />
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-white-300" />
              </div>
              <div className="h-9 w-28 animate-pulse rounded bg-white-300" />
            </li>
          ))}
        </ul>
      );
    }

    if (loadError) {
      return (
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:px-6 sm:py-5">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Không tải được danh sách địa chỉ</p>
            <p className="text-sm text-dark-400">{loadError}</p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="px-5"
            onClick={() => fetchAddressList()}
          >
            Thử lại
          </Button>
        </div>
      );
    }

    if (sortedAddresses.length === 0) {
      return (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <MapPin className="h-[26px] w-[26px]" />
          </div>
          <p className="font-bold">Chưa có địa chỉ nhận hàng</p>
          <p className="mt-1 max-w-[360px] text-sm text-dark-400">
            Thêm địa chỉ để bước thanh toán được điền sẵn, không phải nhập lại
            mỗi lần đặt.
          </p>
          <Button size="sm" className="mt-5 px-5" onClick={openCreate}>
            <Plus /> Thêm địa chỉ
          </Button>
        </div>
      );
    }

    return (
      <ul>
        {sortedAddresses.map((address) => (
          <li
            key={address._id}
            className={cn(
              "relative flex flex-col gap-4 border-t border-white-300 p-4 first:border-t-0 sm:flex-row sm:items-start sm:px-6 sm:py-5",
              address.primary &&
                "before:absolute before:-left-px before:bottom-4 before:top-4 before:w-[3px] before:rounded-r-full before:bg-primary"
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold">{address.name}</span>
                <span className="text-sm text-dark-400">
                  {address.phoneNumber}
                </span>
                {address.primary && (
                  <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">
                    Mặc định
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-dark-500">
                {formatAddress(address)}
              </p>
            </div>

            <div className="-mr-2 flex items-center self-end sm:-mt-2 sm:self-auto">
              {!address.primary && (
                <button
                  type="button"
                  onClick={() => setPrimaryCandidate(address)}
                  className="h-10 rounded-md px-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
                >
                  Đặt làm mặc định
                </button>
              )}
              <button
                type="button"
                aria-label="Sửa địa chỉ"
                title="Sửa"
                onClick={() => openEdit(address)}
                className={ICON_BUTTON}
              >
                <PenOutline />
              </button>
              <button
                type="button"
                aria-label="Xóa địa chỉ"
                title="Xóa"
                onClick={() => setDeletingAddress(address)}
                className={cn(ICON_BUTTON, "hover:text-red-800")}
              >
                <TrashOutline />
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Địa chỉ của tôi</h1>
        <Button
          size="sm"
          variant="outline"
          className="px-4"
          onClick={openCreate}
          disabled={isLoading}
        >
          <Plus /> Thêm địa chỉ
        </Button>
      </div>

      <section
        aria-label="Danh sách địa chỉ"
        className="rounded-lg border border-white-300 bg-white"
      >
        {renderBody()}
      </section>

      <AddressModal
        isOpen={isFormOpen}
        initialData={editingAddress}
        // Lỗi tải → list rỗng giả, không được tick sẵn (BE sẽ hạ primary thật)
        defaultPrimary={!loadError && addresses.length === 0}
        isSaving={isSaving}
        onCancel={closeForm}
        onSubmit={handleSaveAddress}
      />
      <DeleteAddressModal
        isOpen={!!deletingAddress}
        isDeleting={isSaving}
        onClose={() => setDeletingAddress(undefined)}
        onConfirm={handleDeleteAddress}
      />
      <SetPrimaryAddressModal
        isOpen={!!primaryCandidate}
        isSaving={isSaving}
        onClose={() => setPrimaryCandidate(undefined)}
        onConfirm={handleSetPrimary}
      />
    </div>
  );
};

export default AddressList;
