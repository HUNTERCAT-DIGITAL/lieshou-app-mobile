/**
 * Mobile 个人中心（Phase D · 体验打磨）.
 * 账号信息 / 租户 / 后端健康 / 版本 / 退出登录。
 * header 右上角「我的」进入；Tabs 中隐藏（href: null）。
 */
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { MobileHealthBadge } from "../../src/components/MobileHealthBadge";
import { RoleBadge } from "../../src/components/MobileUI";
import { EVENTS, track } from "../../src/services/analytics";
import { fetchGatewayHealth } from "../../src/services/api";
import { useAuthStore } from "../../src/stores/auth";
import { colors } from "../../src/theme/colors";

type HealthStatus = "up" | "down" | "degraded";

export default function Profile() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [health, setHealth] = useState<HealthStatus>("down");

  useEffect(() => {
    fetchGatewayHealth()
      .then(setHealth)
      .catch(() => setHealth("down"));
  }, []);

  const onLogout = () => {
    track(EVENTS.LOGOUT);
    logout();
    router.replace("/login");
  };

  const version = Constants.expoConfig?.version ?? "0.0.1";
  const editionText = user?.tenantEdition ?? "—";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 账号信息 */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.username ?? "U").slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user?.username ?? "未登录"}</Text>
          <View style={styles.rolesRow}>
            {(user?.roles ?? []).map((r) => (
              <View key={r} style={styles.rolePill}>
                <RoleBadge role={r} />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 租户信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>租户</Text>
        <InfoRow label="租户编码" value={user?.tenantCode ?? "—"} />
        <InfoRow label="租户版别" value={editionText} />
      </View>

      {/* 系统状态 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>系统状态</Text>
        <View style={styles.healthRow}>
          <Text style={styles.healthLabel}>后端服务</Text>
          <MobileHealthBadge status={health} serviceName="gateway" />
        </View>
        <InfoRow label="App 版本" value={`v${version}`} />
      </View>

      {/* 退出 */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} testID="logout-btn">
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
      <Text style={styles.footer}>LieShou Cloud Mobile · 猎手云 Pro</Text>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  userInfo: { flex: 1 },
  username: { fontSize: 18, fontWeight: "700", color: colors.text },
  rolesRow: { flexDirection: "row", marginTop: 6, flexWrap: "wrap" },
  rolePill: { marginRight: 6, marginTop: 4 },
  section: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  infoLabel: { fontSize: 14, color: colors.textSecondary },
  infoValue: { fontSize: 14, color: colors.text, fontWeight: "500", flex: 1, textAlign: "right" },
  healthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  healthLabel: { fontSize: 14, color: colors.textSecondary },
  logoutBtn: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.error,
    marginBottom: 12,
  },
  logoutText: { color: colors.error, fontSize: 15, fontWeight: "600" },
  footer: { textAlign: "center", fontSize: 11, color: colors.textDisabled, marginTop: 8 },
});
