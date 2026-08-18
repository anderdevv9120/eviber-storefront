import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import QueryString from "qs";
import { ACCESS_TOKEN } from "@/constants";
import { getCookie } from "@/utils/cookies";
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
          // Refresh token là httpOnly — refresh qua route handler (tự set cookie mới),
          // gọi bằng axios thuần để không đi lại vòng interceptor này
          const { data } = await axios.post("/api/auth/refresh");
          const newToken: string = data.data.accessToken;

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          onRefreshed(newToken);
          // Retry qua axiosRequest để giữ nguyên interceptor pipeline (unwrap data)
          return axiosRequest(originalRequest);
        } catch (refreshError) {
          useAppStore.getState().clearProfile();
          // toastId dedupe: N request cùng chờ refresh fail → chỉ 1 toast.
          // Guest chưa có phiên (NO_REFRESH_TOKEN) → message khác với phiên hết hạn
          if (originalRequest.toastError !== false) {
            const isNoSession =
              axios.isAxiosError(refreshError) &&
              refreshError.response?.data?.code === "NO_REFRESH_TOKEN";
            errorToast(
              isNoSession ? LOGIN_REQUIRED_MESSAGE : SESSION_EXPIRED_MESSAGE,
              { toastId: "session-expired" }
            );
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
        return Promise.reject(NETWORK_ERROR_MESSAGE);
      }
    }

    return Promise.reject(error.response?.data?.message ?? error.message);
  }
);

export default axiosRequest;
