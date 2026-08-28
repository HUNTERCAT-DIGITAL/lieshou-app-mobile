import { Stack, router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { configureCore, useAuthStore } from "@lieshoucloud/core-web";

import { RootGate } from "../src/components/RootGate";
import { apiBaseUrl } from "../src/services/api";

// —— 注入 core-web 端口（业务核心层 · 2026-09 铺开）——
configureCore({
  storage: {
    get: (k) => (typeof localStorage !== "undefined" ? localStorage.getItem(k) : null),
    set: (k, v) => localStorage?.setItem(k, v),
    remove: (k) => localStorage?.removeItem(k),
  },
  notifier: {
    success: () => {},
    error: () => {},
  },
  navigation: {
    // 动态路由（客户 tab 注入 href 为 string）：cast 到 Href 兼容 typed routes
    to: (p) => router.push(p as Href),
    replace: (p) => router.replace(p as Href),
  },
  // HTTP 传输端口：core-web 的 requestApi 走这里（缺省裸 fetch 相对路径会 Invalid URL）
  api: {
    request: async (path, init) => {
      const method = init?.method ?? "GET";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(init?.headers as Record<string, string> | undefined),
      };
      const token = useAuthStore.getState().accessToken;
      if (token) headers.Authorization = `Bearer ${token}`;
      // web 同源相对路径（nginx /api → gateway），native 用公网域名（避免 web 跨域 CORS）
      const res = await fetch(`${apiBaseUrl()}${path}`, {
        method,
        headers,
        body: init?.body,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    },
  },
});

/**
 * Root Stack - 所有 Expo Router 屏幕的容器.
 * RootGate 处理登录态：未登录 → /login；已登录 → /(main) 首页。
 * headerStyle 与 admin (antd) 主蓝 #1677ff 对齐.
 * @see .ai/decisions/0013-mobile-app.md
 */
export default function RootLayout() {
  return (
    <RootGate>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1677ff" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen name="login" options={{ title: "登录", headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </RootGate>
  );
}
