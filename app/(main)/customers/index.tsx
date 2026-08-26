/**
 * Mobile 客户列表（Phase 9 · 多端真实化）.
 */
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";

import { EmptyState, StatusBadge } from "../../../src/components/MobileUI";
import { listCustomers, STATUS_META, type Customer, type CustomerStatus } from "../../../src/services/customer";
import { colors } from "../../../src/theme/colors";

export default function CustomersList() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Customer[]>([]);
  const [keyword, setKeyword] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const list = await listCustomers(keyword || undefined);
      setData(list);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={() => void load()}
          placeholder="按关键字搜索"
          placeholderTextColor={colors.placeholder}
          returnKeyType="search"
        />
      </View>
      {loading && data.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          ListEmptyComponent={<EmptyState message="暂无客户" />}
          renderItem={({ item }) => (
            <View style={styles.row} onTouchEnd={() => router.push(`/(main)/customers/${item.id}`)}>
              <View style={styles.rowMain}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowName}>{item.name}</Text>
                  <StatusBadge {...STATUS_META[item.status]} />
                </View>
                <Text style={styles.rowMeta}>
                  {item.contactName ?? "—"} · {item.contactPhone ?? "—"}
                </Text>
                <Text style={styles.rowTime}>{item.createdAt}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

// status color -> 实际值（这里复用 customer service 的 STATUS_META）
const _STATUS_COLORS: Record<CustomerStatus, string> = {
  NEW: "#1677ff",
  FOLLOWING: "#faad14",
  CONVERTED: "#52c41a",
  LOST: "#bfbfbf",
};
void _STATUS_COLORS;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchRow: { padding: 12 },
  search: {
    backgroundColor: colors.card,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    fontSize: 15,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  row: {
    backgroundColor: colors.card,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  rowMain: { flex: 1 },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  rowName: { fontSize: 16, fontWeight: "600", color: colors.text, flex: 1 },
  rowMeta: { fontSize: 13, color: colors.textSecondary },
  rowTime: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
});
