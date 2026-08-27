import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import QueryString from "qs";
import { ACCESS_TOKEN } from "@/constants";
import { getCookie } from "@/utils/cookies";
import { decodeJwtExpiryMs } from "@/utils/jwt";
import { useAppStore } from "@/store/useAppStore";
import { errorToast } from "@/utils/toast";
import { getErrorMessage } from "@/utils/getErrorMessage";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** false → không toast lỗi global (caller tự hiển thị, ví dụ inline trong form);
     *  string → toast message custom; không set → toast getErrorMessage(error) */
    toastError?: boolean | string;
  }
}

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const NETWORK_ERROR_MESSAGE = "Không thể kết nối đến máy chủ, vui lòng thử lại";

/**
 * Lỗi API chuẩn hóa mà interceptor reject ra caller: `.message` giữ nguyên chuỗi
 * hiển thị (getErrorMessage đọc qua nhánh instanceof Error), `.status` cho caller
 * server-side phân biệt 404 thật vs lỗi transient (ISR không được cache 404 nhầm).
 */
export class ApiError extends Error {
  status?: number;
  /** Message gốc từ BE — là string[] khi lỗi class-validator trả nhiều dòng */
  messages: string | string[];

  constructor(messages: string | string[], status?: number) {
    super(Array.isArray(messages) ? String(messages[0] ?? "") : messages);
    this.name = "ApiError";
    this.messages = messages;
    this.status = status;
  }
}
const SESSION_EXPIRED_MESSAGE = "Phiên đăng nhập đã hết hạn";
const LOGIN_REQUIRED_MESSAGE = "Vui lòng đăng nhập để tiếp tục";

// Toast lỗi global — CHỈ gọi ở các nhánh reject cuối cùng
// (không gọi cho 401 sắp được refresh + retry)
const notifyError = (error: AxiosError) => {
  if (typeof window === "undefined") return; // server-side: không có UI toast
  if (axios.isCancel(error) || error.code === AxiosError.ERR_CANCELED) return; // abort không phải lỗi
  const option = error.config?.toastError;
  if (option === false) return;
  if (typeof option === "string") {
    errorToast(option);
    return;
  }
  if (error.code === AxiosError.ERR_NETWORK) {
    errorToast(NETWORK_ERROR_MESSAGE);
    return;
  }
  errorToast(getErrorMessage(error));
};

interface IRefreshSubscriber {
  onSuccess: (token: string) => void;
  onFailure: (error: unknown) => void;
}

let isRefreshing = false;
let refreshSubscribers: IRefreshSubscriber[] = [];

const subscribeTokenRefresh = (subscriber: IRefreshSubscriber) => {
  refreshSubscribers.push(subscriber);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((subscriber) => subscriber.onSuccess(token));
  refreshSubscribers = [];
};

const onRefreshFailed = (error: unknown) => {
  refreshSubscribers.forEach((subscriber) => subscriber.onFailure(error));
  refreshSubscribers = [];
};

// Endpoint auth không được trigger refresh flow khi trả 401
const REFRESH_EXCLUDED_PATHS = ["/auth/login", "/auth/refresh-token"];

// Export cho logoutServer dùng chung lock — logout phải serialize với refresh đang bay,
// không thì Set-Cookie của refresh có thể khôi phục cookie SAU khi logout đã xóa
export const REFRESH_LOCK_NAME = "auth-token-refresh";
// Sau khi giành được lock, token trong cookie MỚI (khác token vừa 401) và còn hạn hơn
// ngưỡng này = tab khác vừa refresh xong trong lúc mình chờ — dùng lại, khỏi gọi API
const FRESH_TOKEN_MIN_TTL_MS = 10_000;

const performRefresh = async (): Promise<string> => {
  // Refresh token là httpOnly — refresh qua route handler (tự set cookie mới),
  // gọi bằng axios thuần để không đi lại vòng interceptor này
  const { data } = await axios.post("/api/auth/refresh");
  return data.data.accessToken;
};

