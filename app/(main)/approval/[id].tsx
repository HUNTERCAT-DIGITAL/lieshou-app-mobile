/**
 * Mobile 审批详情（Phase A · 审批流）.
 * 展示完整字段；操作按当前用户身份给出：
 *   - PENDING + 我是审批人 → 通过 / 驳回（驳回需填意见）
 *   - PENDING + 我是发起人 → 撤销
 * 已决 / 已撤销 → 只读展示。
 */
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { EmptyState, ErrorState, StatusBadge } from "../../../src/components/MobileUI";
import {
  APPROVAL_STATUS_META,
  APPROVAL_TYPE_META,
  approveApproval,
  cancelApproval,
  getApproval,
  rejectApproval,
  type ApprovalRequest,
} from "../../../src/services/approval";
import { useAuthStore } from "../../../src/stores/auth";
import { isNotFound } from "../../../src/services/errors";
import { colors } from "../../../src/theme/colors";

export default function ApprovalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const me = useAuthStore((s) => s.user);

  const [item, setItem] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const load = async () => {
    const aid = Number(id);
    if (!Number.isFinite(aid)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    setLoadError(false);
    try {
      setItem(await getApproval(aid));
    } catch (e) {
      if (isNotFound(e)) setNotFound(true);
      else setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (notFound || !item) {
    return (
      <View style={styles.container}>
        <EmptyState message="审批单不存在或不属于当前租户" />
        <Text style={styles.link} onPress={() => router.back()}>
          返回列表
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.container}>
        <ErrorState message="加载失败，请检查网络后重试" onRetry={() => void load()} />
      </View>
    );
  }

  const isPending = item.status === "PENDING";
  const isInbox = me !== null && item.approverId === me.userId;
  const isRequester = me !== null && item.requesterId === me.userId;

  const onApprove = async () => {
    try {
      await approveApproval(item.id);
      Alert.alert("已通过", "审批已通过");
      void load();
    } catch {
      Alert.alert("操作失败", "请重试");
    }
  };

  const onReject = async (comment: string) => {
    try {
      await rejectApproval(item.id, comment);
      setRejectOpen(false);
      Alert.alert("已驳回", "审批已驳回");
      void load();
    } catch {
      Alert.alert("操作失败", "请重试");
    }
  };

  const onCancel = async () => {
    try {
      await cancelApproval(item.id);
      Alert.alert("已撤销", "审批已撤销");
      void load();
    } catch {
      Alert.alert("操作失败", "请重试");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{item.title}</Text>
          <StatusBadge {...APPROVAL_STATUS_META[item.status]} />
        </View>
      </View>

      <Section label="类型">{APPROVAL_TYPE_META[item.type].text}</Section>
      {item.amount !== null ? <Section label="金额">¥{item.amount}</Section> : null}
      {item.detail ? <Section label="详情">{item.detail}</Section> : null}
      <Section label="发起人">#{item.requesterId}</Section>
      <Section label="审批人">#{item.approverId}</Section>
      {item.comment ? <Section label="审批意见">{item.comment}</Section> : null}
      {item.decidedAt ? <Section label="审批时间">{item.decidedAt}</Section> : null}
      <Section label="发起时间">{item.createdAt}</Section>

      {/* 操作区 */}
      {isPending && isInbox ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnGhost]}
            onPress={() => setRejectOpen(true)}
            testID="reject-btn"
          >
            <Text style={styles.btnGhostText}>驳回</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => void onApprove()}
            testID="approve-btn"
          >
            <Text style={styles.btnPrimaryText}>通过</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isPending && isRequester && !isInbox ? (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => void onCancel()} testID="cancel-btn">
            <Text style={styles.btnGhostText}>撤销</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <RejectModal
        visible={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSubmit={(comment) => void onReject(comment)}
      />
    </ScrollView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={styles.sectionValue}>{children}</Text>
    </View>
  );
}

/* ---------------- 驳回意见 Modal ---------------- */

function RejectModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
}) {
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (visible) setComment("");
  }, [visible]);

  const submit = () => {
    if (!comment.trim()) {
      Alert.alert("提示", "请填写驳回意见");
      return;
    }
    onSubmit(comment.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalMask}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>驳回审批</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={comment}
            onChangeText={setComment}
            placeholder="请填写驳回意见…"
            placeholderTextColor={colors.placeholder}
            multiline
            autoFocus
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onClose}>
              <Text style={styles.btnGhostText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={submit} testID="reject-confirm">
              <Text style={styles.btnDangerText}>确认驳回</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: {
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    marginBottom: 16,
  },
  titleWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.text, flex: 1, marginRight: 8 },
  section: { marginBottom: 14 },
  sectionLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  sectionValue: { fontSize: 15, color: colors.text },
  link: {
    color: colors.primary,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16,
  },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 20 },
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    minWidth: 96,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnDanger: { backgroundColor: "#f5222d" },
  btnGhost: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.card },
  btnPrimaryText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  btnDangerText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  btnGhostText: { color: colors.textSecondary, fontSize: 14 },
  modalMask: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: { backgroundColor: colors.card, borderRadius: 10, padding: 16 },
  modalTitle: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 12 },
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
  inputMultiline: { minHeight: 80, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 },
});
