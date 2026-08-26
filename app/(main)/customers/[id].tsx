/**
 * Mobile 客户详情（Phase 9 · 多端真实化）.
 */
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { EmptyState, ErrorState, StatusBadge } from "../../../src/components/MobileUI";
import { getCustomer, STATUS_META, type Customer } from "../../../src/services/customer";
import { isNotFound } from "../../../src/services/errors";
import { colors } from "../../../src/theme/colors";

export default function CustomerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = () => {
    const cid = Number(id);
    if (!Number.isFinite(cid)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    setLoadError(false);
    getCustomer(cid)
      .then(setCustomer)
      .catch((e: unknown) => {
        if (isNotFound(e)) setNotFound(true);
        else setLoadError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (notFound || !customer) {
    return (
      <View style={styles.container}>
        <EmptyState message="客户不存在或不属于当前租户" />
        <Text style={styles.link} onPress={() => router.back()}>
          返回列表
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.container}>
        <ErrorState message="加载失败，请检查网络后重试" onRetry={load} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{customer.name}</Text>
        <StatusBadge {...STATUS_META[customer.status]} />
      </View>

      <Section label="客户名称">{customer.name}</Section>
      <Section label="状态">
        <StatusBadge {...STATUS_META[customer.status]} />
      </Section>
      <Section label="联系人">{customer.contactName ?? "—"}</Section>
      <Section label="联系电话">{customer.contactPhone ?? "—"}</Section>
      <Section label="邮箱">{customer.email ?? "—"}</Section>
      <Section label="地址">{customer.address ?? "—"}</Section>
      <Section label="创建时间">{customer.createdAt}</Section>
    </ScrollView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={styles.sectionValue}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "700", color: colors.text, flex: 1 },
  section: { marginBottom: 14 },
  sectionLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  sectionValue: { fontSize: 15, color: colors.text },
  link: {
    color: colors.primary,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16,
  },
});
