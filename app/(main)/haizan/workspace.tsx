/**
 * 海赞 · 高管移动视图（客户仓薄壳 · 提交版本管理）.
 * 内联 RN UI，业务逻辑走客户包 api（相对路径，Metro 0.84 无 alias 通配符）。
 * 组合总览 + 项目概览 + 子公司月度收入聚合。
 */
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
// 薄壳 → 客户包：app/(main)/haizan/ → 客户仓根（../../../../）+ packages/haizan/src
import { getMetricAgg, getProjectsSummary, listPortfolio } from "../../../../packages/haizan/src/api";

interface OrgMetric {
  orgName: string;
  revenue?: number;
}

export default function HaizanWorkspace() {
  const [companies, setCompanies] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [orgMetrics, setOrgMetrics] = useState<OrgMetric[]>([]);
  const [period, setPeriod] = useState("");
  const navigation = useNavigation<any>();

  useEffect(() => {
    navigation.setOptions({
      title: "海赞高管视图",
      tabBarLabel: "海赞",
      tabBarIcon: ({ color }: { color: string }) => (
        <Text style={{ color, fontSize: 18 }}>📈</Text>
      ),
    });
    const now = new Date();
    const p = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
    setPeriod(p);
    listPortfolio()
      .then((t) => {
        setCompanies(t.length);
        const names: Record<number, string> = {};
        t.forEach((c) => {
          names[c.id] = c.name;
        });
        return getMetricAgg(p).then((recs) => {
          const byOrg = new Map<number, OrgMetric>();
          recs.forEach((r) => {
            const row = byOrg.get(r.orgId) ?? ({} as OrgMetric);
            if (r.metricCode === "revenue") row.revenue = r.value;
            byOrg.set(r.orgId, row);
          });
          setOrgMetrics(
            [...byOrg.entries()].map(([orgId, m]) => ({ ...m, orgName: names[orgId] ?? "#" + orgId })),
          );
        });
      })
      .catch(() => setCompanies(0));
    getProjectsSummary()
      .then((s) => setActiveProjects(s.active ?? 0))
      .catch(() => setActiveProjects(0));
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>海赞 · 高管视图</Text>
      <Text style={styles.subtitle}>{period} 月报</Text>
      <View style={styles.row}>
        <View style={[styles.card, styles.flex1]}>
          <Text style={styles.label}>被投企业</Text>
          <Text style={styles.value}>{companies}</Text>
        </View>
        <View style={[styles.card, styles.flex1]}>
          <Text style={styles.label}>进行中项目</Text>
          <Text style={styles.value}>{activeProjects}</Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>本月收入（万元）</Text>
        {orgMetrics.length === 0 ? (
          <Text style={styles.note}>暂无回传数据</Text>
        ) : (
          orgMetrics.map((m) => (
            <View key={m.orgName} style={styles.metricRow}>
              <Text style={styles.metricName}>{m.orgName}</Text>
              <Text style={[styles.metricValue, { color: m.revenue != null ? "#02429B" : "#999" }]}>
                {m.revenue != null ? m.revenue.toFixed(1) : "-"}
              </Text>
            </View>
          ))
        )}
      </View>
      <Text style={styles.note}>审批/项目/财务详见下方 Tab（薄壳由客户仓维护，业务走客户包 api）。</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7", padding: 16 },
  title: { fontSize: 20, fontWeight: "700", color: "#1f1f1f" },
  subtitle: { fontSize: 13, color: "#999", marginBottom: 12 },
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },
  flex1: { flex: 1 },
  card: { backgroundColor: "#fff", borderRadius: 8, padding: 16, borderWidth: 1, borderColor: "#eee" },
  label: { fontSize: 13, color: "#666" },
  value: { fontSize: 26, fontWeight: "700", color: "#02429B" },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#1f1f1f", marginBottom: 8 },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  metricName: { fontSize: 14, color: "#333" },
  metricValue: { fontSize: 14, fontWeight: "600" },
  note: { fontSize: 12, color: "#999", marginTop: 12 },
});
