/**
 * Mobile IoT 告警中心（IOT_OPERATOR / 客户可见）.
 * 告警列表 + 确认动作（PENDING → ACKNOWLEDGED）。
 */
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { iotApi } from "../../../src/services/industryIot";
import type { IotAlert } from "@lieshoucloud/industry-iot";
import { EmptyState, ErrorState } from "../../../src/components/MobileUI";
import { colors } from "../../../src/theme/colors";

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<IotAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAlerts(await iotApi.listAlerts());
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const ack = async (id: number) => {
    try {
      const updated = await iotApi.ackAlert(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch {
      // 确认失败保持原状
    }
  };

  return (
    <FlatList
      style={styles.list}
      data={alerts}
      keyExtractor={(a) => String(a.id)}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      ListEmptyComponent={
        loading ? null : error ? <ErrorState message={error} onRetry={load} /> : <EmptyState message="暂无告警" />
      }
      renderItem={({ item }) => (
        <View style={[styles.card, item.level === "CRITICAL" && styles.cardCritical]}>
          <View style={styles.row}>
            <Text style={[styles.level, item.level === "CRITICAL" ? styles.critical : styles.warn]}>
              {item.level === "CRITICAL" ? "严重" : "警告"}
            </Text>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
          <Text style={styles.message}>{item.message}</Text>
          {item.threshold != null && item.actualValue != null ? (
            <Text style={styles.value}>
              实际 {item.actualValue} / 阈值 {item.threshold}
            </Text>
          ) : null}
          {item.status === "PENDING" ? (
            <TouchableOpacity style={styles.ackBtn} onPress={() => ack(item.id)} testID={`ack-${item.id}`}>
              <Text style={styles.ackText}>确认</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.acked}>已确认</Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.bg },
  card: { marginHorizontal: 12, marginTop: 10, backgroundColor: colors.card, borderRadius: 10, padding: 12, gap: 6 },
  cardCritical: { borderLeftWidth: 3, borderLeftColor: "#ff4d4f" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  level: { fontSize: 13, fontWeight: "700" },
  critical: { color: "#ff4d4f" },
  warn: { color: "#faad14" },
  time: { fontSize: 12, color: colors.textSecondary },
  message: { fontSize: 14, color: colors.text },
  value: { fontSize: 12, color: colors.textSecondary },
  ackBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  ackText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  acked: { fontSize: 12, color: colors.textDisabled },
});
