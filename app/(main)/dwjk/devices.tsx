/**
 * 电网监控 · 设备（底部 tab · 客户仓 prepare 生成 · 占位版）.
 * 实现待开发：按 docs/mobile-ia.md 逐步落地。
 */
import { StyleSheet, Text, View } from "react-native";

export default function 设备Page() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>设备</Text>
      <Text style={styles.desc}>待开发</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" },
  title: { fontSize: 18, fontWeight: "600", color: "#1f1f1f" },
  desc: { marginTop: 8, fontSize: 13, color: "#999" },
});
