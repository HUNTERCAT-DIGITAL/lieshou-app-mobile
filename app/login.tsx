/**
 * 登录页（端自身骨架 · 蓝白撞色设计）.
 * 上半蓝（品牌区）+ 下半白（表单区，顶部大圆角压蓝）——学习 H5/小程序国内移动端风格。
 * 功能：保存密码（AsyncStorage 本地记住账号密码）+ 忘记密码（提示联系管理员）。
 * 键盘处理：手动监听键盘高度让出（Android 15+ edge-to-edge），iOS 保留 KeyboardAvoidingView。
 */
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, type Href } from 'expo-router';
import { useAuthStore } from '@lieshoucloud/core-web';
import { useTheme, STATUS_COLORS } from '@lieshoucloud/ui-native/rn';

import { getEdition } from '../src/config/editions';
import { EXTRA_TABS } from '../src/config/editions/extra';

const REMEMBER_KEY = 'lieshoucloud:login:remember';

/** 登录后首页：业务 tab 首个（客户）或主框架（generic） */
function homeHref(): Href {
  return (EXTRA_TABS[0]?.href as Href) ?? '/(main)';
}

interface Remembered {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const edition = getEdition();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const [tenantCode] = useState(edition.tenantCode ?? 'default');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // 键盘高度（Android 15+ edge-to-edge 下窗口不再 resize，需手动让出）
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 恢复保存的账号密码
  useEffect(() => {
    AsyncStorage.getItem(REMEMBER_KEY)
      .then((raw) => {
        if (!raw) return;
        const r = JSON.parse(raw) as Remembered;
        if (r.username) {
          setUsername(r.username);
          setPassword(r.password ?? '');
          setRemember(true);
        }
      })
      .catch(() => {
        /* 静默：无保存记录 */
      });
  }, []);

  // 键盘监听
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvt, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvt, () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (edition.login?.required === false || isAuthenticated) {
      router.replace(homeHref());
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
      // 保存密码
      if (remember) {
        await AsyncStorage.setItem(
          REMEMBER_KEY,
          JSON.stringify({ username: username.trim(), password } satisfies Remembered),
        ).catch(() => {});
      } else {
        await AsyncStorage.removeItem(REMEMBER_KEY).catch(() => {});
      }
      router.replace(homeHref());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  function handleForgot(): void {
    // 忘记密码：暂无自助重置，提示联系管理员
    // TODO: 后续接后端重置流程后替换为跳转
    // eslint-disable-next-line no-alert
    alert(`请联系管理员重置账号「${username.trim() || '您的'}」的密码`);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.safe, { backgroundColor: theme.colors.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 上半：蓝色品牌区 */}
      <View style={styles.brand}>
        <View style={[styles.brandIcon, { backgroundColor: `${theme.colors.onPrimary}22` }]}>
          <MaterialCommunityIcons name="shield-search" size={40} color={theme.colors.onPrimary} />
        </View>
        <Text style={styles.brandTitle}>{edition.brandName}</Text>
        {edition.slogan && <Text style={styles.brandSlogan}>{edition.slogan}</Text>}
      </View>

      {/* 下半：白色表单区（顶部大圆角压蓝 · 蓝白撞色） */}
      <ScrollView
        style={[styles.formArea, { backgroundColor: theme.colors.surface }]}
        contentContainerStyle={[styles.formContent, { paddingBottom: keyboardHeight + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="account-outline" size={20} color={theme.colors.outline} />
          <TextInput
            style={[styles.input, { color: theme.colors.onSurface }]}
            value={username}
            onChangeText={setUsername}
            placeholder="用户名"
            placeholderTextColor={theme.colors.outline}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>
        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="lock-outline" size={20} color={theme.colors.outline} />
          <TextInput
            style={[styles.input, { color: theme.colors.onSurface }]}
            value={password}
            onChangeText={setPassword}
            placeholder="密码"
            placeholderTextColor={theme.colors.outline}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={() => void handleLogin()}
          />
        </View>

        <View style={styles.optionRow}>
          <Pressable
            style={styles.remember}
            onPress={() => setRemember((v) => !v)}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name={remember ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={20}
              color={remember ? theme.colors.primary : theme.colors.outline}
            />
            <Text style={[styles.rememberText, { color: theme.colors.onSurfaceVariant }]}>
              保存密码
            </Text>
          </Pressable>
          <Pressable onPress={handleForgot} hitSlop={8}>
            <Text style={[styles.forgotText, { color: theme.colors.primary }]}>忘记密码？</Text>
          </Pressable>
        </View>

        {error !== '' && <Text style={[styles.error, { color: STATUS_COLORS.error }]}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.colors.primary },
            pressed && styles.buttonPressed,
          ]}
          onPress={() => void handleLogin()}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>登 录</Text>
          )}
        </Pressable>

        {/* 返回门户（用户旅程可回溯） */}
        <Pressable
          style={({ pressed }) => [styles.backPortal, pressed && styles.buttonPressed]}
          onPress={() => router.replace('/portal')}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={16}
            color={theme.colors.outline}
          />
          <Text style={[styles.backPortalText, { color: theme.colors.outline }]}>返回门户</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  brand: {
    alignItems: 'center',
    paddingTop: 72,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  brandTitle: { fontSize: 26, fontWeight: '700', color: '#fff' },
  brandSlogan: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 8 },
  formArea: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  formContent: {
    padding: 24,
    paddingTop: 36,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f5f6f8',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 14,
  },
  input: { flex: 1, fontSize: 15, height: '100%' },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rememberText: { fontSize: 13 },
  forgotText: { fontSize: 13, fontWeight: '500' },
  error: { fontSize: 13, marginBottom: 10 },
  button: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { opacity: 0.85 },
  buttonText: { fontSize: 16, fontWeight: '700', letterSpacing: 4 },
  backPortal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: 18,
  },
  backPortalText: { fontSize: 13 },
});
