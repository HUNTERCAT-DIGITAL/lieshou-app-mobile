/**
 * 门户页（端自身骨架 · 未登录首页）.
 * 品牌 + 平台简介 → 「登 录」→ 登录页。用户旅程：欢迎 → 门户 → 登录 → 内容 → 登出 → 登录。
 */
import { useRouter } from 'expo-router';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@lieshoucloud/ui-native/rn';

import { getEdition } from '../src/config/editions';

export default function PortalPage() {
  const router = useRouter();
  const theme = useTheme();
  const edition = getEdition();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.hero}>
        <View style={[styles.icon, { backgroundColor: `${theme.colors.primary}18` }]}>
          <Image source={require('../assets/logo-grid.png')} style={styles.icon} resizeMode="contain" />
        </View>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>{edition.brandName}</Text>
        {edition.slogan && (
          <Text style={[styles.slogan, { color: theme.colors.outline }]}>{edition.slogan}</Text>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.featureTitle, { color: theme.colors.onSurface }]}>平台能力</Text>
        {(edition.portal?.features ?? DEFAULT_FEATURES).map((f, i) => (
          <FeatureRow key={i} icon={FEATURE_ICONS[i] ?? 'check'} text={f.title} sub={f.desc} color={theme.colors.primary} />
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.colors.primary },
          pressed && styles.pressed,
        ]}
        onPress={() => router.replace('/login')}
      >
        <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>登 录</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.link, pressed && styles.pressed]}
        onPress={() => router.replace('/welcome')}
      >
        <Text style={[styles.linkText, { color: theme.colors.outline }]}>返回欢迎页</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function FeatureRow({
  icon,
  text,
  sub,
  color,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  text: string;
  sub?: string;
  color: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.featureRow}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
      <View style={styles.featureTextWrap}>
        <Text style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>{text}</Text>
        {sub ? <Text style={[styles.featureSub, { color: theme.colors.outline }]}>{sub}</Text> : null}
      </View>
    </View>
  );
}

/** 功能卡片图标（与功能顺序对应 · legalmind 门户：案件/日程/文书/计时） */
const FEATURE_ICONS: Array<React.ComponentProps<typeof MaterialCommunityIcons>['name']> = [
  'folder-open-outline', // 案件管理
  'calendar-clock-outline', // 日程安排
  'file-document-outline', // 文书模板
  'timer-outline', // 计时计费
];

/** 缺省功能（generic 无 portal 注入时兜底 · 通用平台能力） */
const DEFAULT_FEATURES: { title: string; desc: string }[] = [
  { title: '设备在线监测', desc: '变电站 / 配电设备实时状态' },
  { title: '实时告警', desc: '告警推送与值班确认闭环' },
  { title: '运维工单', desc: '告警转工单 · 派单闭环处置' },
  { title: '远程控制', desc: '设备远程指令 · 随时随地' },
];

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 24 },
  hero: { alignItems: 'center', paddingVertical: 36 },
  icon: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '700' },
  slogan: { fontSize: 14, marginTop: 8 },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  featureTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  featureText: { fontSize: 14, flex: 1 },
  featureTextWrap: { flex: 1 },
  featureSub: { fontSize: 12, marginTop: 2 },
  button: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '700', letterSpacing: 4 },
  link: { alignItems: 'center', paddingVertical: 14 },
  linkText: { fontSize: 13 },
  pressed: { opacity: 0.8 },
});
