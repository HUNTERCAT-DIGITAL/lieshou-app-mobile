/**
 * 角色路由守卫（端壳模板 · 角色框架）.
 *
 * 包裹页面内容：当前用户角色不满足白名单时渲染 fallback（403 视图），
 * 满足则渲染 children。角色缺省（roles 未指定）= 全部登录用户可见。
 *
 * 用法（行业 app / 通用页）：
 *   <RouteGuard roles={["TENANT_ADMIN", "LEGAL_LAWYER"]}><CaseDetail /></RouteGuard>
 */
import { StyleSheet, Text, View } from "react-native";

import { useAuthStore } from "../stores/auth";
import { colors } from "../theme/colors";

export interface RouteGuardProps {
  /** 允许的角色白名单（空/缺省 = 全部登录用户） */
  roles?: string[];
  children: React.ReactNode;
  /** 无权限 fallback（缺省内置 403 视图） */
  fallback?: React.ReactNode;
}

export function RouteGuard({ roles, children, fallback }: RouteGuardProps) {
  const userRoles = useAuthStore((s) => s.user?.roles) ?? [];
  const allowed = !roles || roles.length === 0 || roles.some((r) => userRoles.includes(r));

  if (allowed) return <>{children}</>;
  return <>{fallback ?? <ForbiddenView />}</>;
}

export function ForbiddenView() {
  return (
    <View style={styles.container} testID="forbidden-view">
      <Text style={styles.code}>403</Text>
      <Text style={styles.title}>无访问权限</Text>
      <Text style={styles.hint}>当前角色无权查看该功能</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  code: { fontSize: 48, fontWeight: "700", color: colors.textSecondary },
  title: { fontSize: 18, fontWeight: "600", color: colors.text, marginTop: 8 },
  hint: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
});
