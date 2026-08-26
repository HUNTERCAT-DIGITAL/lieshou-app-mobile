/**
 * Mobile 主 Tab 布局（Phase 9 · 多端真实化）.
 *
 * Expo Router 文件式路由：(main)/_layout.tsx 是分组（URL 不含 (main)），
 * 下面 index.tsx 和 customers/* 自动作为此 Stack 的子路由。
 * 这里用 Tabs 模拟 antd Menu 横向 tab 体验。
 */
import { Tabs, useRouter } from "expo-router";
import { StyleSheet, Text, View, type ColorValue } from "react-native";

import { colors } from "../../src/theme/colors";

export default function MainLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" },
        headerRight: () => (
          <View style={styles.headerRight}>
            <Text style={styles.myLink} onPress={() => router.push("/(main)/profile")} testID="profile-link">
              我的
            </Text>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "工作台",
          tabBarIcon: ({ color }) => <TabIcon color={color} char="📊" />,
        }}
      />
      <Tabs.Screen
        name="customers/index"
        options={{
          title: "客户",
          tabBarIcon: ({ color }) => <TabIcon color={color} char="👥" />,
        }}
      />
      <Tabs.Screen
        name="legal/index"
        options={{
          title: "案件",
          tabBarIcon: ({ color }) => <TabIcon color={color} char="⚖️" />,
        }}
      />
      {/* 动态详情页：不生成 Tab（仅栈内导航） */}
      <Tabs.Screen name="customers/[id]" options={{ href: null }} />
      <Tabs.Screen name="legal/[id]" options={{ href: null }} />
      {/* 个人中心：header 右上角入口，不生成 Tab */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen
        name="leads/index"
        options={{
          title: "线索",
          tabBarIcon: ({ color }) => <TabIcon color={color} char="🎯" />,
        }}
      />
      {/* 动态详情页：不生成 Tab（仅栈内导航） */}
      <Tabs.Screen name="leads/[id]" options={{ href: null }} />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "库存",
          tabBarIcon: ({ color }) => <TabIcon color={color} char="📦" />,
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: "记账",
          tabBarIcon: ({ color }) => <TabIcon color={color} char="💰" />,
        }}
      />
      <Tabs.Screen
        name="approval/index"
        options={{
          title: "审批",
          tabBarIcon: ({ color }) => <TabIcon color={color} char="📋" />,
        }}
      />
      {/* 动态详情页：不生成 Tab（仅栈内导航） */}
      <Tabs.Screen name="approval/[id]" options={{ href: null }} />
    </Tabs>
  );
}

/** 简易 tab icon（emoji，省 RN 图标库） */
function TabIcon({ color, char }: { color: ColorValue; char: string }) {
  return <Text style={[styles.icon, { color }]}>{char}</Text>;
}

const styles = StyleSheet.create({
  icon: { fontSize: 18 },
  headerRight: { paddingRight: 12 },
  myLink: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
