/**
 * Mobile auth store (Zustand + persist with AsyncStorage).
 *
 * Mobile 是 RN，localStorage 不可用 —— 持久化走 AsyncStorage（异步），
 * Zustand 启动时需要先 hydrate 再 render，所以 gating 简单靠 splash 屏。
 * 这里 persist 用同步接口（getStorage 是同步返回当前值），把 token 放内存
 * 即可；真正的「记住我」等真后端 refresh token rotation 落地后再加。
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Platform } from "react-native";

import { setAccessTokenProvider } from "@lieshoucloud/api-client";
import type { CurrentUser } from "@lieshoucloud/types";
import { fetchCurrentUser, login as loginApi } from "../services/auth";
import { EVENTS, track } from "../services/analytics";

const STORAGE_KEY = "lieshoucloud:mobile-auth";

// RN 没有 localStorage；给一个同步内存替身（仅供 persist 的初始同步读取，
// 真实持久化用 AsyncStorage；这里先轻量版 —— 进程内 + 每次启动前手动 hydrate）
const memoryStorage = {
  getItem: async (k: string) => (k === STORAGE_KEY ? (memoryStorage["_v"] ?? null) : null),
  setItem: async (k: string, v: string) => {
    if (k === STORAGE_KEY) memoryStorage["_v"] = v;
  },
  removeItem: async (k: string) => {
    if (k === STORAGE_KEY) delete memoryStorage["_v"];
  },
  _v: undefined as string | undefined,
};

// 模块加载时注册 token 供给器：每次 request 自动取 store 最新 token
setAccessTokenProvider(() => useAuthStore.getState().accessToken);

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;

  login: (username: string, password: string, tenantCode?: string) => Promise<void>;
  fetchMe: () => Promise<CurrentUser>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      login: async (username, password, tenantCode) => {
        try {
          const token = await loginApi({ username, password, tenantCode });
          set({
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            user: {
              userId: token.userId,
              username: token.username,
              roles: ["USER"],
              tenantCode: token.tenantCode,
              tenantEdition: token.tenantEdition,
            },
            isAuthenticated: true,
          });
          track(EVENTS.LOGIN_SUCCESS, { username, tenantCode: token.tenantCode });
          get()
            .fetchMe()
            .catch(() => undefined);
        } catch (e) {
          track(EVENTS.LOGIN_FAILED, { username, tenantCode });
          throw e;
        }
      },

      fetchMe: async () => {
        const me = await fetchCurrentUser();
        set({ user: me });
        return me;
      },

      logout: () => {
        track(EVENTS.LOGOUT);
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => memoryStorage as never),
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
);

// 屏蔽 RN vs Web Platform 差异（mobile 仅在 RN 跑）
export const _PLATFORM = Platform.OS;
