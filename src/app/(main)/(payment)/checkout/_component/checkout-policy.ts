import { ApiError } from "@/config/axios";

export type GuestCheckoutState = {
  key: string;
  status: "loading" | "allowed" | "disabled" | "unavailable";
  reviewReady: boolean;
};

export const getCheckoutPolicyKey = (contextKey: string, generation: number) =>
  `${contextKey}:${generation}`;

export function canSubmitCheckout(
  isLoggedIn: boolean,
  currentKey: string,
  state: GuestCheckoutState | undefined
): boolean {
  return (
    isLoggedIn ||
    (state?.key === currentKey &&
      state.status === "allowed" &&
      state.reviewReady)
  );
}

export function getCheckoutPolicyError(
  cause: unknown
): "disabled" | "unavailable" | undefined {
  if (!(cause instanceof ApiError)) return undefined;
  if (cause.code === "GUEST_CHECKOUT_DISABLED") return "disabled";
  if (cause.code === "CHECKOUT_SETTINGS_UNAVAILABLE") return "unavailable";
  return undefined;
}
