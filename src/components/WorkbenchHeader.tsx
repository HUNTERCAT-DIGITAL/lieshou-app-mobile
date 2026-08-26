/**
 * 端壳模板信息条（工作台顶部 · 装配示例）.
 *
 * 展示：行业标识 + 当前断点（手机/平板）+ 用户角色。
 * - 行业 app（edu/legal/iot）用此条验证行业/响应式装配生效；
 * - 通用功能（登录/导航/主题/守卫）由端壳提供，行业 app 无需重写。
 */
import { StyleSheet, Text, View } from "react-native";

import { getIndustryMeta } from "../config/industry";
import { useResponsive } from "../hooks/useResponsive";
import { useAuthStore } from "../stores/auth";
import { colors } from "../theme/colors";

export function WorkbenchHeader() {
  const industry = getIndustryMeta();
  const { isTablet, breakpoint } = useResponsive();
  const roles = useAuthStore((s) => s.user?.roles) ?? [];

  return (
    <View style={styles.bar} testID="workbench-header">
      <Text style={styles.industry}>
        行业 · {industry.label}（{industry.id}）
      </Text>
      <Text style={styles.device}>
        设备 · {isTablet ? "平板" : "手机"}({breakpoint})
      </Text>
      <Text style={styles.roles} numberOfLines={1}>
        角色 · {roles.length > 0 ? roles.join(" / ") : "未加载"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  industry: { fontSize: 11, color: colors.primary, fontWeight: "600" },
  device: { fontSize: 11, color: colors.textSecondary },
  roles: { flex: 1, fontSize: 11, color: colors.textSecondary, textAlign: "right" },
});
