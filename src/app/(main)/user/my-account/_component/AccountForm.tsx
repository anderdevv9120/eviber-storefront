"use client";

import Input from "@/components/ui/Input";
import { FORM_LABEL_CLASS } from "@/components/ui/FieldController";
import Button from "@/components/ui/Button";
import { RadioGroup } from "@/components/ui/InputRadio/Radio";
import { cn } from "@/config/utils";
import Image from "next/image";
import { Lock } from "@/components/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  PHONE_NUMBER_REQUIRED_MESSAGE,
  PHONE_NUMBER_INVALID_MESSAGE,
  FIRST_NAME_REQUIRED_MESSAGE,
  LAST_NAME_REQUIRED_MESSAGE,
  ACCEPTED_IMAGE_TYPES,
  MAX_AVATAR_SIZE_MB,
  IMAGE_TYPE_MESSAGE,
  IMAGE_SIZE_MESSAGE,
} from "@/constants/validate";

type TAcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];
import { useForm, FormProvider } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { REGEX_PHONE_NUMBER } from "@/constants";
import { uploadImage, updateUserInfo, getUser, TGender } from "@/apis/profile";
import { useAppStore } from "@/store/useAppStore";
import { successToast } from "@/utils/toast";
import { getErrorMessage } from "@/utils/getErrorMessage";

interface IAccountData {
  firstName: string;
  lastName: string;
  phone: string;
  imgUrl?: string;
  gender?: TGender;
}

const GENDER_OPTIONS: { label: string; value: TGender }[] = [
  { label: "Nữ", value: "FEMALE" },
  { label: "Nam", value: "MALE" },
  { label: "Khác", value: "OTHER" },
];

const schema = yup.object({
  firstName: yup.string().required(FIRST_NAME_REQUIRED_MESSAGE),
  lastName: yup.string().required(LAST_NAME_REQUIRED_MESSAGE),
  phone: yup
    .string()
    .matches(REGEX_PHONE_NUMBER, PHONE_NUMBER_INVALID_MESSAGE)
    .required(PHONE_NUMBER_REQUIRED_MESSAGE),
  imgUrl: yup.string(),
  gender: yup.string().oneOf(["MALE", "FEMALE", "OTHER"] as const),
});

