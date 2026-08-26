/**
 * Mobile 记账本页（Phase 9 · 多端接入）.
 * 收支汇总 + 流水列表 + 记一笔。
 */
import { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";

import { EmptyState, StatusBadge } from "../../src/components/MobileUI";
import {
  createLedger,
  getSummary,
  LEDGER_CATEGORIES,
  LEDGER_TYPE_META,
  listLedger,
  type LedgerEntry,
  type LedgerSummary,
  type LedgerType,
} from "../../src/services/finance";
import { colors } from "../../src/theme/colors";

export default function Finance() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<LedgerSummary>({ income: 0, expense: 0, balance: 0, count: 0 });
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [type, setType] = useState<LedgerType>("INCOME");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("销售收入");

  const load = async () => {
    setLoading(true);
    try {
      const [list, s] = await Promise.all([listLedger(), getSummary()]);
      setEntries(list);
      setSummary(s);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert("提示", "请输入有效金额");
      return;
    }
    try {
      await createLedger({
        type,
        amount: n,
        category,
        occurredAt: new Date().toISOString().slice(0, 10),
      });
      Alert.alert("成功", "已记一笔");
      setCreateOpen(false);
      setAmount("");
      void load();
    } catch (e) {
      Alert.alert("失败", String(e));
    }
  };

  const fmt = (v: number) => `¥ ${Number(v).toFixed(2)}`;

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <SumCard label="收入" value={summary.income} color={colors.success} />
        <SumCard label="支出" value={summary.expense} color="#f5222d" />
        <SumCard label="结余" value={summary.balance} color={summary.balance >= 0 ? colors.primary : "#f5222d"} />
      </View>

      <Pressable style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setCreateOpen(true)}>
        <Text style={styles.addBtnText}>+ 记一笔</Text>
      </Pressable>

      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<EmptyState message="暂无记账记录" />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowMain}>
              <View style={styles.rowHeader}>
                <Text style={styles.rowName}>{item.category ?? "未分类"}</Text>
                <StatusBadge {...LEDGER_TYPE_META[item.type]} />
              </View>
              <Text style={styles.rowMeta}>{item.occurredAt}</Text>
            </View>
            <Text style={[styles.rowAmount, { color: item.type === "INCOME" ? colors.success : "#f5222d" }]}>
              {item.type === "INCOME" ? "+" : "-"}
              {fmt(item.amount)}
            </Text>
          </View>
        )}
      />

      {/* 记一笔 Modal */}
      <Modal visible={createOpen} transparent animationType="fade" onRequestClose={() => setCreateOpen(false)}>
        <View style={styles.modalMask}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>记一笔</Text>
            <View style={styles.typeRow}>
              {(Object.keys(LEDGER_TYPE_META) as LedgerType[]).map((t) => (
                <Pressable
                  key={t}
                  style={[styles.typeBtn, type === t && { backgroundColor: LEDGER_TYPE_META[t].color }]}
                  onPress={() => setType(t)}
                >
                  <Text style={{ color: type === t ? "#fff" : colors.textSecondary }}>{LEDGER_TYPE_META[t].text}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="金额（元）"
              placeholderTextColor={colors.placeholder}
            />
            <Text style={styles.label}>分类</Text>
            <View style={styles.catRow}>
              {LEDGER_CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.catBtn, category === c && { borderColor: colors.primary, backgroundColor: "#e6f4ff" }]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={{ fontSize: 12, color: category === c ? colors.primary : colors.textSecondary }}>
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => void submit()}>
              <Text style={styles.btnText}>保存</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, { backgroundColor: colors.surface, marginTop: 8 }]}
              onPress={() => setCreateOpen(false)}
            >
              <Text style={{ color: colors.textSecondary }}>取消</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SumCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.sumCard, { borderTopColor: color }]}>
      <Text style={styles.sumLabel}>{label}</Text>
      <Text style={[styles.sumValue, { color }]}>{`¥ ${Number(value).toFixed(2)}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  summaryRow: { flexDirection: "row", padding: 12, gap: 8 },
  sumCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderTopWidth: 3,
    borderRadius: 8,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  sumLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  sumValue: { fontSize: 16, fontWeight: "700" },
  addBtn: { marginHorizontal: 12, borderRadius: 6, paddingVertical: 10, alignItems: "center", marginBottom: 8 },
  addBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  row: {
    backgroundColor: colors.card,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  rowMain: { flex: 1 },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  rowName: { fontSize: 15, fontWeight: "600", color: colors.text },
  rowMeta: { fontSize: 12, color: colors.textSecondary },
  rowAmount: { fontSize: 16, fontWeight: "700" },
  modalMask: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 },
  modalBox: { backgroundColor: colors.card, borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12, color: colors.text },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  typeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  label: { fontSize: 13, color: colors.text, marginBottom: 6 },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  catBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
    marginBottom: 12,
    color: colors.text,
  },
  btn: { borderRadius: 6, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
