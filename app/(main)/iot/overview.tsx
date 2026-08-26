/**
 * Mobile IoT 总览看板（IOT_CUSTOMER · 客户视角）.
 * 设备在线/离线/告警数 + 全站最高温（平板多列布局演示）。
 */
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { iotApi } from "../../../src/services/industryIot";
import type { IotOverview } from "@lieshoucloud/industry-iot";
import { useResponsive } from "../../../src/hooks/useResponsive";
import { colors } from "../../../src/theme/colors";

export default function OverviewScreen() {
  const { isTablet } = useResponsive();
  const [data, setData] = useState<IotOverview | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await iotApi.overview());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const metrics = [
    { label: "设备总数", value: data?.total ?? "—", color: colors.text },
    { label: "在线", value: data?.online ?? "—", color: "#52c41a" },
    { label: "离线", value: data?.offline ?? "—", color: "#ff4d4f" },
    { label: "未确认告警", value: data?.pendingAlerts ?? "—", color: "#fa8c16" },
  ];

  return (
    <ScrollView
      style={styles.scroll}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      contentContainerStyle={[styles.content, isTablet && styles.contentTablet]}
    >
      <View style={[styles.grid, isTablet && styles.gridTablet]}>
        {metrics.map((m) => (
          <View key={m.label} style={[styles.metricCard, isTablet && styles.metricCardTablet]}>
            <Text style={styles.metricValue} numberOfLines={1}>
              {m.value}
            </Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.tempCard, isTablet && styles.tempCardTablet]}>
        <Text style={styles.tempLabel}>全站最高节点温度</Text>
        <Text style={styles.tempValue}>
          {data?.maxTemperature != null ? `${data.maxTemperature}℃` : "—"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, gap: 12 },
  contentTablet: { padding: 24, gap: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridTablet: { gap: 16 },
  metricCard: { flexBasis: "47%", flexGrow: 1, backgroundColor: colors.card, borderRadius: 12, padding: 16 },
  metricCardTablet: { flexBasis: "22%" },
  metricValue: { fontSize: 28, fontWeight: "800" },
  metricLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  tempCard: { backgroundColor: colors.card, borderRadius: 12, padding: 16, alignItems: "center" },
  tempCardTablet: { maxWidth: 320, alignSelf: "center" },
  tempLabel: { fontSize: 14, color: colors.textSecondary },
  tempValue: { fontSize: 40, fontWeight: "800", color: "#fa8c16", marginTop: 4 },
});
