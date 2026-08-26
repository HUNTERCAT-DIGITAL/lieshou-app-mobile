/**
 * Mobile 教育 课程列表（学生/家长）.
 */
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import { eduApi } from "../../../src/services/industryEdu";
import type { Course } from "@lieshoucloud/industry-edu";
import { EmptyState, ErrorState } from "../../../src/components/MobileUI";
import { colors } from "../../../src/theme/colors";

export default function CoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCourses(await eduApi.listCourses());
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
      data={courses}
      keyExtractor={(c) => String(c.id)}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      ListEmptyComponent={
        loading ? null : error ? <ErrorState message={error} onRetry={load} /> : <EmptyState message="暂无课程" />
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {[item.ageGroup, item.classMode].filter(Boolean).join(" · ") || "—"}
          </Text>
          {item.lessonCount != null ? (
            <Text style={styles.lessons}>共 {item.lessonCount} 课时</Text>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, gap: 10 },
  card: { backgroundColor: colors.card, borderRadius: 10, padding: 14, gap: 6 },
  name: { fontSize: 16, fontWeight: "700", color: colors.text },
  meta: { fontSize: 13, color: colors.textSecondary },
  lessons: { fontSize: 13, fontWeight: "600", color: colors.primary },
});
