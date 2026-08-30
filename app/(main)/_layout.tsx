/**
 * 主框架（(main) 组）· 底部 Tab 布局（端自身骨架 · 客户 EXTRA_TABS 驱动）.
 * 登录守卫：未登录访问内部页 → /login（会话恢复完成后再判定，避免初始闪跳）。
 * 客户仓 prepare 生成 extra.ts（EXTRA_TABS 业务 tab）；generic 无 tab → 仅「我的」。
 * 非 tab 路由（拓扑/设备详情等 EXTRA_HIDDEN）不注册 Tabs.Screen → 无 tab 项，可正常路由。
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@lieshoucloud/core-web';
import { useTheme } from '@lieshoucloud/ui-native/rn';

import { getEdition } from '../../src/config/editions';
import { EXTRA_TABS, EXTRA_HIDDEN } from '../../src/config/editions/extra';

export default function MainLayout() {
  const theme = useTheme();
  const edition = getEdition();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // 等待会话恢复（AsyncStorage → rehydrate）完成后再判定登录态
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (edition.login?.required !== false && !isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        // 顶部导航栏：品牌蓝 + 白字（与登录页蓝白撞色统一）
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
        headerShadowVisible: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: { backgroundColor: theme.colors.surface },
      }}
    >
      {EXTRA_TABS.map((t) => (
        <Tabs.Screen
          key={t.key}
          name={t.key}
          options={{
            title: t.title,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name={t.icon as never} color={color} size={size} />
            ),
          }}
        />
      ))}
      {/* 非 tab 路由（拓扑/设备详情）：显式注册但隐藏 tab 项 */}
      {EXTRA_HIDDEN.map((key) => (
        <Tabs.Screen key={key} name={key} options={{ href: null }} />
      ))}
      {/* (main)/index：客户模式 redirect 到业务首页；generic 显示通用首页 */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="about"
        options={{
          title: '我的',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
