/**
 * Mobile 法律 计时记录（律师/助理）.
 * 案件工时记录列表 + 新增。
 */
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { legalApi } from "../../../src/services/industryLegal";
import type { TimeEntry } from "@lieshoucloud/industry-legal";
import { EmptyState, ErrorState } from "../../../src/components/MobileUI";
import { colors } from "../../../src/theme/colors";

export default function TimeScreen() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [minutes, setMinutes] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEntries(await legalApi.listTimeEntries());
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    const durationMinutes = Number(minutes);
    if (!durationMinutes || durationMinutes <= 0) return;
    try {
      await legalApi.addTimeEntry({ caseId: 1, durationMinutes, note: note || undefined, billedAt: new Date().toISOString() });
      setShowForm(false);
      setMinutes("");
      setNote("");
      load();
    } catch {
      // 提交失败保持表单
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={entries}
        keyExtractor={(e) => String(e.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          loading ? null : error ? <ErrorState message={error} onRetry={load} /> : <EmptyState message="暂无计时记录" />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.duration}>{item.durationMinutes} 分钟</Text>
              <Text style={styles.time}>{new Date(item.billedAt).toLocaleDateString()}</Text>
            </View>
            {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
          </View>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)} testID="add-time-entry">
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalMask}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>新增计时</Text>
            <TextInput
              style={styles.input}
              placeholder="分钟数"
              keyboardType="numeric"
              value={minutes}
              onChangeText={setMinutes}
              placeholderTextColor={colors.textDisabled}
            />
            <TextInput
              style={[styles.input, styles.inputNote]}
              placeholder="备注"
              value={note}
              onChangeText={setNote}
              placeholderTextColor={colors.textDisabled}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={submit}>
                <Text style={styles.saveText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { flex: 1 },
  content: { padding: 12, gap: 10 },
  card: { backgroundColor: colors.card, borderRadius: 10, padding: 14, gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  duration: { fontSize: 15, fontWeight: "700", color: colors.text },
  time: { fontSize: 12, color: colors.textSecondary },
  note: { fontSize: 13, color: colors.textSecondary },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: { color: "#fff", fontSize: 28, fontWeight: "600" },
  modalMask: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 },
  modal: { backgroundColor: colors.card, borderRadius: 12, padding: 16, gap: 10 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: colors.text,
  },
  inputNote: { minHeight: 60 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 6 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  cancelText: { color: colors.textSecondary },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 8 },
  saveText: { color: "#fff", fontWeight: "600" },
});
