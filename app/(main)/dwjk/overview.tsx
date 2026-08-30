/**
 * 电网监控 · 总览（底部 tab · 客户仓 prepare 生成）.
 * 实现：OverviewBoard（packages/dwjk/src/mobile/）。
 */
import { StyleSheet, View } from "react-native";

import { OverviewBoard } from "@lieshoucloud/dwjk/mobile";

export default function Overview() {
  return (
    <View style={styles.container}>
      <OverviewBoard />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#f5f5f5" } });
