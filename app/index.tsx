/**
 * 启动页（端自身骨架 · 用户/登录态来自 core-web useAuthStore）
 * 品牌 + 平台标识 + 版本 + 登录用户 + 后端连通性检查（GET /api/auth/me）。
 */
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Href, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@lieshoucloud/core-web';

import { getEdition } from '../src/config/editions';
import { APP_VERSION } from '../src/config/version';

interface CheckState {
  ok: boolean;
  text: string;
}

export default function HomePage() {
  const router = useRouter();
  const edition = getEdition();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const logout = useAuthStore((s) => s.logout);
  const [checking, setChecking] = useState(false);
  const [checkMsg, setCheckMsg] = useState<CheckState | null>(null);
  const [ready, setReady] = useState(false);
  const userName = user?.username || '未登录';
  const userText = user?.tenantName ? `${userName}（${user.tenantName}）` : userName;

  useEffect(() => {
    const required = edition.login?.required !== false;
    if (required && !isAuthenticated) {
      router.replace('/login' as Href);
      return;
    }
    setReady(true);
    fetchMe()
      .catch(() => {
        /* 静默：守卫已兜底 */
      });
  }, [router, edition.login?.required, isAuthenticated, fetchMe]);

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
    router.replace('/login' as Href);
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color="#02429b" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>{edition.brandName}</Text>
          <Text style={styles.slogan}>{edition.slogan}</Text>
        </View>
        <View style={styles.card}>
          <Row label="平台" value="移动端 · Expo + React Native" />
          <Row label="版本" value={APP_VERSION} />
          <Row label="版别" value={edition.id} />
          <Row label="用户" value={userText} />
        </View>
        <Pressable
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          onPress={() => void runCheck()}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>检查后端连通性</Text>
          )}
        </Pressable>
        {checkMsg && (
          <Text style={checkMsg.ok ? styles.ok : styles.fail}>{checkMsg.text}</Text>
        )}
        <Pressable
          style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}
          onPress={() => void handleLogout()}
        >
          <Text style={styles.ghostText}>退出登录</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.key}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f6f7' },
  container: { flexGrow: 1, padding: 24 },
  hero: { alignItems: 'center', paddingVertical: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f1f1f' },
  slogan: { fontSize: 14, color: '#8c8c8c', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  key: { fontSize: 14, color: '#8c8c8c' },
  value: { fontSize: 14, color: '#1f1f1f', flexShrink: 1, textAlign: 'right' },
  primary: {
    height: 46,
    borderRadius: 8,
    backgroundColor: '#02429b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  ghost: {
    height: 46,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: { color: '#595959', fontSize: 15 },
  pressed: { opacity: 0.8 },
  ok: { color: '#389e0d', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  fail: { color: '#cf1322', fontSize: 13, textAlign: 'center', marginBottom: 12 },
});
