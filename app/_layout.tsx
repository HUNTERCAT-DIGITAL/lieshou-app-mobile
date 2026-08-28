/**
 * Root Layout（薄客户端入口 · 单页品牌）.
 *
 * 2026-09 精简：端壳收敛为单一品牌入口页，不再承载登录门控 / 会话恢复 /
 * core-web 端口注入 / 401 刷新；需要时按旧版 _layout 还原。
 */
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppPaperProvider } from "@lieshoucloud/ui-native/rn";

export default function RootLayout() {
  return (
    <AppPaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
      <StatusBar style="light" />
    </AppPaperProvider>
  );
}
