/**
 * Mobile 审批列表（Phase A · 审批流）.
 * 顶部切换：待我审批（inbox）/ 我发起的（mine）.
 * 右下角发起审批（Modal 表单：类型 / 标题 / 金额 / 详情 / 审批人）.
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
  APPROVAL_STATUS_META,
  APPROVAL_TYPE_META,
  createApproval,
  listApprovals,
  type ApprovalRequest,
  type ApprovalType,
} from "../../../src/services/approval";
import { listUsers, userDisplayName, type User } from "../../../src/services/users";
import { colors } from "../../../src/theme/colors";

type TabKey = "inbox" | "mine";

const TABS: { key: TabKey; label: string }[] = [
  { key: "inbox", label: "待我审批" },
  { key: "mine", label: "我发起的" },
];

export default function ApprovalList() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("inbox");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApprovalRequest[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  const load = async (role: TabKey) => {
    setLoading(true);
    try {
      const list = await listApprovals({ role });
      setData(list);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(tab);
  }, [tab]);

  return (
    <View style={styles.container}>
      {/* Tab 切换 */}
      <View style={styles.tabRow}>
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabItem, active && styles.tabItemActive]}
              onPress={() => setTab(t.key)}
              testID={`tab-${t.key}`}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
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
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load(tab)} />}
          ListEmptyComponent={<EmptyState message={tab === "inbox" ? "暂无待办审批" : "还没有发起过审批"} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => router.push(`/(main)/approval/${item.id}`)}>
              <View style={styles.rowHeader}>
                <View style={styles.rowType}>
                  <View style={[styles.typeDot, { backgroundColor: APPROVAL_TYPE_META[item.type].color }]} />
                  <Text style={styles.rowName} numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
                <StatusBadge {...APPROVAL_STATUS_META[item.status]} />
              </View>
              <View style={styles.rowMetaLine}>
                <Text style={styles.rowMeta}>
                  {APPROVAL_TYPE_META[item.type].text}
                  {item.amount !== null ? ` · ¥${item.amount}` : ""}
                </Text>
                <Text style={styles.rowTime}>{item.createdAt}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* 发起审批 FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setCreateOpen(true)} testID="create-approval">
        <Text style={styles.fabText}>＋发起</Text>
      </TouchableOpacity>

      <CreateModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          void load(tab);
        }}
      />
    </View>
  );
}

/* ---------------- 发起审批 Modal ---------------- */

function CreateModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [type, setType] = useState<ApprovalType>("EXPENSE");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [detail, setDetail] = useState("");
  const [approverId, setApproverId] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setType("EXPENSE");
      setTitle("");
      setAmount("");
      setDetail("");
      setApproverId(null);
      setError("");
      listUsers()
        .then((u) => setUsers(u))
        .catch(() => setUsers([]));
    }
  }, [visible]);

  const submit = async () => {
    if (!title.trim()) {
      setError("请填写标题");
      return;
    }
    if (approverId === null) {
      setError("请选择审批人");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createApproval({
        type,
        title: title.trim(),
        amount: amount ? Number(amount) : undefined,
        detail: detail.trim() || undefined,
        approverId,
      });
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
          <Text style={styles.modalTitle}>发起审批</Text>

          {/* 类型选择 */}
          <Text style={styles.fieldLabel}>类型</Text>
          <View style={styles.chipRow}>
            {(Object.keys(APPROVAL_TYPE_META) as ApprovalType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, type === t && styles.chipActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{APPROVAL_TYPE_META[t].text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>标题</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="如：差旅报销 2026-08"
            placeholderTextColor={colors.placeholder}
          />

          <Text style={styles.fieldLabel}>金额（元，可选）</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.placeholder}
            keyboardType="numeric"
          />

          <Text style={styles.fieldLabel}>详情（可选）</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={detail}
            onChangeText={setDetail}
            placeholder="补充说明…"
            placeholderTextColor={colors.placeholder}
            multiline
          />

          <Text style={styles.fieldLabel}>审批人</Text>
          {users.length === 0 ? (
            <Text style={styles.usersEmpty}>暂无可用审批人</Text>
          ) : (
            <View style={styles.chipRow}>
              {users.map((u) => {
                const active = approverId === u.id;
                return (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setApproverId(u.id)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{userDisplayName(u)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

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
              <Text style={styles.btnPrimaryText}>{submitting ? "提交中…" : "提交"}</Text>
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
  tabRow: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tabItemActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 14, color: colors.textSecondary },
  tabTextActive: { color: "#fff", fontWeight: "600" },
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
  rowType: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 },
  typeDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  rowName: { fontSize: 15, fontWeight: "600", color: colors.text, flexShrink: 1 },
  rowMetaLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  rowMeta: { fontSize: 13, color: colors.textSecondary },
  rowTime: { fontSize: 11, color: colors.textSecondary },
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
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 16,
    maxHeight: "85%",
  },
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
  usersEmpty: { fontSize: 13, color: colors.textSecondary },
  error: { fontSize: 13, color: "#f5222d", marginTop: 10 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: "center",
    minWidth: 88,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnGhost: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  btnPrimaryText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  btnGhostText: { color: colors.textSecondary, fontSize: 14 },
  btnDisabled: { opacity: 0.5 },
});
