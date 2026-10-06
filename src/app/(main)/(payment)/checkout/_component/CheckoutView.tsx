"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import FieldController from "@/components/ui/FieldController";
import AddressModal from "@/app/(main)/user/my-address/_component/AddressModal";
import { EmptyCartIllustration } from "@/app/(main)/(payment)/cart/_component/CartView";
import { ChevronLeft } from "@/components/icons";
import { checkoutReview, getCheckoutSettings, makeOrder } from "@/apis/order";
import { createAddress, getAddresses, IAddressProps } from "@/apis/profile";
import { useCartStore } from "@/store/useCartStore";
import { useAppStore } from "@/store/useAppStore";
import { errorToast, successToast } from "@/utils/toast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { formatPrice } from "@/utils/formatPrice";
import { cn } from "@/config/utils";
import { PATH } from "@/constants/paths";
import { NOTE_MAX_LENGTH } from "@/constants/validate";
import {
  CHECKOUT_PAYMENT_METHODS,
  DEFAULT_PAYMENT_METHOD,
  PaymentMethod,
} from "@/constants/payment";
import { IAddress } from "@/@types/Address.type";
import { ICartResponse } from "@/@types/Cart.type";
import { ICheckoutReview, IShippingInfoPayload } from "@/@types/Order.type";
import {
  CheckoutFormInput,
  CheckoutSchemaContext,
  checkoutSchema,
  FIELD_LABEL,
} from "./checkoutForm";
import AddressFields from "./AddressFields";
import SavedAddressList from "./SavedAddressList";
import PaymentMethodField from "./PaymentMethodField";
import CheckoutSummary from "./CheckoutSummary";
import {
  canSubmitCheckout,
  getCheckoutPolicyKey,
  getCheckoutPolicyError,
  type GuestCheckoutState,
} from "./checkout-policy";

const isPaymentMethod = (value: string): value is PaymentMethod =>
  CHECKOUT_PAYMENT_METHODS.some((m) => m.value === value);

// Ngưỡng của BE ShippingInfo (make-order.dto.ts): name @Length(2,255), phone @Length(10,20) + regex
const isShippingContactValid = (address: IAddress) =>
  address.name.trim().length >= 2 &&
  /^[0-9+\-\s()]+$/.test(address.phoneNumber) &&
  address.phoneNumber.length >= 10 &&
  address.phoneNumber.length <= 20;

const pickDefaultAddressId = (addresses: IAddress[]) =>
  (addresses.find((a) => a.primary) ?? addresses[0])?._id ?? "";

const getCheckoutContextKey = (profileId: string, cart: ICartResponse | null) =>
  `${profileId || "guest"}:${cart?.cartId ?? ""}:${cart?.totalQuantity ?? 0}`;

const getCurrentCheckoutKey = () =>
  getCheckoutContextKey(
    useAppStore.getState().profile._id,
    useCartStore.getState().cart
  );

