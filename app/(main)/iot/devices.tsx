/**
 * Mobile IoT 设备列表（IOT_OPERATOR）.
 * 调行业包 iotApi.listDevices：状态/最高温/安装地址 + 关键词筛选。
 */
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { iotApi } from "../../../src/services/industryIot";
import type { IotDevice } from "@lieshoucloud/industry-iot";
import { EmptyState, ErrorState } from "../../../src/components/MobileUI";
import { useResponsive } from "../../../src/hooks/useResponsive";
import { colors } from "../../../src/theme/colors";

export default function DevicesScreen() {
  const { isTablet } = useResponsive();
  const [devices, setDevices] = useState<IotDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await iotApi.listDevices(keyword ? { keyword } : undefined);
      setDevices(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    load();
  }, [load]);

  const statusColor = (s: IotDevice["status"]) =>
    s === "ONLINE" ? "#52c41a" : s === "OFFLINE" ? "#ff4d4f" : colors.textSecondary;

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={devices}
      keyExtractor={(d) => String(d.id)}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <TextInput
            style={styles.search}
            placeholder="搜索设备号 / 名称 / 地址"
            value={keyword}
            onChangeText={setKeyword}
            placeholderTextColor={colors.textDisabled}
            testID="device-search"
          />
        </View>
      }
      ListEmptyComponent={
        loading ? null : error ? <ErrorState message={error} onRetry={load} /> : <EmptyState message="暂无设备" />
      }
      renderItem={({ item }) => (
        <View
          style={[styles.card, isTablet && styles.cardTablet]}
          testID={`device-${item.deviceKey}`}
        >
          <View style={styles.cardRow}>
            <Text style={styles.deviceKey}>{item.deviceKey}</Text>
            <View style={[styles.statusDot, { backgroundColor: statusColor(item.status) }]} />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {item.name ?? "未命名设备"}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {item.installAddress ?? "未登记地址"}
          </Text>
          <View style={styles.cardRow}>
            <Text style={styles.temp}>
              {item.maxTemperature != null ? `${item.maxTemperature}℃` : "—"}
            </Text>
            {item.pendingAlerts ? (
              <Text style={styles.alerts}>⚠ {item.pendingAlerts} 条告警</Text>
            ) : null}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, gap: 10 },
  header: { marginBottom: 4 },
  search: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  card: { backgroundColor: colors.card, borderRadius: 10, padding: 12, gap: 6 },
  cardTablet: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  deviceKey: { fontSize: 15, fontWeight: "700", color: colors.text },
  name: { fontSize: 14, color: colors.text },
  meta: { fontSize: 12, color: colors.textSecondary },
  temp: { fontSize: 13, fontWeight: "600", color: "#fa8c16" },
  alerts: { fontSize: 12, color: "#ff4d4f" },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
});