// Web Locks: chỉ 1 tab thực sự gọi refresh, tab khác chờ lock nhả rồi đọc cookie mới —
// BE rotate mỗi lần refresh nên 2 tab cùng gọi là tab thua bị từ chối token
const refreshWithCrossTabLock = async (
  staleToken?: string
): Promise<string> => {
  if (typeof navigator === "undefined" || !navigator.locks) {
    return performRefresh();
  }
  return navigator.locks.request(REFRESH_LOCK_NAME, async () => {
    const current = getCookie(ACCESS_TOKEN);
    if (current && current !== staleToken) {
      const expiryMs = decodeJwtExpiryMs(current);
      if (expiryMs !== null && expiryMs - Date.now() > FRESH_TOKEN_MIN_TTL_MS) {
        return current;
      }
    }
    return performRefresh();
  });
};

const axiosRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // accept set cookies from server, send cookies to server with cross-site requests
  paramsSerializer: {
    serialize: (params) => {
      return QueryString.stringify(params, {
        arrayFormat: "indices",
        allowDots: true,
      });
    },
  },
});

// Add a request interceptor
axiosRequest.interceptors.request.use(
  (config) => {
    const token = getCookie(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosRequest.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },

  async function (error) {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const requestUrl = originalRequest?.url ?? "";
    const isRefreshExcluded = REFRESH_EXCLUDED_PATHS.some((path) =>
      requestUrl.includes(path)
    );

    if (
      // Server-side không có browser cookie để refresh (và axios Node không
      // resolve được relative URL) → bỏ qua refresh, để lỗi propagate
      typeof window !== "undefined" &&
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshExcluded
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const staleToken = String(
            originalRequest.headers.Authorization ?? ""
          ).replace(/^Bearer\s+/, "");
          const newToken = await refreshWithCrossTabLock(
            staleToken || undefined
          );

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          onRefreshed(newToken);
          // Retry qua axiosRequest để giữ nguyên interceptor pipeline (unwrap data)
          return axiosRequest(originalRequest);
        } catch (refreshError) {
          // toastId dedupe: N request cùng chờ refresh fail → chỉ 1 toast.
          // Chỉ 401/403 = phiên thực sự bị TỪ CHỐI (refresh route mới xóa cookie);
          // lỗi transient (5xx/mất mạng) route giữ cookie để retry → giữ luôn profile,
          // không dọa "hết phiên"
          const refreshStatus = axios.isAxiosError(refreshError)
            ? refreshError.response?.status
            : undefined;
          const isNoSession =
            axios.isAxiosError(refreshError) &&
            refreshError.response?.data?.code === "NO_REFRESH_TOKEN";
          const isRejected =
            isNoSession || refreshStatus === 401 || refreshStatus === 403;

          if (isRejected) {
            useAppStore.getState().clearProfile();
          }
          if (isNoSession) {
            // Guest chưa có phiên: chỉ nhắc đăng nhập khi request gốc muốn toast
            // (profile fetch nền đặt toastError:false → guest vãng lai không bị toast thừa)
            if (originalRequest.toastError !== false) {
              errorToast(LOGIN_REQUIRED_MESSAGE, {
                toastId: "session-expired",
              });
            }
          } else if (isRejected) {
            // Phiên TỪNG tồn tại nhưng bị từ chối (hết hạn/bị thiết bị khác đá) → luôn báo,
            // kể cả khi request gốc tắt toast — đăng xuất im lặng gây bối rối hơn toast thừa
            errorToast(SESSION_EXPIRED_MESSAGE, { toastId: "session-expired" });
          } else if (originalRequest.toastError !== false) {
            errorToast(NETWORK_ERROR_MESSAGE, { toastId: "session-expired" });
          }
          onRefreshFailed(refreshError);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Các request 401 trong lúc đang refresh: xếp hàng chờ token mới rồi retry
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh({
          onSuccess: (newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosRequest(originalRequest));
          },
          onFailure: (refreshError: unknown) => {
            reject(refreshError);
          },
        });
      });
    }

    notifyError(error);

    if (axios.isAxiosError(error)) {
      if (error.code === AxiosError.ERR_NETWORK) {
        return Promise.reject(new ApiError(NETWORK_ERROR_MESSAGE));
      }
    }

    return Promise.reject(
      new ApiError(
        error.response?.data?.message ?? error.message,
        error.response?.status
      )
    );
  }
);

export default axiosRequest;
