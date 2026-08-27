import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { configureCore } from "@lieshoucloud/core-web";

import { RootGate } from "../src/components/RootGate";

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
    to: (p) => router.push(p),
    replace: (p) => router.replace(p),
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
