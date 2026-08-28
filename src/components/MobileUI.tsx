/**
 * Mobile 业务小组件（Phase 9 · 多端真实化）.
 *
 * 为什么不用 @lieshoucloud/ui：ui 包依赖 antd（web + React 19），mobile 是
 * React Native 18.3.1，跑不动 antd。这里用 RN 原生组件做最简版本，跟 admin
 * 的 StatusTag/RoleTag 视觉上对齐（颜色 + 文字），未来若有 RN-UI 库可再换。
 */
import type { ReactNode } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "../theme/colors";

/** antd 色板 token → RN 合法颜色（contract-types META 的 color 面向 antd；RN backgroundColor 需 hex/命名色） */
const ANTD_COLOR_MAP: Record<string, string> = {
  default: "#8c8c8c",
  primary: "#1677ff",
  processing: "#1677ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#f5222d",
  volcano: "#fa541c",
  blue: "#1677ff",
  gold: "#faad14",
  green: "#52c41a",
  red: "#f5222d",
  orange: "#fa8c16",
};

/** antd token → hex；hex/命名色原样透传 */
function resolveColor(color: string): string {
  return ANTD_COLOR_MAP[color] ?? color;
}

/** 状态徽章：彩色背景 + 文字。色板与 admin STATUS_META 对齐（token 经 resolveColor 归一为 RN 合法色） */
export function StatusBadge({ text, color }: { text: string; color: string }): ReactNode {
  return (
    <View style={[styles.badge, { backgroundColor: resolveColor(color) }]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

/** 角色徽章：平台/租户管理员/普通用户 三档颜色 */
const ROLE_COLORS: Record<string, string> = {
  PLATFORM_ADMIN: "#faad14",
  TENANT_ADMIN: "#fa8c16",
  ADMIN: "#fa8c16",
  USER: "#1677ff",
};

export function RoleBadge({ role }: { role: string }): ReactNode {
  const color = ROLE_COLORS[role] ?? "#8c8c8c";
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{role}</Text>
    </View>
  );
}

/** 空态：图标 + 文字 */
export function EmptyState({ message = "暂无数据" }: { message?: string }): ReactNode {
  return (
    <View style={styles.empty}>
      <MaterialCommunityIcons name="inbox-outline" size={36} color={colors.textSecondary} style={styles.emptyIcon} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

/**
 * 错误态：加载失败 + 重试（UX.md §8.2 错误态必设计）.
 * 用于区分「网络/服务端错误」与「404 不存在」——调用方判断后渲染.
 */
export function ErrorState({
  message = "加载失败，请检查网络后重试",
  onRetry,
  testID = "error-state",
}: {
  message?: string;
  onRetry?: () => void;
  testID?: string;
}): ReactNode {
  return (
    <View style={styles.empty} testID={testID}>
      <MaterialCommunityIcons name="alert-circle-outline" size={36} color={colors.warning} style={styles.emptyIcon} />
      <Text style={styles.emptyText}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} testID={`${testID}-retry`}>
          <Text style={styles.retryText}>重试</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyIcon: {
    marginBottom: 8,
    opacity: 0.9,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 9,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
