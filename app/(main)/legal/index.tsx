/**
 * Mobile 案件列表（ADR-0036/0045 · legal 能力域）.
 */
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";

import { EmptyState, StatusBadge } from "../../../src/components/MobileUI";
import { CASE_STATUS_META, listCases, type LegalCase } from "../../../src/services/legal";
import { colors } from "../../../src/theme/colors";

export default function LegalCasesList() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LegalCase[]>([]);
  const [keyword, setKeyword] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const page = await listCases({ keyword: keyword || undefined }, 1, 100);
      setData(page.items);
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
          placeholder="按案号/标题/当事人搜索"
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
          ListEmptyComponent={<EmptyState message="暂无案件" />}
          renderItem={({ item }) => (
            <View style={styles.row} onTouchEnd={() => router.push(`/(main)/legal/${item.id}`)}>
              <View style={styles.rowMain}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <StatusBadge {...CASE_STATUS_META[item.status]} />
                </View>
                <Text style={styles.rowMeta}>{item.caseNo}</Text>
                <Text style={styles.rowTime}>
                  {item.party ?? "—"} vs {item.oppositeParty ?? "—"} · {item.responsibleLawyer ?? "—"}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  searchRow: { padding: 8, backgroundColor: "#fff" },
  search: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
    backgroundColor: "#fff",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  row: {
    backgroundColor: "#fff",
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 8,
    padding: 12,
  },
  rowMain: { flex: 1 },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowName: { fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8, color: "#1f1f1f" },
  rowMeta: { marginTop: 4, fontSize: 12, color: "#595959" },
  rowTime: { marginTop: 2, fontSize: 12, color: "#8c8c8c" },
});
