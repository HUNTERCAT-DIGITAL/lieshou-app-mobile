/**
 * Mobile auth guard（Phase 9 · 多端真实化）.
 *
 * Expo Router 没有"路由守卫"原生概念，用一个 effect 在 Root 渲染前检查登录态
 * 并用 router.replace 跳转。注意：guard 在 RN 端会出现一帧闪烁（受限于 Stack
 * 路由切换），生产环境需要 splash 屏 + 启动时 hydrate。
 *
 */
import { useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuthStore } from "../stores/auth";
import { colors } from "../theme/colors";

export function RootGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const lastRedirected = useRef<string | null>(null);

  useEffect(() => {
    const onLogin = segments[0] === "login";

    // 防止重复跳转
    const target = !isAuth && !onLogin ? "/login" : isAuth && onLogin ? "/(main)" : null;
    if (target && lastRedirected.current !== target) {
      lastRedirected.current = target;
      router.replace(target as never);
    }
  }, [isAuth, segments, router]);

  // 启动时若 isAuth 还未 hydrate（同步 store 默认 false）显示 splash
  if (!isAuth && segments[0] === undefined) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#1677ff" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
});
