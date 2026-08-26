/**
 * Mobile 教育 孩子进度（家长）.
 */
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import { eduApi } from "../../../src/services/industryEdu";
import type { ChildProgress } from "@lieshoucloud/industry-edu";
import { EmptyState, ErrorState } from "../../../src/components/MobileUI";
import { colors } from "../../../src/theme/colors";

export default function ChildrenScreen() {
  const [progress, setProgress] = useState<ChildProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 试点：默认孩子 1；真实接后端后按登录家长的孩子列表取
      setProgress(await eduApi.listChildProgress(1));
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
      data={progress}
      keyExtractor={(p, i) => `${p.childId}-${p.courseId}-${i}`}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      ListEmptyComponent={
        loading ? null : error ? <ErrorState message={error} onRetry={load} /> : <EmptyState message="暂无进度" />
      }
      renderItem={({ item }) => {
        const total = item.completedLessons + item.remainingLessons;
        const pct = total > 0 ? Math.round((item.completedLessons / total) * 100) : 0;
        return (
          <View style={styles.card}>
            <Text style={styles.course}>课程 #{item.courseId}</Text>
            <View style={styles.row}>
              <Text style={styles.meta}>
                已上 {item.completedLessons} / 共 {total} 课时
              </Text>
              <Text style={styles.pct}>{pct}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pct}%` }]} />
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, gap: 10 },
  card: { backgroundColor: colors.card, borderRadius: 10, padding: 14, gap: 8 },
  course: { fontSize: 15, fontWeight: "700", color: colors.text },
  row: { flexDirection: "row", justifyContent: "space-between" },
  meta: { fontSize: 13, color: colors.textSecondary },
  pct: { fontSize: 13, fontWeight: "700", color: colors.primary },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.bg, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
});
