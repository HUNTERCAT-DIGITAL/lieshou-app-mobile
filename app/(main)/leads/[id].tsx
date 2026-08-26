/**
 * Mobile 线索详情（Phase B · 销售场景）.
 * 完整字段 + 跟进时间线 + 按所有权操作：
 *   公海 → 认领；我的 → 释放到公海 / 转为客户；已转化/流失 → 只读。
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
  FOLLOWUP_TYPE_META,
  LEAD_SOURCE_META,
  LEAD_STATUS_META,
  addLeadFollowUp,
  assignLead,
  convertLead,
  getLead,
  listLeadFollowUps,
  releaseLead,
  type FollowUpType,
  type Lead,
  type LeadFollowUp,
} from "../../../src/services/lead";
import { useAuthStore } from "../../../src/stores/auth";
import { EVENTS, track } from "../../../src/services/analytics";
import { isNotFound } from "../../../src/services/errors";
import { colors } from "../../../src/theme/colors";

export default function LeadDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const me = useAuthStore((s) => s.user);

  const [lead, setLead] = useState<Lead | null>(null);
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [followOpen, setFollowOpen] = useState(false);

  const load = async () => {
    const lid = Number(id);
    if (!Number.isFinite(lid)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    setLoadError(false);
    try {
      const [l, ups] = await Promise.all([getLead(lid), listLeadFollowUps(lid)]);
      setLead(l);
      setFollowUps(ups);
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

  if (notFound || !lead) {
    return (
      <View style={styles.container}>
        <EmptyState message="线索不存在或不属于当前租户" />
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

  const mine = me !== null && lead.ownerId === me.userId;
  const unclaimed = lead.ownerId === null;
  const actionable = lead.status === "NEW" || lead.status === "FOLLOWING";

  const onAssign = async () => {
    try {
      await assignLead(lead.id);
      track(EVENTS.LEAD_ASSIGNED, { leadId: lead.id });
      Alert.alert("已认领", "线索已认领到你的名下");
      void load();
    } catch {
      Alert.alert("操作失败", "请重试");
    }
  };

  const onRelease = async () => {
    try {
      await releaseLead(lead.id);
      track(EVENTS.LEAD_RELEASED, { leadId: lead.id });
      Alert.alert("已释放", "线索已释放到公海");
      void load();
    } catch {
      Alert.alert("操作失败", "请重试");
    }
  };

  const onConvert = async () => {
    Alert.alert("转为客户", "确认将线索转为正式客户？", [
      { text: "取消", style: "cancel" },
      {
        text: "确认转化",
        onPress: () => {
          convertLead(lead.id)
            .then(() => {
              track(EVENTS.LEAD_CONVERTED, { leadId: lead.id });
              Alert.alert("已转化", "线索已转为客户");
              void load();
            })
            .catch(() => Alert.alert("操作失败", "请重试"));
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{lead.name}</Text>
        <StatusBadge {...LEAD_STATUS_META[lead.status]} />
      </View>

      <Section label="联系人">{lead.contactName ?? "—"}</Section>
      <Section label="联系电话">{lead.contactPhone ?? "—"}</Section>
      <Section label="邮箱">{lead.email ?? "—"}</Section>
      <Section label="来源">{LEAD_SOURCE_META[lead.source]}</Section>
      <Section label="归属">{unclaimed ? "线索池（公海）" : mine ? "我" : `#${lead.ownerId}`}</Section>
      {lead.remark ? <Section label="备注">{lead.remark}</Section> : null}
      {lead.nextFollowUpAt ? <Section label="下次跟进">{lead.nextFollowUpAt}</Section> : null}
      <Section label="创建时间">{lead.createdAt}</Section>

      {/* 操作区 */}
      {actionable && (unclaimed || mine) ? (
        <View style={styles.actions}>
          {unclaimed ? (
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => void onAssign()}
              testID="assign-btn"
            >
              <Text style={styles.btnPrimaryText}>认领</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={() => void onRelease()}
                testID="release-btn"
              >
                <Text style={styles.btnGhostText}>释放</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onConvert} testID="convert-btn">
                <Text style={styles.btnPrimaryText}>转为客户</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : null}

      {/* 跟进时间线 */}
      <View style={styles.section}>
        <View style={styles.timelineHeader}>
          <Text style={styles.sectionTitle}>跟进记录</Text>
          {actionable && mine ? (
            <TouchableOpacity onPress={() => setFollowOpen(true)} testID="add-followup">
              <Text style={styles.addLink}>＋ 新增跟进</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {followUps.length === 0 ? (
          <EmptyState message="暂无跟进记录" />
        ) : (
          followUps.map((f) => (
            <View key={f.id} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineBody}>
                <View style={styles.timelineHeaderRow}>
                  <Text style={styles.timelineType}>{FOLLOWUP_TYPE_META[f.type]}</Text>
                  <Text style={styles.timelineTime}>{f.createdAt}</Text>
                </View>
                <Text style={styles.timelineContent}>{f.content}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <FollowUpModal
        visible={followOpen}
        leadId={lead.id}
        onClose={() => setFollowOpen(false)}
        onAdded={() => {
          setFollowOpen(false);
          void load();
        }}
      />
    </ScrollView>
  );
}

/* ---------------- 新增跟进 Modal ---------------- */

function FollowUpModal({
  visible,
  leadId,
  onClose,
  onAdded,
}: {
  visible: boolean;
  leadId: number;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [type, setType] = useState<FollowUpType>("PHONE");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setType("PHONE");
      setContent("");
      setError("");
    }
  }, [visible]);

  const submit = async () => {
    if (!content.trim()) {
      setError("请填写跟进内容");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await addLeadFollowUp(leadId, { type, content: content.trim() });
      track(EVENTS.LEAD_FOLLOWED_UP, { leadId, type });
      onAdded();
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
          <Text style={styles.modalTitle}>新增跟进</Text>

          <Text style={styles.fieldLabel}>方式</Text>
          <View style={styles.chipRow}>
            {(Object.keys(FOLLOWUP_TYPE_META) as FollowUpType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, type === t && styles.chipActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{FOLLOWUP_TYPE_META[t]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>内容 *</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={content}
            onChangeText={setContent}
            placeholder="沟通情况 / 客户意向…"
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

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={styles.sectionValue}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    marginBottom: 16,
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
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 8, marginBottom: 8 },
  btn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 6, alignItems: "center", minWidth: 96 },
  btnPrimary: { backgroundColor: colors.primary },
  btnGhost: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  btnPrimaryText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  btnGhostText: { color: colors.textSecondary, fontSize: 14 },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
  addLink: { color: colors.primary, fontSize: 13, fontWeight: "600" },
  timelineItem: { flexDirection: "row", marginBottom: 12 },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 5,
    marginRight: 10,
  },
  timelineBody: { flex: 1 },
  timelineHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  timelineType: { fontSize: 12, color: colors.primary, fontWeight: "600" },
  timelineTime: { fontSize: 11, color: colors.textSecondary },
  timelineContent: { fontSize: 14, color: colors.text, marginTop: 4 },
  modalMask: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: { backgroundColor: colors.card, borderRadius: 10, padding: 16 },
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
  inputMultiline: { minHeight: 80, textAlignVertical: "top" },
  error: { fontSize: 13, color: colors.error, marginTop: 10 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 },
  btnDisabled: { opacity: 0.5 },
});
