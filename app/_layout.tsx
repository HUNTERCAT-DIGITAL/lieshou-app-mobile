import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { RootGate } from "../src/components/RootGate";

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
