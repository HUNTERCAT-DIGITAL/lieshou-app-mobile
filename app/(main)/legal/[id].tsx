/**
 * Mobile 案件详情 + 办案时间线（ADR-0036/0045 · legal 能力域）.
 */
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { EmptyState, ErrorState, StatusBadge } from "../../../src/components/MobileUI";
import {
  CASE_STATUS_META,
  CASE_TYPE_META,
  EVENT_TYPE_META,
  getCase,
  listCaseEvents,
  type CaseEvent,
  type LegalCase,
} from "../../../src/services/legal";
import { isNotFound } from "../../../src/services/errors";
import { colors } from "../../../src/theme/colors";

export default function LegalCaseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<LegalCase | null>(null);
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = () => {
    const cid = Number(id);
    if (!Number.isFinite(cid)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    setLoadError(false);
    Promise.all([getCase(cid), listCaseEvents(cid)])
      .then(([c, evs]) => {
        setDetail(c);
        setEvents(evs);
      })
      .catch((e: unknown) => {
        if (isNotFound(e)) setNotFound(true);
        else setLoadError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (notFound || !detail) {
    return (
      <View style={styles.container}>
        <EmptyState message="案件不存在或不属于当前租户" />
        <Text style={styles.link} onPress={() => router.back()}>
          返回列表
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.container}>
        <ErrorState message="加载失败，请检查网络后重试" onRetry={load} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{detail.caseNo}</Text>
        <StatusBadge {...CASE_STATUS_META[detail.status]} />
      </View>
      <Text style={styles.subtitle}>{detail.title}</Text>

      <View style={styles.card}>
        <InfoRow label="案件类型" value={CASE_TYPE_META[detail.caseType] ?? detail.caseType} />
        <InfoRow label="承办律师" value={detail.responsibleLawyer ?? "-"} />
        <InfoRow label="我方当事人" value={detail.party ?? "-"} />
        <InfoRow label="对方当事人" value={detail.oppositeParty ?? "-"} />
        <InfoRow label="受理法院" value={detail.court ?? "-"} />
        <InfoRow
          label="标的额"
          value={typeof detail.amount === "number" ? `¥${detail.amount.toLocaleString()}` : "-"}
        />
        <InfoRow label="立案日期" value={detail.filedAt ?? "-"} />
        <InfoRow label="结案日期" value={detail.closedAt ?? "-"} />
      </View>

      <Text style={styles.sectionTitle}>办案时间线（{events.length}）</Text>
      {events.length === 0 ? (
        <EmptyState message="暂无时间线事件" />
      ) : (
        <View style={styles.card}>
          {events.map((e, idx) => (
            <View key={e.id} style={[styles.eventRow, idx > 0 && styles.eventBorder]}>
              <View style={[styles.eventDot, { backgroundColor: EVENT_TYPE_META[e.eventType].color }]} />
              <View style={{ flex: 1 }}>
                <View style={styles.eventHeader}>
                  <Text style={[styles.eventType, { color: EVENT_TYPE_META[e.eventType].color }]}>
                    {EVENT_TYPE_META[e.eventType].text}
                  </Text>
                  <Text style={styles.eventTime}>
                    {new Date(e.occurredAt).toLocaleString("zh-CN", { hour12: false })}
                  </Text>
                </View>
                <Text style={styles.eventTitle}>{e.title}</Text>
                {e.detail ? <Text style={styles.eventDetail}>{e.detail}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 12, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  link: { color: colors.primary, textAlign: "center", marginTop: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", flex: 1, marginRight: 8, color: "#1f1f1f" },
  subtitle: { fontSize: 14, color: "#595959", marginTop: 4, marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 12 },
  infoRow: { flexDirection: "row", paddingVertical: 4 },
  infoLabel: { width: 90, color: "#8c8c8c", fontSize: 13 },
  infoValue: { flex: 1, color: "#1f1f1f", fontSize: 13 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 8, color: "#1f1f1f" },
  eventRow: { flexDirection: "row", paddingVertical: 8 },
  eventBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#f0f0f0" },
  eventDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5, marginRight: 10 },
  eventHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eventType: { fontSize: 12, fontWeight: "600" },
  eventTime: { fontSize: 11, color: "#8c8c8c" },
  eventTitle: { fontSize: 14, fontWeight: "500", color: "#1f1f1f", marginTop: 2 },
  eventDetail: { fontSize: 12, color: "#595959", marginTop: 2 },
});
