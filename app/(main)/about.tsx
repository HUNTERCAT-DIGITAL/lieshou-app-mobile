/**
 * 关于页（主框架「我的」tab · 收纳端自身骨架：品牌/版本/版别/后端连通性/退出登录）.
 * 上游通用启动页信息收敛于此（2026-09 · 登录后直达业务首页）。
 */
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@lieshoucloud/core-web';
import { useTheme, STATUS_COLORS } from '@lieshoucloud/ui-native/rn';

import { getEdition } from '../../src/config/editions';
import { APP_VERSION } from '../../src/config/version';

interface CheckState {
  ok: boolean;
  text: string;
}

export default function AboutPage() {
  const router = useRouter();
  const theme = useTheme();
  const edition = getEdition();
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const logout = useAuthStore((s) => s.logout);
  const [checking, setChecking] = useState(false);
  const [checkMsg, setCheckMsg] = useState<CheckState | null>(null);
  const userName = user?.username || '未登录';
  const userText = user?.tenantName ? `${userName}（${user.tenantName}）` : userName;

  const runCheck = useCallback(async () => {
    setChecking(true);
    setCheckMsg(null);
    try {
      const me = await fetchMe();
      setCheckMsg({
        ok: true,
        text: `后端连通正常（${me.username ?? '已登录'} @ ${me.tenantCode ?? '-'}）`,
      });
    } catch (err) {
      setCheckMsg({ ok: false, text: err instanceof Error ? err.message : String(err) });
    } finally {
      setChecking(false);
    }
  }, [fetchMe]);

  async function handleLogout(): Promise<void> {
    await logout();
    // 用户旅程闭环：登出 → 返回登录页（守卫 index → /welcome 不再兜底，显式回登录）
    router.replace('/login' as never);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>{edition.brandName}</Text>
          {edition.slogan && <Text style={[styles.slogan, { color: theme.colors.outline }]}>{edition.slogan}</Text>}
        </View>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Row label="平台" value="移动端 · Expo + React Native" />
          <Row label="版本" value={APP_VERSION} />
          <Row label="版别" value={edition.id} />
          <Row label="用户" value={userText} />
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.primary,
            { backgroundColor: theme.colors.primary },
            pressed && styles.pressed,
          ]}
          onPress={() => void runCheck()}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text style={[styles.primaryText, { color: theme.colors.onPrimary }]}>检查后端连通性</Text>
          )}
        </Pressable>
        {checkMsg && (
          <Text
            style={[
              styles.checkMsg,
              { color: checkMsg.ok ? STATUS_COLORS.success : STATUS_COLORS.error },
            ]}
          >
            {checkMsg.text}
          </Text>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.ghost,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
            },
            pressed && styles.pressed,
          ]}
          onPress={() => void handleLogout()}
        >
          <Text style={[styles.ghostText, { color: theme.colors.onSurfaceVariant }]}>退出登录</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.outlineVariant }]}>
      <Text style={[styles.key, { color: theme.colors.outline }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.colors.onSurface }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flexGrow: 1, padding: 24 },
  hero: { alignItems: 'center', paddingVertical: 32 },
  title: { fontSize: 24, fontWeight: '700' },
  slogan: { fontSize: 14, marginTop: 8 },
  card: { borderRadius: 12, paddingHorizontal: 16, marginBottom: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  key: { fontSize: 14 },
  value: { fontSize: 14, flexShrink: 1, textAlign: 'right' },
  primary: {
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryText: { fontSize: 15, fontWeight: '600' },
  ghost: {
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: { fontSize: 15 },
  pressed: { opacity: 0.8 },
  checkMsg: { fontSize: 13, textAlign: 'center', marginBottom: 12 },
});
