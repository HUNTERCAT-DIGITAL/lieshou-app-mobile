import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { configureCore, useAuthStore } from "@lieshoucloud/core-web";
import { setAccessTokenProvider, setRefreshTokensProvider } from "@lieshoucloud/contract-api";

import { RootGate } from "../src/components/RootGate";
import { apiBaseUrl } from "../src/services/api";

// —— 会话持久化：AsyncStorage（异步）→ 启动预载同步内存缓存（StoragePort 同步契约）——
// RN 无 localStorage：此前 storage 端口回落 localStorage 导致会话无法持久化（冷启动丢失登录态）。
// core-web auth store 采用 skipHydration，预载完成后显式 rehydrate 恢复会话。
const storageCache = new Map<string, string>();

async function hydrateStorage(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys);
    for (const [k, v] of pairs) {
      if (v != null) storageCache.set(k, v);
    }
  } catch (e) {
    console.warn("[mobile] hydrateStorage failed:", e);
  }
}

// contract-api request 自动附加 Bearer（客户包 @lieshoucloud/dwjk 的 API 走 contract-api request）
setAccessTokenProvider(() => useAuthStore.getState().accessToken);
// 401 单飞刷新：复用 core-web 会话 refresh（成功后 contract-api 自动重试原请求）
setRefreshTokensProvider(async () => {
  try {
    await useAuthStore.getState().refresh();
    return true;
  } catch {
    return false;
  }
});

// —— 注入 core-web 端口（业务核心层 · 2026-09 铺开）——
configureCore({
  storage: {
    get: (k) => storageCache.get(k) ?? null,
    set: (k, v) => {
      storageCache.set(k, v);
      void AsyncStorage.setItem(k, v).catch(() => {});
    },
    remove: (k) => {
      storageCache.delete(k);
      void AsyncStorage.removeItem(k).catch(() => {});
    },
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
  const [hydrated, setHydrated] = useState(false);

  // 启动预载 AsyncStorage → 显式恢复 core-web 会话（skipHydration 模式）
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await hydrateStorage();
      if (cancelled) return;
      await useAuthStore.persist.rehydrate();
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 会话恢复完成前显示 splash，避免 RootGate 误判未登录跳 /login
  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#1677ff" />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1677ff",
  },
});
