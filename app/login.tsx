/**
 * 登录页（端自身骨架 · 登录态来自 core-web useAuthStore）
 * 租户 + 账号 + 密码 → core-web login（POST /api/auth/login）。
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@lieshoucloud/core-web';

import { getEdition } from '../src/config/editions';

export default function LoginPage() {
  const router = useRouter();
  const edition = getEdition();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const [tenantCode, setTenantCode] = useState(edition.tenantCode ?? 'default');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (edition.login?.required === false || isAuthenticated) {
      router.replace('/');
    }
  }, [router, edition.login?.required, isAuthenticated]);

  async function handleLogin(): Promise<void> {
    if (!username.trim() || !password) {
      setError('请输入账号和密码');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await login(username.trim(), password, tenantCode.trim() || undefined);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.brand}>
        <Text style={styles.title}>{edition.brandName}</Text>
        {edition.slogan && <Text style={styles.slogan}>{edition.slogan}</Text>}
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={tenantCode}
          onChangeText={setTenantCode}
          placeholder="租户编码"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="用户名"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="密码"
          secureTextEntry
        />
        {error !== '' && <Text style={styles.error}>{error}</Text>}
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => void handleLogin()}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>登 录</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#02429b',
    justifyContent: 'center',
    padding: 24,
  },
  brand: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  slogan: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 8 },
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  error: { color: '#cf1322', fontSize: 13, marginBottom: 8 },
  button: {
    height: 46,
    borderRadius: 8,
    backgroundColor: '#02429b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
