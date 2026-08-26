/**
 * Mobile 经营看板（Phase C · 老板看数据）.
 * 聚合现有接口：客户/线索/审批待办/低库存/财务收支 + 最近客户。
 * 每个指标卡可点击跳对应模块。
 */
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import { EmptyState, RoleBadge } from "../../src/components/MobileUI";
import { countCustomers, listCustomers, STATUS_META, type Customer } from "../../src/services/customer";
import { getApprovalCounts } from "../../src/services/approval";
import { getSummary, type LedgerSummary } from "../../src/services/finance";
import { listLeads } from "../../src/services/lead";
import { listProducts, type Product } from "../../src/services/inventory";
import { EVENTS, track } from "../../src/services/analytics";
import { useAuthStore } from "../../src/stores/auth";
import { WorkbenchHeader } from "../../src/components/WorkbenchHeader";
import { colors } from "../../src/theme/colors";

/** 低库存预警阈值（件） */
const LOW_STOCK_THRESHOLD = 5;

interface Metrics {
  customerCount: number | null;
  leadCount: number | null;
  inboxCount: number | null;
  lowStockCount: number | null;
}

export default function Workbench() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({
    customerCount: null,
    leadCount: null,
    inboxCount: null,
    lowStockCount: null,
  });
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [recent, setRecent] = useState<Customer[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [c, leads, counts, products, fin, customers] = await Promise.all([
        countCustomers(),
        listLeads({ owner: 0 }),
        getApprovalCounts(),
        listProducts(),
        getSummary(),
        listCustomers(),
      ]);
      const low = products
        .filter(
          (p) => p.stockQuantity !== null && p.stockQuantity !== undefined && p.stockQuantity <= LOW_STOCK_THRESHOLD,
        )
        .sort((a, b) => (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0));
      setMetrics({
        customerCount: c,
        leadCount: leads.length,
        inboxCount: counts.inbox,
        lowStockCount: low.length,
      });
      setSummary(fin);
      setLowStock(low.slice(0, 5));
      setRecent([...customers].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5));
      track(EVENTS.DASHBOARD_VIEWED, {
        customerCount: c,
        leadCount: leads.length,
        inboxCount: counts.inbox,
        lowStockCount: low.length,
      });
    } catch {
      setMetrics({ customerCount: null, leadCount: null, inboxCount: null, lowStockCount: null });
      setSummary(null);
      setLowStock([]);
      setRecent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <ScrollView style={styles.scroll} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <WorkbenchHeader />
      <View style={styles.header}>
        <Text style={styles.greeting}>欢迎回来，{user?.username ?? "用户"}</Text>
        <View style={styles.rolesRow}>
          {(user?.roles ?? []).map((r) => (
            <View key={r} style={styles.rolePill}>
              <RoleBadge role={r} />
            </View>
          ))}
        </View>
      </View>

      {/* 经营指标 2×2 */}
      <View style={styles.grid}>
        <MetricCard
          label="客户总数"
          value={metrics.customerCount}
          color={colors.primary}
          onPress={() => router.push("/(main)/customers")}
        />
        <MetricCard
          label="线索总数"
          value={metrics.leadCount}
          color={colors.success}
          onPress={() => router.push("/(main)/leads")}
        />
        <MetricCard
          label="待我审批"
          value={metrics.inboxCount}
          color={colors.warning}
          onPress={() => router.push("/(main)/approval")}
          testID="inbox-card"
        />
        <MetricCard
          label="库存预警"
          value={metrics.lowStockCount}
          color={colors.error}
          onPress={() => router.push("/(main)/inventory")}
        />
      </View>

      {/* 财务概览 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>收支概览</Text>
        {summary ? (
          <View style={styles.finRow}>
            <FinCard label="收入" value={summary.income} color={colors.success} />
            <FinCard label="支出" value={summary.expense} color={colors.error} />
            <FinCard label="结余" value={summary.balance} color={colors.primary} />
          </View>
        ) : (
          <EmptyState message="暂无收支数据" />
        )}
      </View>

      {/* 库存预警 */}
      {lowStock.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>库存预警（≤ {LOW_STOCK_THRESHOLD} 件）</Text>
          {lowStock.map((p) => (
            <TouchableOpacity key={p.id} style={styles.row} onPress={() => router.push("/(main)/inventory")}>
              <View style={styles.rowMain}>
                <Text style={styles.rowName}>{p.name}</Text>
                <Text style={styles.rowMeta}>
                  剩余 {p.stockQuantity} {p.unit ?? "件"} · {p.code ?? "无编码"}
                </Text>
              </View>
              <Text style={[styles.rowBadge, { color: colors.error }]}>低库存</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {/* 最近客户 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>最近客户</Text>
        {recent.length === 0 ? (
          <EmptyState message="暂无客户数据" />
        ) : (
          recent.map((c) => (
            <TouchableOpacity key={c.id} style={styles.row} onPress={() => router.push(`/(main)/customers/${c.id}`)}>
              <View style={styles.rowMain}>
                <Text style={styles.rowName}>{c.name}</Text>
                <Text style={styles.rowMeta}>
                  {STATUS_META[c.status].text} · {c.createdAt}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function MetricCard({
  label,
  value,
  color,
  onPress,
  testID,
}: {
  label: string;
  value: number | null;
  color: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <TouchableOpacity style={[styles.card, { borderTopColor: color }]} onPress={onPress} testID={testID}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, { color }]}>{value ?? "—"}</Text>
    </TouchableOpacity>
  );
}

function FinCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.finCard}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.finValue, { color }]} numberOfLines={1}>
        ¥{Number(value).toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 20, paddingBottom: 8 },
  greeting: { fontSize: 22, fontWeight: "700", color: colors.text },
  rolesRow: { flexDirection: "row", marginTop: 6, flexWrap: "wrap" },
  rolePill: { marginRight: 6, marginTop: 4 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
  },
  card: {
    width: "48%",
    backgroundColor: colors.card,
    borderTopWidth: 3,
    borderRadius: 8,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  cardLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  cardValue: { fontSize: 26, fontWeight: "700" },
  section: { padding: 16, paddingBottom: 0 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: 8 },
  finRow: { flexDirection: "row", gap: 8 },
  finCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  finValue: { fontSize: 16, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  rowMain: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: "600", color: colors.text },
  rowMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  rowBadge: { fontSize: 12, fontWeight: "700", marginLeft: 8 },
});
