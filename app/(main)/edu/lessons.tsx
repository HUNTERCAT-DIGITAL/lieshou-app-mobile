/**
 * Mobile 教育 课时列表（学生/家长/老师）.
 */
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import { eduApi } from "../../../src/services/industryEdu";
import type { Lesson } from "@lieshoucloud/industry-edu";
import { EmptyState, ErrorState } from "../../../src/components/MobileUI";
import { colors } from "../../../src/theme/colors";

const STATUS_META: Record<Lesson["status"], { label: string; color: string }> = {
  SCHEDULED: { label: "待上课", color: colors.primary },
  IN_PROGRESS: { label: "进行中", color: "#52c41a" },
  COMPLETED: { label: "已完成", color: colors.textDisabled },
  CANCELLED: { label: "已取消", color: "#ff4d4f" },
};

export default function LessonsScreen() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLessons(await eduApi.listLessons());
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={lessons}
      keyExtractor={(l) => String(l.id)}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      ListEmptyComponent={
        loading ? null : error ? <ErrorState message={error} onRetry={load} /> : <EmptyState message="暂无课时" />
      }
      renderItem={({ item }) => {
        const meta = STATUS_META[item.status];
        return (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.time}>{new Date(item.scheduledAt).toLocaleString()}</Text>
              <Text style={[styles.status, { color: meta.color }]}>{meta.label}</Text>
            </View>
            <Text style={styles.duration}>{item.durationMinutes} 分钟</Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, gap: 10 },
  card: { backgroundColor: colors.card, borderRadius: 10, padding: 14, gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  time: { fontSize: 14, fontWeight: "600", color: colors.text },
  status: { fontSize: 13, fontWeight: "700" },
  duration: { fontSize: 13, color: colors.textSecondary },
});