const AccountForm = () => {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const methods = useForm<IAccountData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      phone: profile.phone || "",
    },
  });
  const { setValue, watch, handleSubmit, reset } = methods;
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [avatarError, setAvatarError] = useState<string>("");
  const [hasFetchError, setHasFetchError] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(profile.email || "");

  const imgUrl = watch("imgUrl");
  const gender = watch("gender");
  const filledFromCache = useRef(false);

  // Chunk chứa store có thể eval sau khi form mount (defaultValues khi đó chưa thấy
  // cache) — đồng bộ lại ngay khi store có dữ liệu, để form không đứng rỗng chờ API
  useEffect(() => {
    if (!isFetching || filledFromCache.current || !profile._id) return;
    filledFromCache.current = true;
    reset(
      {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      },
      { keepDefaultValues: true, keepDirtyValues: true }
    );
    setEmail((current) => current || profile.email);
  }, [profile, isFetching, reset]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUser();
        const { firstName, lastName, email, imgUrl, phone, gender } =
          response?.data;
        // Dữ liệu cũ có thể mang gender ngoài 3 giá trị hợp lệ — để nguyên thì yup
        // chặn submit mà không hiện lỗi ở đâu (khối radio không render FormError)
        const isKnownGender = GENDER_OPTIONS.some((o) => o.value === gender);
        // keepDirtyValues: form gõ được ngay từ đầu (đã bỏ overlay Spin) — không đè
        // chữ user đang nhập khi response về
        reset(
          {
            firstName,
            lastName,
            imgUrl,
            phone,
            gender: isKnownGender ? gender : undefined,
          },
          { keepDirtyValues: true }
        );
        setEmail(email);
      } catch (error: unknown) {
        setMessage(getErrorMessage(error));
        setHasFetchError(true);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dọn value ở MỌI nhánh: giữ nguyên thì chọn lại đúng file vừa lỗi sẽ không bắn
    // onChange, user tưởng app treo
    const input = event.target;
    setAvatarError("");

    // accept chỉ là gợi ý của trình duyệt — người dùng vẫn chọn được file khác
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as TAcceptedImageType)) {
      setAvatarError(IMAGE_TYPE_MESSAGE);
      input.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      setAvatarError(IMAGE_SIZE_MESSAGE);
      input.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadImage(file);
      setValue("imgUrl", response.data.path);
    } catch (error: unknown) {
      setAvatarError(getErrorMessage(error));
    } finally {
      input.value = "";
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: IAccountData) => {
    setIsSubmitting(true);
    setMessage("");
    try {
      await updateUserInfo(data);
      setProfile({
        ...profile,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      successToast("Cập nhật thành công");
    } catch (error: unknown) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-lg border border-white-300 bg-white p-5 md:p-6">
      <h2 className="text-lg font-bold">Thông tin cá nhân</h2>
      <p className="mt-0.5 text-sm text-dark-400">
        Tên và số điện thoại dùng làm mặc định khi đặt hàng.
      </p>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
          <div className="mb-5 flex flex-wrap items-center gap-4 border-b border-white-300 pb-5">
            {isFetching || isUploading ? (
              <div
                className="h-20 w-20 flex-none animate-pulse rounded-full bg-white-200 ring-4 ring-primary-50"
                aria-hidden
              />
            ) : (
              <div className="h-20 w-20 flex-none overflow-hidden rounded-full ring-4 ring-primary-50">
                <Image
                  src={imgUrl || "/images/avatar.png"}
                  alt="Ảnh đại diện"
                  width={160}
                  height={160}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            )}
            <div>
              <p className="text-sm font-bold">Ảnh đại diện</p>
              <p className="text-sm text-dark-400">
                PNG, JPG hoặc WEBP · tối đa {MAX_AVATAR_SIZE_MB}MB
              </p>
              {avatarError && (
                <p className="mt-1 text-sm text-red">{avatarError}</p>
              )}
            </div>
            <div>
              <Input
                type="file"
                id="avatar"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                className="hidden"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="avatar"
                className={cn(
                  "inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary-700 transition hover:bg-primary-50",
                  (isUploading || isSubmitting) &&
                    "pointer-events-none opacity-50"
                )}
              >
                Đổi ảnh
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Họ đệm"
              name="firstName"
              className="text-base"
              labelClassName={FORM_LABEL_CLASS}
            />
            <Input
              label="Tên"
              name="lastName"
              className="text-base"
              labelClassName={FORM_LABEL_CLASS}
            />
            <Input
              label="Số điện thoại"
              name="phone"
              placeholder="Nhập số điện thoại"
              className="text-base"
              labelClassName={FORM_LABEL_CLASS}
            />
            <div>
              <p id="gender-label" className={FORM_LABEL_CLASS}>
                Giới tính
              </p>
              {isFetching ? (
                <div className="flex h-12 items-center" aria-hidden>
                  <div className="h-5 w-52 animate-pulse rounded bg-white-200" />
                </div>
              ) : (
                <div role="radiogroup" aria-labelledby="gender-label">
                  <RadioGroup
                    name="gender"
                    options={GENDER_OPTIONS}
                    value={gender}
                    onChange={(value) => {
                      setValue("gender", value as TGender, {
                        shouldDirty: true,
                      });
                    }}
                    className="h-12 flex-row items-center gap-6 space-y-0 text-sm"
                  />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <p id="email-label" className={FORM_LABEL_CLASS}>
                Email
              </p>
              {/* rounded-[10px] bám radius của Input.tsx — đổi cùng lúc khi chuẩn hoá input */}
              <div
                role="group"
                aria-labelledby="email-label"
                className="flex h-12 items-center justify-between rounded-[10px] border border-white-500 bg-white-100 px-3 text-dark-400"
              >
                <span className="truncate">{email}</span>
                <Lock className="flex-none" />
              </div>
              <p className="mt-1.5 text-sm text-dark-400">
                Email dùng để đăng nhập — chưa hỗ trợ thay đổi.
              </p>
            </div>
          </div>

          {message && <p className="mt-3 text-sm text-red">{message}</p>}
          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              size="sm"
              className="px-6"
              loading={isSubmitting}
              disabled={isUploading || isFetching || hasFetchError}
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </FormProvider>
    </section>
  );
};

export default AccountForm;
