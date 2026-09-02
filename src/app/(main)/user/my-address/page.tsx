"use client";

import {
  createAddress,
  deleteAddress,
  editAddress,
  getAddresses,
} from "@/apis/profile";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Trash, Pen, Plus } from "@/components/icons";
import { cn } from "@/config/utils";
import AddressModal from "./_component/AddressModal";
import { successToast } from "@/utils/toast";
import DeleteAddressModal from "./_component/DeleteAddressModal";
import EditPrimaryModal from "./_component/SetPrimaryAddressModal";
import Spin from "@/components/ui/Spin";
import { IAddressProps } from "@/apis/profile";
import { IAddress } from "@/@types/Address.type";

const AddressList = () => {
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [currentAddress, setCurrentAddress] = useState<IAddress>();
  const [currentAddressId, setCurrentAddressId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isEditPrimaryModalOpen, setIsEditPrimaryModalOpen] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchAddressList();
  }, []);

  const fetchAddressList = async () => {
    setIsLoading(true);
    try {
      const res = await getAddresses();
      setAddresses(res.data);
    } catch {
      // interceptor đã toast lỗi
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeAddress = (data: IAddressProps, isEdit?: boolean) => {
    const newData = { ...data, country: "Việt Nam" };
    setIsAddressModalOpen(false);
    if (isEdit && currentAddressId !== null) {
      handleEditAddress(newData);
    } else {
      handleCreateAddress(newData);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteAddress(addressId);
      setAddresses((prev) => prev.filter((a) => a._id !== addressId));
      successToast("Xóa địa chỉ thành công");
    } catch {
      // interceptor đã toast lỗi
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleCreateAddress = async (formData: IAddressProps) => {
    try {
      const response = await createAddress(formData);
      setAddresses(response.data);
      successToast("Thêm địa chỉ thành công");
    } catch {
      // interceptor đã toast lỗi
    } finally {
      setIsAddressModalOpen(false);
    }
  };

  const handleEditAddress = async (data: IAddressProps) => {
    const newData = { ...data, country: "Việt Nam" };
    try {
      const res = await editAddress(currentAddressId as string, newData);
      setAddresses((prev) =>
        prev.map((a) =>
          a._id === currentAddressId
            ? res.data
            : { ...a, primary: newData.primary ? false : a.primary }
        )
      );

      successToast("Sửa địa chỉ thành công");
    } catch {
      // interceptor đã toast lỗi
    } finally {
      setIsAddressModalOpen(false);
    }
  };

  const handleSetPrimaryAddress = async () => {
    if (!currentAddress || !currentAddressId) return;
    try {
      // Strip _id khỏi body — DTO BE forbidNonWhitelisted sẽ reject field lạ
      const { _id, ...addressBody } = currentAddress;
      const res = await editAddress(currentAddressId, {
        ...addressBody,
        primary: true,
      });
      setAddresses((prev) =>
        prev.map((address) =>
          address._id === currentAddressId
            ? res.data
            : { ...address, primary: false }
        )
      );
      successToast("Đặt làm địa chỉ mặc định thành công");
    } catch {
      // interceptor đã toast lỗi
    } finally {
      setIsEditPrimaryModalOpen(false);
    }
  };

  const handleModalOpen = () => {
    setIsAddressModalOpen(true);
    setCurrentAddress(undefined);
    setCurrentAddressId(null);
  };

  const handleCancel = () => {
    setCurrentAddress(undefined);
    setCurrentAddressId(null);
    setIsAddressModalOpen(false);
  };

  const sortedAddresses = [...addresses].sort(
    (a, b) => Number(b.primary) - Number(a.primary)
  );

  return (
    <Spin
      isLoading={isLoading}
      className="text-dark-200 fill-blue-400 rounded-lg"
    >
      <div className="border border-dark-50 rounded-lg mb-10 xl:my-0 my-10 h-full">
        <div className="flex items-center justify-between md:px-10 px-6 py-4">
          <h2 className="md:text-xl text-lg font-medium sm:mb-0">
            Địa chỉ của tôi
          </h2>

          <Button
            variant="outlined"
            className="px-8 rounded font-normal md:text-lg text-base"
            onClick={handleModalOpen}
          >
            <Plus /> Thêm địa chỉ
          </Button>
        </div>

        <div className="px-4 pt-0">
          {sortedAddresses.map((addr, i) => (
            <AddressItem
              key={addr._id ?? i}
              address={addr}
              isLast={i === sortedAddresses.length - 1}
              onEdit={(address) => {
                setIsAddressModalOpen(true);
                setCurrentAddress(address);
                setCurrentAddressId(address._id ?? null);
              }}
              onDelete={(address) => {
                setCurrentAddressId(address._id ?? null);
                setIsDeleteModalOpen(true);
              }}
              onSetPrimary={(address) => {
                setCurrentAddressId(address._id ?? null);
                setCurrentAddress(address);
                setIsEditPrimaryModalOpen(true);
              }}
            />
          ))}
        </div>

        <DeleteAddressModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
          }}
          onConfirm={() => {
            if (currentAddressId) handleDeleteAddress(currentAddressId);
          }}
        />

        <EditPrimaryModal
          isOpen={isEditPrimaryModalOpen}
          onClose={handleCancel}
          onConfirm={() => {
            handleSetPrimaryAddress();
          }}
        />
      </div>

      <AddressModal
        onChange={handleChangeAddress}
        onCancel={() => handleCancel()}
        initialData={currentAddress}
        isOpen={isAddressModalOpen}
      />
    </Spin>
  );
};
export default AddressList;

interface IAddressItemProps {
  address: IAddress;
  isLast: boolean;
  onEdit: (address: IAddress) => void;
  onDelete: (address: IAddress) => void;
  onSetPrimary: (address: IAddress) => void;
}

const AddressItem: React.FC<IAddressItemProps> = ({
  address,
  isLast,
  onEdit,
  onDelete,
  onSetPrimary,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row justify-between items-start md:items-center p-6 bg-white border-t border-t-dark-50 gap-3",
        !isLast && ""
      )}
    >
      <div className="flex flex-col sm:w-60 lg:w-96">
        <h3 className="font-semibold pb-2">{address.name}</h3>
        <p className="text-dark-500 pb-2">(+84) {address.phoneNumber}</p>
        <p className="sm:line-clamp-2 text-dark-500">
          {address.specificAddress}, {address.ward}, {address.district},{" "}
          {address.city}, {address.country}
        </p>
      </div>

      <div className="flex gap-5 items-center">
        {address.primary ? (
          <div
            className="cursor-pointer text-primary-800 font-bold"
            title="Địa chỉ mặc định"
          >
            Mặc định
          </div>
        ) : (
          <div
            className="cursor-pointer hover:text-primary-500"
            onClick={() => onSetPrimary(address)}
            title="Đặt làm mặc định"
          >
            Đặt làm mặc định
          </div>
        )}

        <div
          className="cursor-pointer"
          onClick={() => onEdit(address)}
          title="Sửa"
        >
          <Pen className="w-6 h-6" />
        </div>

        <div
          className="cursor-pointer text-dark-300 hover:text-red transition-colors"
          onClick={() => onDelete(address)}
          title="Xóa"
        >
          <Trash className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
