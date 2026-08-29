/**
 * 品牌入口页（薄客户端入口 · 单页）.
 *
 * 2026-09 精简：端壳收敛为单一品牌入口，不再承载登录与业务工作台；
 * 展示 "LieShou 猎手猫快速开发框架" 品牌信息，客户版别可经 BRAND 注入覆盖。
 */
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BRAND } from "../src/config/editions/extra";
import { colors } from "../src/theme/colors";

export default function BrandEntryScreen() {
  const brandName = BRAND?.name ?? "LieShou 猎手猫快速开发框架";
  const slogan = BRAND?.subtitle ?? "快速开发框架 · 一云多端 · 契约驱动";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* 品牌区 */}
        <View style={styles.brand}>
          <View style={styles.logoWrap}>
            <MaterialCommunityIcons name="cat" size={56} color="#fff" />
          </View>
          <Text style={styles.name}>{brandName}</Text>
          <Text style={styles.slogan}>{slogan}</Text>
        </View>

        {/* 特性简介 */}
        <View style={styles.cards}>
          <FeatureCard icon="layers-triple" title="契约驱动" desc="contract-api / contract-types 统一契约，多端同源" />
          <FeatureCard icon="cellphone-link" title="一云多端" desc="Web / 桌面 / 移动 / 小程序一套业务逻辑" />
          <FeatureCard icon="puzzle" title="装配式" desc="客户能力经 Edition 注入，零仓库零分叉" />
        </View>

        <Text style={styles.footer}>© HUNTERCAT-DIGITAL</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.card}>
      <MaterialCommunityIcons
        name={icon as React.ComponentProps<typeof MaterialCommunityIcons>["name"]}
        size={24}
        color={colors.primary}
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  brand: { alignItems: "center", marginBottom: 40 },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  name: { fontSize: 24, fontWeight: "700", color: colors.text, textAlign: "center" },
  slogan: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: "center" },
  cards: { gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    gap: 14,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
  cardDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 40,
  },
});
