import { toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const toastOptions: ToastOptions = {
  position: "top-right",
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export const successToast = (message: string): void => {
  toast.success(message, toastOptions);
};

export const errorToast = (message: string, options?: ToastOptions): void => {
  toast.error(message, { ...toastOptions, ...options });
};

export const infoToast = (message: string): void => {
  toast.info(message, toastOptions);
};

export const warningToast = (message: string): void => {
  toast.warning(message, toastOptions);
};
