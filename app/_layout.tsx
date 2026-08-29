/** Root Layout（端自身骨架 · 注入 core-web 端口 + 统一登录态）· Stack：启动页（index）+ 登录页（login） */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureCore, useAuthStore } from '@lieshoucloud/core-web';
import { createApiClient } from '@lieshoucloud/contract-api';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { type Href, router } from 'expo-router';

// API 网关地址（构建期 EXPO_PUBLIC_API_BASE 注入；真机/模拟器必须绝对 URL）
const API_BASE =
  (process.env.EXPO_PUBLIC_API_BASE as string | undefined)?.replace(/\/+$/, '') ??
  'https://dev.lieshoucloud.huntercat.cn';

// —— API 客户端（contract-api：token 注入 + 401 单飞刷新 + 会话过期兜底）——
const api = createApiClient({
  baseUrl: API_BASE,
  hooks: {
    getAccessToken: () => useAuthStore.getState().accessToken,
    refreshTokens: async () => {
      try {
        await useAuthStore.getState().refresh();
        return true;
      } catch {
        return false;
      }
    },
    onUnauthorized: () => {
      useAuthStore.getState().logout();
    },
  },
});

// core-web storage 端口是同步签名；RN AsyncStorage 异步 → 同步内存缓存 + 异步持久化
const mem = new Map<string, string>();

configureCore({
  storage: {
    get: (k) => mem.get(k) ?? null,
    set: (k, v) => {
      mem.set(k, v);
      void AsyncStorage.setItem(k, v);
    },
    remove: (k) => {
      mem.delete(k);
      void AsyncStorage.removeItem(k);
    },
  },
  notifier: {
    success: (m) => Alert.alert('提示', m),
    error: (m) => Alert.alert('错误', m),
  },
  navigation: {
    to: (p) => router.push(p as Href),
    replace: (p) => router.replace(p as Href),
  },
  // HTTP 传输：桥接 contract-api 实例（全路径透传 + skipAuth401/asBlob）
  api: {
    request: (path, init) => {
      const method = (init?.method ?? 'GET').toUpperCase() as
        | 'GET'
        | 'POST'
        | 'PUT'
        | 'DELETE'
        | 'PATCH';
      const body =
        typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : init?.body;
      const skipAuth401 = (init as { skipAuth401?: boolean } | undefined)?.skipAuth401;
      const asBlob = (init as { asBlob?: boolean } | undefined)?.asBlob;
      return api.request({ method, path, body, skipAuth401, asBlob });
    },
  },
});

/** 启动时异步恢复会话：AsyncStorage → 内存缓存 → 显式 rehydrate */
async function restoreSession(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys);
    for (const [k, v] of pairs) {
      if (v !== null) mem.set(k, v);
    }
  } catch {
    /* 静默：无会话也可启动 */
  }
  useAuthStore.persist.rehydrate();
}

export default function RootLayout() {
  useEffect(() => {
    void restoreSession();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
