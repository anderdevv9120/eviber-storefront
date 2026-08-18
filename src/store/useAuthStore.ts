import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface IAuth {
  token: string;
  refreshToken: string;
}

const initialState: IAuth = {
  token: "",
  refreshToken: "",
};

interface IAuthAction {
  setNewToken: (auth: Omit<IAuth, "userInfo">) => void;
  logoutUser: () => void;
}

export const useAuthStore = create<IAuth & IAuthAction>()(
  persist(
    immer((set) => ({
      ...initialState,
      setNewToken: ({ token, refreshToken }) => {
        set((state) => {
          state.token = token;
          state.refreshToken = refreshToken;
        });
      },
      logoutUser: () => set(() => initialState),
    })),
    {
      name: "auth",
    }
  )
);
