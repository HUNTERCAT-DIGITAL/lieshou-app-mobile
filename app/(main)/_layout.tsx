/**
 * Mobile 主布局（端壳模板 · 工作台框架 + 响应式）.
 *
 * - 导航从 workbench 配置渲染（getWorkbench(industry, roles)），行业/角色驱动菜单；
 *   详情页（customers/[id] 等）保持 href:null（仅栈内导航，不生成 Tab）。
 * - 响应式：平板时内容区自适应（居中 + 最大宽度），手机全宽。
 * - 行业 app（edu/legal/iot）通过行业包扩展 WORKBENCHES[id] 后，本布局零改动。
 */
import { Tabs, useRouter } from "expo-router";
import { StyleSheet, Text, View, type ColorValue } from "react-native";

import { getIndustryId } from "../../src/config/industry";
import { getWorkbench } from "../../src/config/workbench";
import { useResponsive } from "../../src/hooks/useResponsive";
import { useAuthStore } from "../../src/stores/auth";
import { colors } from "../../src/theme/colors";

/** 详情页/特殊页：不生成 Tab（仅栈内导航） */
const NON_TAB_SCREENS = [
  "customers/[id]",
  "leads/[id]",
  "approval/[id]",
  "profile",
];

export default function MainLayout() {
  const router = useRouter();
  const { isTablet, contentPadding } = useResponsive();
  const industry = getIndustryId();
  const roles = useAuthStore((s) => s.user?.roles) ?? [];
  const workbench = getWorkbench(industry, roles);

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
            <Text
              style={styles.myLink}
              onPress={() => router.push("/(main)/profile")}
              testID="profile-link"
            >
              我的
            </Text>
          </View>
        ),
        // 平板：内容区自适应（居中 + 最大宽度），大屏不铺满
        ...(isTablet
          ? { contentStyle: { paddingHorizontal: contentPadding, maxWidth: 960, alignSelf: "center", width: "100%" } }
          : {}),
      }}
    >
      {/* 工作台菜单：由行业/角色配置驱动 */}
      {workbench.items.map((item) => (
        <Tabs.Screen
          key={item.key}
          name={item.key}
          options={{
            title: item.title,
            tabBarIcon: ({ color }) => <TabIcon color={color} char={item.icon} />,
          }}
        />
      ))}
      {/* 详情页/特殊页：仅栈内导航 */}
      {NON_TAB_SCREENS.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
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