export default function CheckoutView() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const hasError = useCartStore((s) => s.hasError);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const profile = useAppStore((s) => s.profile);
  const isLoggedIn = !!profile._id;
  const contextKey = getCheckoutContextKey(profile._id, cart);
  const [policyContext, setPolicyContext] = useState({
    key: contextKey,
    generation: 0,
  });
  if (policyContext.key !== contextKey) {
    setPolicyContext({
      key: contextKey,
      generation: policyContext.generation + 1,
    });
  }
  // Returning to the same account/cart needs fresh policy and review approval.
  const currentKey = getCheckoutPolicyKey(contextKey, policyContext.generation);

  // null = chưa load (hoặc guest); [] = user chưa có địa chỉ nào → form inline
  const [addresses, setAddresses] = useState<IAddress[] | null>(null);
  const [hasAddressError, setHasAddressError] = useState(false);
  const isAddressLoading = isLoggedIn && addresses === null;
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [reviewResult, setReviewResult] = useState<{
    key: string;
    data: ICheckoutReview;
  }>();
  const review =
    reviewResult?.key === currentKey ? reviewResult.data : undefined;
  const [guestState, setGuestState] = useState<GuestCheckoutState>();
  const livePolicy = useRef({ key: currentKey, state: guestState });
  useLayoutEffect(() => {
    livePolicy.current = { key: currentKey, state: guestState };
  }, [currentKey, guestState]);
  const [reviewAttempt, setReviewAttempt] = useState(0);
  const guestStatus =
    guestState?.key === currentKey ? guestState.status : "loading";
  const formEnabled = isLoggedIn || guestStatus === "allowed";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionPending = useRef(false);
  const submitDisabled =
    isSubmitting || !canSubmitCheckout(isLoggedIn, currentKey, guestState);

  const useSavedAddress = isLoggedIn && !!addresses && addresses.length > 0;
  // Email đơn = email tài khoản (my-account cũng khóa email) — chỉ guest mới nhập
  const hasAccountEmail = isLoggedIn && !!profile.email;
  const schemaContext: CheckoutSchemaContext = { useSavedAddress };

  const methods = useForm<CheckoutFormInput>({
    resolver: yupResolver(checkoutSchema),
    context: schemaContext,
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      address: "",
      province: "",
      district: "",
      ward: "",
      paymentMethod: DEFAULT_PAYMENT_METHOD,
      note: "",
      saveAddress: true,
    },
  });
  const { handleSubmit, getValues, setValue } = methods;

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const cartId = cart?.cartId;
    if (!cartId || !cart.totalQuantity) return;
    const controller = new AbortController();
    const isCurrent = () =>
      !controller.signal.aborted && getCurrentCheckoutKey() === contextKey;
    const loadReview = async () => {
      try {
        if (!isLoggedIn) {
          const settings = await getCheckoutSettings(controller.signal);
          if (!isCurrent()) return;
          if (typeof settings?.data?.allowGuestCheckout !== "boolean") {
            throw new Error(
              "Không kiểm tra được quyền mua hàng. Vui lòng thử lại."
            );
          }
          const allowed = settings.data.allowGuestCheckout;
          setGuestState({
            key: currentKey,
            status: allowed ? "allowed" : "disabled",
            reviewReady: false,
          });
          if (!allowed) return;
        }
        const res = await checkoutReview(cartId, controller.signal, {
          toastError: isLoggedIn,
        });
        if (!isCurrent()) return;
        if (!res?.data) throw new Error("Không kiểm tra được đơn hàng.");
        setReviewResult({ key: currentKey, data: res.data });
        if (!isLoggedIn) {
          setGuestState({
            key: currentKey,
            status: "allowed",
            reviewReady: true,
          });
        }
      } catch (cause) {
        if (!isCurrent()) return;
        if (!isLoggedIn) {
          setGuestState({
            key: currentKey,
            status: getCheckoutPolicyError(cause) ?? "unavailable",
            reviewReady: false,
          });
        }
        // Authenticated review errors retain the existing toast/cart-total fallback.
      }
    };
    loadReview().catch((cause) => {
      if (isCurrent()) errorToast(getErrorMessage(cause));
    });
    return () => controller.abort();
  }, [
    cart?.cartId,
    cart?.totalQuantity,
    contextKey,
    currentKey,
    isLoggedIn,
    reviewAttempt,
  ]);

  const retryGuestReview = () => {
    setGuestState({ key: currentKey, status: "loading", reviewReady: false });
    setReviewAttempt((attempt) => attempt + 1);
  };

  const loadAddresses = useCallback(async () => {
    try {
      // Không toast: profile persist có thể stale (guest) → 401 ở đây là nhiễu; form inline là fallback
      const res = await getAddresses({ toastError: false });
      // Đã đăng xuất trong lúc chờ → bỏ kết quả, nhánh !isLoggedIn đã reset
      if (!useAppStore.getState().profile._id) return;
      const list: IAddress[] = Array.isArray(res?.data) ? res.data : [];
      setAddresses(list);
      setHasAddressError(false);
      setSelectedAddressId((prev) =>
        list.some((a) => a._id === prev) ? prev : pickDefaultAddressId(list)
      );
    } catch {
      if (!useAppStore.getState().profile._id) return;
      setAddresses([]);
      setHasAddressError(true);
    }
  }, [setAddresses, setHasAddressError, setSelectedAddressId]);

  useEffect(() => {
    if (!isLoggedIn) {
      setAddresses(null);
      setSelectedAddressId("");
      setHasAddressError(false);
      // Đăng xuất ngay tại checkout: không để lộ email/tên/SĐT tài khoản cũ trong form guest
      setValue("email", "");
      setValue("fullName", "");
      setValue("phoneNumber", "");
      return;
    }
    loadAddresses();
    // "Quản lý địa chỉ" mở tab mới → quay lại tab này phải thấy sổ mới, không đặt hàng bằng bản cũ
    const onVisible = () => {
      if (document.visibilityState === "visible") loadAddresses();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isLoggedIn, loadAddresses, setValue]);

  // Sổ mất (GET fail / đăng xuất) khi modal thêm địa chỉ đang mở → UI đã flip sang form
  // inline, modal không còn ngữ cảnh — đóng để không đè lên form và không POST primary nhầm
  useEffect(() => {
    if (!useSavedAddress) setIsAddressModalOpen(false);
  }, [useSavedAddress]);

  // Prefill từ profile: email luôn theo tài khoản; tên/SĐT chỉ khi ô còn trống
  useEffect(() => {
    if (!isLoggedIn) return;
    if (profile.email) setValue("email", profile.email);
    if (addresses && addresses.length === 0) {
      const fullName = `${profile.firstName} ${profile.lastName}`.trim();
      if (!getValues("fullName") && fullName) setValue("fullName", fullName);
      if (!getValues("phoneNumber") && profile.phone)
        setValue("phoneNumber", profile.phone);
    }
  }, [isLoggedIn, profile, addresses, getValues, setValue]);

  const summaryRef = useRef<HTMLElement>(null);
  const [isSummaryInView, setIsSummaryInView] = useState(true);
  const isInitialLoading = !cart && !hasError;
  const isLoadFailed = !cart && hasError;
  const isEmpty = !!cart && cart.totalQuantity === 0;
  const isReady = !!cart && !isEmpty;

  useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSummaryInView(entry.isIntersecting),
      // 0.3 — cùng ngưỡng với cart để sticky bar 2 màn rút/hiện giống nhau
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isReady, formEnabled]);

  const buildShippingFromSaved = (
    email: string
  ): IShippingInfoPayload | undefined => {
    const address = addresses?.find((a) => a._id === selectedAddressId);
    if (!address) {
      errorToast("Vui lòng chọn địa chỉ giao hàng");
      return undefined;
    }
    // Sổ địa chỉ (CreateAddressDto) lỏng hơn ShippingInfo BE (name 2-255, phone 10-20) —
    // chặn sớm bằng tiếng Việt thay vì 400 tiếng Anh từ makeOrder
    if (!isShippingContactValid(address)) {
      errorToast(
        "Địa chỉ đã chọn thiếu họ tên hoặc số điện thoại hợp lệ (10–20 số). Sửa trong Quản lý địa chỉ."
      );
      return undefined;
    }
    return {
      userAddressId: address._id,
      name: address.name,
      phoneNumber: address.phoneNumber,
      email,
      city: address.city,
      district: address.district || undefined,
      ward: address.ward,
      specificAddress: address.specificAddress,
    };
  };

  const buildShippingFromForm = async (
    data: CheckoutFormInput
  ): Promise<IShippingInfoPayload> => {
    const shipping: IShippingInfoPayload = {
      name: data.fullName ?? "",
      phoneNumber: data.phoneNumber ?? "",
      email: data.email,
      city: data.province ?? "",
      district: data.district || undefined,
      ward: data.ward ?? "",
      specificAddress: data.address ?? "",
    };
    if (!isLoggedIn || !data.saveAddress) return shipping;
    try {
      const created = await saveToAddressBook({
        name: shipping.name,
        phoneNumber: shipping.phoneNumber,
        city: shipping.city,
        district: data.district ?? "",
        ward: shipping.ward,
        specificAddress: shipping.specificAddress,
        zip: "",
        // Không tải được sổ (có thể đã có mặc định thật) thì không giành primary
        primary: !hasAddressError,
      });
      if (created?._id) {
        shipping.userAddressId = created._id;
        // makeOrder fail sau đó → UI đã flip sang danh sách, card mới phải được chọn sẵn
        setSelectedAddressId(created._id);
      }
    } catch {
      // lưu sổ địa chỉ fail không chặn đặt hàng — interceptor đã toast
    }
    return shipping;
  };

  /** POST address trả về CẢ danh sách, BE luôn append cuối → phần tử cuối là địa chỉ vừa tạo.
   *  Không so id với list cũ: list cũ có thể rỗng do GET fail trong khi BE đã có N địa chỉ. */
  const saveToAddressBook = async (form: IAddressProps) => {
    const payload = { ...form, country: "Việt Nam" };
    const res = await createAddress(payload);
    const list: IAddress[] = Array.isArray(res?.data) ? res.data : [];
    const created = list[list.length - 1];
    setAddresses(list);
    setHasAddressError(false);
    return created;
  };

  const handleAddressModalSubmit = async (form: IAddressProps) => {
    if (isSavingAddress) return;
    setIsSavingAddress(true);
    try {
      const created = await saveToAddressBook(form);
      if (created?._id) setSelectedAddressId(created._id);
      successToast("Đã lưu địa chỉ");
      setIsAddressModalOpen(false);
    } catch {
      // interceptor đã toast lỗi — giữ modal mở để user sửa rồi lưu lại
    } finally {
      setIsSavingAddress(false);
    }
  };

  const onSubmit: SubmitHandler<CheckoutFormInput> = async (data) => {
    if (
      submissionPending.current ||
      getCurrentCheckoutKey() !== contextKey ||
      livePolicy.current.key !== currentKey ||
      !canSubmitCheckout(
        !!useAppStore.getState().profile._id,
        currentKey,
        livePolicy.current.state
      )
    )
      return;
    submissionPending.current = true;
    setIsSubmitting(true);
    let isNavigating = false;
    let orderRequested = false;
    try {
      // Lấy cart TƯƠI ngay trước khi đặt: accessToken hết hạn giữa chừng thì
      // danh tính (user/guest) của 2 request vẫn nhất quán — tránh "Cart does
      // not belong to this session"; giỏ vừa trống thì store đổi → UI tự sang empty state
      await fetchCart(true);
      const { cart: freshCart, hasError: cartFetchFailed } =
        useCartStore.getState();
      if (cartFetchFailed) {
        // getCart tắt toast global; cart trong store là bản cũ → không đặt hàng mù
        errorToast("Không kiểm tra được giỏ hàng. Vui lòng thử lại.");
        return;
      }
      if (!freshCart?.cartId || freshCart.totalQuantity === 0) return;
      const freshKey = getCurrentCheckoutKey();
      if (
        freshKey !== contextKey ||
        livePolicy.current.key !== currentKey ||
        !canSubmitCheckout(
          !!useAppStore.getState().profile._id,
          currentKey,
          livePolicy.current.state
        )
      )
        return;

      const shippingInfo = useSavedAddress
        ? buildShippingFromSaved(data.email)
        : await buildShippingFromForm(data);
      if (!shippingInfo) return;
      // Address saving can refresh auth too; recheck immediately before POST.
      if (
        getCurrentCheckoutKey() !== freshKey ||
        livePolicy.current.key !== currentKey ||
        !canSubmitCheckout(
          !!useAppStore.getState().profile._id,
          currentKey,
          livePolicy.current.state
        )
      )
        return;

      const note = data.note?.trim();
      orderRequested = true;
      const res = await makeOrder(
        {
          cartId: freshCart.cartId,
          shippingInfo,
          paymentInfo: {
            method: isPaymentMethod(data.paymentMethod)
              ? data.paymentMethod
              : DEFAULT_PAYMENT_METHOD,
          },
          customerNote: note || undefined,
        },
        { toastError: false }
      );
      // Refetch cart + reset countdown làm ở /payment-success (mount sau khi rời trang):
      // làm ở đây thì store về 0 → empty state chớp lên, và tick 1s của countdown ghi lại key
      const orderNumber: string = res?.data?.orderNumber ?? "";
      isNavigating = true;
      router.push(
        `${PATH.PAYMENT_SUCCESS}?orderNumber=${encodeURIComponent(orderNumber)}`
      );
    } catch (cause) {
      if (!orderRequested) return;
      const policyError = getCheckoutPolicyError(cause);
      if (!policyError) errorToast(getErrorMessage(cause));
      if (
        !isLoggedIn &&
        getCurrentCheckoutKey() === contextKey &&
        livePolicy.current.key === currentKey
      ) {
        setGuestState({
          key: currentKey,
          status: policyError ?? "unavailable",
          reviewReady: false,
        });
      }
    } finally {
      // Nhánh thành công giữ nút loading tới khi rời trang
      if (!isNavigating) {
        submissionPending.current = false;
        setIsSubmitting(false);
      }
    }
  };

  const totalPrice = review?.totalPrice ?? cart?.totalPrice ?? 0;

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold">Thanh toán</h1>

      {isInitialLoading && <CheckoutSkeleton />}

      {isLoadFailed && (
        <div className="flex flex-col items-center text-center py-14">
          <p className="text-dark-500 mb-5">
            Không tải được giỏ hàng. Kiểm tra kết nối rồi thử lại.
          </p>
          <Button variant="outline" onClick={() => fetchCart()}>
            Thử lại
          </Button>
        </div>
      )}

      {isEmpty && <CheckoutEmptyState hasItems={cart.items.length > 0} />}

      {isReady && !isLoggedIn && guestStatus !== "allowed" && (
        <div
          className="mt-6 rounded-xl border border-white-500 p-5"
          role="status"
        >
          {guestStatus === "loading" ? (
            <p>Đang kiểm tra quyền mua hàng...</p>
          ) : guestStatus === "disabled" ? (
            <>
              <p className="mb-3">
                Vui lòng đăng nhập để đặt hàng. Giỏ hàng của bạn được giữ
                nguyên.
              </p>
              <Link
                href={PATH.LOGIN}
                className="font-semibold text-primary-700 underline"
              >
                Đăng nhập
              </Link>
            </>
          ) : (
            <>
              <p className="mb-3">
                Chưa thể kiểm tra đơn hàng. Vui lòng thử lại trước khi đặt hàng.
              </p>
              <Button
                variant="outline"
                onClick={retryGuestReview}
                disabled={isSubmitting}
              >
                Thử lại
              </Button>
            </>
          )}
        </div>
      )}

      {isReady && (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mt-6 items-start">
              <div className="w-full lg:flex-1">
                <fieldset
                  disabled={!formEnabled}
                  hidden={!formEnabled}
                  className="min-w-0"
                >
                  <section className="pb-6 md:pb-8 border-b border-white-500">
                    <div className="mb-5">
                      <h2 className="text-base font-bold">
                        Thông tin nhận hàng
                      </h2>
                      {hasAccountEmail && (
                        <p
                          className="text-sm text-dark-500 mt-1"
                          data-testid="checkout-account-email"
                        >
                          Xác nhận đơn gửi về{" "}
                          <span className="font-semibold text-dark-800">
                            {profile.email}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-6">
                      {hasAddressError && (
                        <p className="text-sm text-dark-500 -mt-2">
                          Không tải được sổ địa chỉ — nhập địa chỉ giao hàng bên
                          dưới.
                        </p>
                      )}
                      {isAddressLoading ? (
                        <AddressSkeleton />
                      ) : useSavedAddress && addresses ? (
                        <SavedAddressList
                          addresses={addresses}
                          selectedId={selectedAddressId}
                          onSelect={setSelectedAddressId}
                          onAddClick={() => setIsAddressModalOpen(true)}
                        />
                      ) : (
                        <>
                          <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                name="fullName"
                                label="Họ và tên"
                                labelClassName={FIELD_LABEL}
                                className="text-base"
                                placeholder="Nguyễn Văn A"
                              />
                              <Input
                                name="phoneNumber"
                                type="tel"
                                inputMode="numeric"
                                label="Số điện thoại"
                                labelClassName={FIELD_LABEL}
                                className="text-base"
                                placeholder="0912345678"
                              />
                            </div>
                            {!hasAccountEmail && (
                              <Input
                                name="email"
                                type="email"
                                label="Email nhận thông tin đơn hàng"
                                labelClassName={FIELD_LABEL}
                                className="text-base"
                                placeholder="ban@email.com"
                              />
                            )}
                          </div>
                          <div className="flex flex-col gap-3">
                            <AddressFields />
                            {isLoggedIn && (
                              <FieldController name="saveAddress">
                                <Checkbox
                                  label="Lưu địa chỉ này vào sổ địa chỉ"
                                  labelClassName="text-sm font-medium text-dark-600"
                                />
                              </FieldController>
                            )}
                          </div>
                        </>
                      )}
                      <FieldController
                        name="note"
                        title="Ghi chú (không bắt buộc)"
                        labelClassName={FIELD_LABEL}
                      >
                        <textarea
                          rows={3}
                          maxLength={NOTE_MAX_LENGTH}
                          placeholder="Giờ nhận hàng thuận tiện, chỉ dẫn cho shipper..."
                          className="w-full min-h-[88px] px-3 py-3 border border-dark-200 rounded-lg text-base text-dark-900 placeholder-dark-300 outline-none resize-y hover:border-primary focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-100"
                        />
                      </FieldController>
                    </div>
                  </section>

                  <section className="py-6 md:py-8">
                    <h2 className="text-base font-bold mb-5">
                      Phương thức thanh toán
                    </h2>
                    <PaymentMethodField totalPrice={totalPrice} />
                  </section>
                </fieldset>

                <Link
                  href={PATH.CART}
                  className="group/link inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-500 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover/link:-translate-x-0.5" />
                  Quay lại giỏ hàng
                </Link>
              </div>

              <CheckoutSummary
                ref={summaryRef}
                cart={cart}
                totalPrice={totalPrice}
                shippingFee={review?.shippingFee ?? 0}
                isSubmitting={isSubmitting}
                submitDisabled={submitDisabled}
              />

              <div
                data-testid="checkout-sticky-bar"
                className={cn(
                  "lg:hidden fixed bottom-3 inset-x-4 z-40 flex items-center gap-4 bg-white border border-white-200 rounded-xl shadow-card-hover px-4 py-3 transition-all duration-300",
                  isSummaryInView
                    ? "translate-y-[120%] opacity-0 pointer-events-none"
                    : "translate-y-0 opacity-100"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-dark-500 truncate">
                    Tổng cộng · {cart.totalQuantity} sản phẩm
                  </p>
                  <p className="text-lg font-extrabold">
                    {formatPrice(totalPrice)}
                  </p>
                </div>
                <Button
                  type="submit"
                  className="px-7"
                  loading={isSubmitting}
                  disabled={submitDisabled}
                >
                  Đặt hàng
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      )}

      {/* Mount khi mở: modal đóng vẫn render form (invisible) → input trùng name với
          form inline của user chưa có địa chỉ, automation/label bị nhập nhằng */}
      {isAddressModalOpen && (
        <AddressModal
          isOpen
          defaultPrimary={(addresses ?? []).length === 0}
          isSaving={isSavingAddress}
          onCancel={() => setIsAddressModalOpen(false)}
          onSubmit={handleAddressModalSubmit}
        />
      )}
    </>
  );
}

function CheckoutEmptyState({ hasItems }: { hasItems: boolean }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center text-center pt-8 pb-6">
      <EmptyCartIllustration className="w-40 md:w-52 mb-5" />
      <h2 className="text-xl font-bold mb-1">
        {hasItems
          ? "Sản phẩm trong giỏ đã tạm hết hàng"
          : "Chưa có gì để thanh toán"}
      </h2>
      <p className="text-sm text-dark-500 mb-6 max-w-xs">
        {hasItems
          ? "Quay lại giỏ để bỏ sản phẩm hết hàng hoặc chờ có hàng trở lại."
          : "Giỏ hàng đang trống. Chọn sản phẩm rồi quay lại bước này."}
      </p>
      <Button
        size="lg"
        onClick={() => router.push(hasItems ? PATH.CART : PATH.COLLECTION)}
      >
        {hasItems ? "Về giỏ hàng" : "Khám phá sản phẩm"}
      </Button>
    </div>
  );
}

function AddressSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-12 rounded-lg bg-white-200" />
      <div className="h-[72px] rounded-xl bg-white-100" />
      <div className="h-[72px] rounded-xl bg-white-100" />
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mt-6 items-start animate-pulse">
      <div className="w-full lg:flex-1 flex flex-col gap-4">
        <div className="h-4 w-40 rounded bg-white-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-12 rounded-lg bg-white-200" />
          <div className="h-12 rounded-lg bg-white-200" />
        </div>
        <div className="h-12 rounded-lg bg-white-200" />
        <div className="h-12 rounded-lg bg-white-200" />
        <div className="h-24 rounded-lg bg-white-100" />
      </div>
      <div className="hidden lg:block w-[400px] h-80 rounded-xl bg-white-100 shrink-0" />
    </div>
  );
}
