/**
 * Mobile 库存管理页（Phase 9 · 多端接入）.
 * 商品列表 + 入库/出库（简易数量 Prompt）+ 新建商品。
 */
import { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";

import { EmptyState, StatusBadge } from "../../src/components/MobileUI";
import {
  createProduct,
  listProducts,
  MOVEMENT_META,
  stockIn,
  stockOut,
  type Product,
} from "../../src/services/inventory";
import { colors } from "../../src/theme/colors";

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockType, setStockType] = useState<"IN" | "OUT">("IN");
  const [qty, setQty] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setProducts(await listProducts());
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submitStock = async () => {
    if (!stockProduct || !qty) return;
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) return;
    try {
      if (stockType === "IN") await stockIn(stockProduct.id, { quantity: n });
      else await stockOut(stockProduct.id, { quantity: n });
      Alert.alert("成功", stockType === "IN" ? "入库成功" : "出库成功");
      setStockProduct(null);
      setQty("");
      void load();
    } catch (e) {
      Alert.alert("失败", String(e));
    }
  };

  const submitCreate = async () => {
    if (!name) return;
    try {
      await createProduct({ name, price: price ? Number(price) : undefined });
      Alert.alert("成功", "已创建商品");
      setCreateOpen(false);
      setName("");
      setPrice("");
      void load();
    } catch (e) {
      Alert.alert("失败", String(e));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => setCreateOpen(true)}>
          <Text style={styles.btnText}>+ 新建商品</Text>
        </Pressable>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<EmptyState message="暂无商品" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{item.name}</Text>
              <StatusBadge
                text={item.stockQuantity > 0 ? `库存 ${item.stockQuantity}` : "缺货"}
                color={item.stockQuantity > 0 ? colors.primary : "#f5222d"}
              />
            </View>
            <Text style={styles.cardMeta}>
              {item.code ?? "无编码"} · ¥ {item.price !== null ? Number(item.price).toFixed(2) : "—"}
            </Text>
            <View style={styles.actionRow}>
              <Pressable
                style={[styles.miniBtn, { borderColor: colors.success }]}
                onPress={() => {
                  setStockProduct(item);
                  setStockType("IN");
                }}
              >
                <Text style={{ color: colors.success }}>{MOVEMENT_META.IN.text}</Text>
              </Pressable>
              <Pressable
                style={[styles.miniBtn, { borderColor: colors.warning }]}
                disabled={item.stockQuantity <= 0}
                onPress={() => {
                  setStockProduct(item);
                  setStockType("OUT");
                }}
              >
                <Text style={{ color: item.stockQuantity <= 0 ? colors.textDisabled : colors.warning }}>
                  {MOVEMENT_META.OUT.text}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* 出入库 Modal */}
      <Modal visible={!!stockProduct} transparent animationType="fade" onRequestClose={() => setStockProduct(null)}>
        <View style={styles.modalMask}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {stockType === "IN" ? "入库" : "出库"}：{stockProduct?.name}
            </Text>
            <Text style={styles.modalHint}>
              当前库存：{stockProduct?.stockQuantity}
              {stockType === "OUT" && "（不能超过当前库存）"}
            </Text>
            <TextInput
              style={styles.input}
              value={qty}
              onChangeText={setQty}
              keyboardType="numeric"
              placeholder="数量"
              placeholderTextColor={colors.placeholder}
            />
            <Pressable style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => void submitStock()}>
              <Text style={styles.btnText}>确认{stockType === "IN" ? "入库" : "出库"}</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, { backgroundColor: colors.surface, marginTop: 8 }]}
              onPress={() => setStockProduct(null)}
            >
              <Text style={{ color: colors.textSecondary }}>取消</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* 新建商品 Modal */}
      <Modal visible={createOpen} transparent animationType="fade" onRequestClose={() => setCreateOpen(false)}>
        <View style={styles.modalMask}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>新建商品</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="商品名称"
              placeholderTextColor={colors.placeholder}
            />
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="单价（元）"
              placeholderTextColor={colors.placeholder}
            />
            <Pressable style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => void submitCreate()}>
              <Text style={styles.btnText}>创建</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { padding: 12 },
  btn: { borderRadius: 6, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardName: { fontSize: 16, fontWeight: "600", color: colors.text, flex: 1 },
  cardMeta: { fontSize: 13, color: colors.textSecondary },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  miniBtn: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 6 },
  modalMask: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 },
  modalBox: { backgroundColor: colors.card, borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: "700", marginBottom: 8, color: colors.text },
  modalHint: { fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
    marginBottom: 12,
    color: colors.text,
  },
});
