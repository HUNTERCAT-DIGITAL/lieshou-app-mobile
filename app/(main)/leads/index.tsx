/**
 * Mobile 线索列表（Phase B · 销售场景）.
 * 分段：全部 / 我的 / 线索池（公海）；FAB 新建线索；点击进详情。
 */
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { EmptyState, StatusBadge } from "../../../src/components/MobileUI";
import {
  LEAD_SOURCE_META,
  LEAD_STATUS_META,
  createLead,
  listLeads,
  type Lead,
  type LeadRequest,
  type LeadSource,
} from "../../../src/services/lead";
import { useAuthStore } from "../../../src/stores/auth";
import { EVENTS, track } from "../../../src/services/analytics";
import { colors } from "../../../src/theme/colors";

type SegmentKey = "all" | "mine" | "pool";

const SEGMENTS: { key: SegmentKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "mine", label: "我的" },
  { key: "pool", label: "线索池" },
];

export default function LeadList() {
  const router = useRouter();
  const me = useAuthStore((s) => s.user);

  const [segment, setSegment] = useState<SegmentKey>("all");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Lead[]>([]);
  const [keyword, setKeyword] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const load = async (seg: SegmentKey, kw?: string) => {
    setLoading(true);
    try {
      const owner = seg === "mine" ? (me?.userId ?? 0) : seg === "pool" ? -1 : 0;
      const list = await listLeads(kw || undefined, undefined, owner);
      setData(list);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(segment);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment, me?.userId]);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={() => void load(segment, keyword)}
          placeholder="搜索名称/联系人/电话"
          placeholderTextColor={colors.placeholder}
          returnKeyType="search"
        />
      </View>

      <View style={styles.segRow}>
        {SEGMENTS.map((s) => {
          const active = s.key === segment;
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.segItem, active && styles.segItemActive]}
              onPress={() => setSegment(s.key)}
              testID={`seg-${s.key}`}
            >
              <Text style={[styles.segText, active && styles.segTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading && data.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load(segment, keyword)} />}
          ListEmptyComponent={<EmptyState message="暂无线索" />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => router.push(`/(main)/leads/${item.id}`)}>
              <View style={styles.rowHeader}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {item.name}
                </Text>
                <StatusBadge {...LEAD_STATUS_META[item.status]} />
              </View>
              <Text style={styles.rowMeta}>
                {item.contactName ?? "—"} · {item.contactPhone ?? "—"}
              </Text>
              <Text style={styles.rowTime}>
                {LEAD_SOURCE_META[item.source]} · {item.createdAt}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setCreateOpen(true)} testID="create-lead">
        <Text style={styles.fabText}>＋线索</Text>
      </TouchableOpacity>

      <CreateLeadModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          void load(segment, keyword);
        }}
      />
    </View>
  );
}

/* ---------------- 新建线索 Modal ---------------- */

function CreateLeadModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<LeadRequest>({ name: "" });
  const [source, setSource] = useState<LeadSource>("MANUAL");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setForm({ name: "" });
      setSource("MANUAL");
      setError("");
    }
  }, [visible]);

  const submit = async () => {
    if (!form.name.trim()) {
      setError("请填写线索名称");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createLead({ ...form, name: form.name.trim(), source });
      track(EVENTS.LEAD_CREATED, { source });
      onCreated();
    } catch {
      setError("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalMask}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>新建线索</Text>

          <Text style={styles.fieldLabel}>名称 *</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder="公司 / 客户名称"
            placeholderTextColor={colors.placeholder}
          />

          <Text style={styles.fieldLabel}>联系人</Text>
          <TextInput
            style={styles.input}
            value={form.contactName ?? ""}
            onChangeText={(v) => setForm((f) => ({ ...f, contactName: v }))}
            placeholder="如：李经理"
            placeholderTextColor={colors.placeholder}
          />

          <Text style={styles.fieldLabel}>联系电话</Text>
          <TextInput
            style={styles.input}
            value={form.contactPhone ?? ""}
            onChangeText={(v) => setForm((f) => ({ ...f, contactPhone: v }))}
            placeholder="手机 / 座机"
            placeholderTextColor={colors.placeholder}
            keyboardType="phone-pad"
          />

          <Text style={styles.fieldLabel}>来源</Text>
          <View style={styles.chipRow}>
            {(Object.keys(LEAD_SOURCE_META) as LeadSource[]).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, source === s && styles.chipActive]}
                onPress={() => setSource(s)}
              >
                <Text style={[styles.chipText, source === s && styles.chipTextActive]}>{LEAD_SOURCE_META[s]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>备注</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={form.remark ?? ""}
            onChangeText={(v) => setForm((f) => ({ ...f, remark: v }))}
            placeholder="补充说明…"
            placeholderTextColor={colors.placeholder}
            multiline
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onClose} disabled={submitting}>
              <Text style={styles.btnGhostText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, submitting && styles.btnDisabled]}
              onPress={() => void submit()}
              disabled={submitting}
            >
              <Text style={styles.btnPrimaryText}>{submitting ? "提交中…" : "保存"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  searchRow: { padding: 12, paddingBottom: 4 },
  search: {
    backgroundColor: colors.card,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    fontSize: 15,
  },
  segRow: { flexDirection: "row", padding: 12, paddingTop: 8, gap: 8 },
  segItem: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  segItemActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segText: { fontSize: 13, color: colors.textSecondary },
  segTextActive: { color: "#fff", fontWeight: "600" },
  row: {
    backgroundColor: colors.card,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowName: { fontSize: 15, fontWeight: "600", color: colors.text, flex: 1, marginRight: 8 },
  rowMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  rowTime: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  modalMask: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: { backgroundColor: colors.card, borderRadius: 10, padding: 16, maxHeight: "85%" },
  modalTitle: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 10, marginBottom: 6 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: colors.text,
  },
  inputMultiline: { minHeight: 64, textAlignVertical: "top" },
  error: { fontSize: 13, color: colors.error, marginTop: 10 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 },
  btn: { paddingHorizontal: 20, paddingVertical: 9, borderRadius: 6, alignItems: "center", minWidth: 88 },
  btnPrimary: { backgroundColor: colors.primary },
  btnGhost: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.card },
  btnPrimaryText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  btnGhostText: { color: colors.textSecondary, fontSize: 14 },
  btnDisabled: { opacity: 0.5 },
});
