/**
 * 登录页（端自身骨架 · 蓝白撞色设计）.
 * 上半蓝（品牌区）+ 下半白（表单区，顶部大圆角压蓝）。
 * 登录方式：密码登录 / 短信验证码登录（tab 切换）。
 * 忘记密码：短信验证码找回（手机号 + 验证码 + 新密码）。
 * 保存密码：AsyncStorage 本地记住账号密码。
 * 键盘处理：手动监听键盘高度（Android 15+ edge-to-edge）。
 */
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { request } from '@lieshoucloud/contract-api';
import type { TokenResponse } from '@lieshoucloud/contract-types/business/auth';
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

type LoginMethod = 'password' | 'code';

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const edition = getEdition();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const setSession = useAuthStore((s) => s.setSession);
  const [tenantCode] = useState(edition.tenantCode ?? 'default');

  // 密码登录
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  // 验证码登录 / 找回密码
  const [method, setMethod] = useState<LoginMethod>('password');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  // 找回密码
  const [resetMode, setResetMode] = useState(false);
  const [resetPhone, setResetPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');

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
        /* 静默 */
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

  // 验证码倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (edition.login?.required === false || isAuthenticated) {
      router.replace(homeHref());
    }
  }, [router, edition.login?.required, isAuthenticated]);

  /** 发送短信验证码（登录 / 找回） */
  async function handleSendCode(purpose: 'LOGIN' | 'RESET_PASSWORD', target: string): Promise<void> {
    if (!/^1\d{10}$/.test(target.trim())) {
      setError('请输入正确的手机号');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await request({ method: 'POST', path: '/api/auth/send-code', body: { channel: 'SMS', target: target.trim(), purpose } });
      setCountdown(60);
    } catch (e) {
      setError(e instanceof Error ? e.message : '验证码发送失败');
    } finally {
      setSubmitting(false);
    }
  }

  /** 密码登录 */
  async function handlePasswordLogin(): Promise<void> {
    if (!username.trim() || !password) {
      setError('请输入账号和密码');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await login(username.trim(), password, tenantCode.trim() || undefined);
      if (remember) {
        await AsyncStorage.setItem(REMEMBER_KEY, JSON.stringify({ username: username.trim(), password } satisfies Remembered)).catch(() => {});
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

  /** 验证码登录 */
  async function handleCodeLogin(): Promise<void> {
    if (!/^1\d{10}$/.test(phone.trim())) {
      setError('请输入正确的手机号');
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError('请输入 6 位验证码');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const token = await request<TokenResponse>({
        method: 'POST',
        path: '/api/auth/login/code',
        body: { channel: 'SMS', target: phone.trim(), code: code.trim() },
      });
      setSession(token);
      router.replace(homeHref());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  /** 短信找回密码 */
  async function handleResetPassword(): Promise<void> {
    if (!/^1\d{10}$/.test(resetPhone.trim())) {
      setError('请输入正确的手机号');
      return;
    }
    if (!/^\d{6}$/.test(resetCode.trim())) {
      setError('请输入 6 位验证码');
      return;
    }
    if (resetPassword.length < 6 || resetPassword !== resetConfirm) {
      setError('新密码至少 6 位，且两次输入一致');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await request({
        method: 'POST',
        path: '/api/auth/reset-password',
        body: { channel: 'SMS', target: resetPhone.trim(), code: resetCode.trim(), newPassword: resetPassword },
      });
      // 重置成功：清空返回登录
      setResetMode(false);
      setResetPassword('');
      setResetConfirm('');
      alert('密码重置成功，请使用新密码登录');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.safe, { backgroundColor: theme.colors.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 上半：蓝色品牌区 */}
      <View style={styles.brand}>
        <Image source={require('../assets/logo-grid.png')} style={styles.brandIcon} resizeMode="contain" />
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
        {resetMode ? (
          /* ---- 短信找回密码 ---- */
          <View>
            <Text style={[styles.resetTitle, { color: theme.colors.onSurface }]}>找回密码</Text>
            <Text style={[styles.resetSub, { color: theme.colors.outline }]}>
              通过手机号短信验证码重置密码
            </Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="phone-outline" size={20} color={theme.colors.outline} />
              <TextInput
                style={[styles.input, { color: theme.colors.onSurface }]}
                value={resetPhone}
                onChangeText={setResetPhone}
                placeholder="手机号"
                placeholderTextColor={theme.colors.outline}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
            <View style={styles.codeRow}>
              <View style={[styles.inputWrap, styles.codeInput]}>
                <MaterialCommunityIcons name="shield-key-outline" size={20} color={theme.colors.outline} />
                <TextInput
                  style={[styles.input, { color: theme.colors.onSurface }]}
                  value={resetCode}
                  onChangeText={setResetCode}
                  placeholder="验证码"
                  placeholderTextColor={theme.colors.outline}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.codeBtn,
                  { backgroundColor: theme.colors.surfaceVariant },
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => void handleSendCode('RESET_PASSWORD', resetPhone)}
                disabled={countdown > 0 || submitting}
              >
                <Text style={[styles.codeBtnText, { color: theme.colors.primary }]}>
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={theme.colors.outline} />
              <TextInput
                style={[styles.input, { color: theme.colors.onSurface }]}
                value={resetPassword}
                onChangeText={setResetPassword}
                placeholder="新密码（至少 6 位）"
                placeholderTextColor={theme.colors.outline}
                secureTextEntry
              />
            </View>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="lock-check-outline" size={20} color={theme.colors.outline} />
              <TextInput
                style={[styles.input, { color: theme.colors.onSurface }]}
                value={resetConfirm}
                onChangeText={setResetConfirm}
                placeholder="确认新密码"
                placeholderTextColor={theme.colors.outline}
                secureTextEntry
              />
            </View>
            {error !== '' && <Text style={[styles.error, { color: STATUS_COLORS.error }]}>{error}</Text>}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.colors.primary },
                pressed && styles.buttonPressed,
              ]}
              onPress={() => void handleResetPassword()}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={theme.colors.onPrimary} />
              ) : (
                <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>重置密码</Text>
              )}
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.linkRow, pressed && styles.buttonPressed]}
              onPress={() => {
                setResetMode(false);
                setError('');
              }}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="chevron-left" size={16} color={theme.colors.outline} />
              <Text style={[styles.linkText, { color: theme.colors.outline }]}>返回登录</Text>
            </Pressable>
          </View>
        ) : (
          /* ---- 登录 ---- */
          <View>
            {/* 登录方式切换 */}
            <View style={styles.methodRow}>
              {(['password', 'code'] as LoginMethod[]).map((m) => (
                <Pressable key={m} style={styles.methodTab} onPress={() => { setMethod(m); setError(''); }} hitSlop={6}>
                  <Text
                    style={[
                      styles.methodTabText,
                      { color: method === m ? theme.colors.primary : theme.colors.outline },
                    ]}
                  >
                    {m === 'password' ? '密码登录' : '验证码登录'}
                  </Text>
                  {method === m && <View style={[styles.methodIndicator, { backgroundColor: theme.colors.primary }]} />}
                </Pressable>
              ))}
            </View>

            {method === 'password' ? (
              <>
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
                    onSubmitEditing={() => void handlePasswordLogin()}
                  />
                </View>
                <View style={styles.optionRow}>
                  <Pressable style={styles.remember} onPress={() => setRemember((v) => !v)} hitSlop={8}>
                    <MaterialCommunityIcons
                      name={remember ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={20}
                      color={remember ? theme.colors.primary : theme.colors.outline}
                    />
                    <Text style={[styles.rememberText, { color: theme.colors.onSurfaceVariant }]}>
                      保存密码
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => { setResetMode(true); setError(''); }} hitSlop={8}>
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
                  onPress={() => void handlePasswordLogin()}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={theme.colors.onPrimary} />
                  ) : (
                    <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>登 录</Text>
                  )}
                </Pressable>
              </>
            ) : (
              /* 验证码登录 */
              <>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="phone-outline" size={20} color={theme.colors.outline} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.onSurface }]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="手机号"
                    placeholderTextColor={theme.colors.outline}
                    keyboardType="phone-pad"
                    maxLength={11}
                  />
                </View>
                <View style={styles.codeRow}>
                  <View style={[styles.inputWrap, styles.codeInput]}>
                    <MaterialCommunityIcons name="shield-key-outline" size={20} color={theme.colors.outline} />
                    <TextInput
                      style={[styles.input, { color: theme.colors.onSurface }]}
                      value={code}
                      onChangeText={setCode}
                      placeholder="验证码"
                      placeholderTextColor={theme.colors.outline}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                  <Pressable
                    style={({ pressed }) => [
                      styles.codeBtn,
                      { backgroundColor: theme.colors.surfaceVariant },
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => void handleSendCode('LOGIN', phone)}
                    disabled={countdown > 0 || submitting}
                  >
                    <Text style={[styles.codeBtnText, { color: theme.colors.primary }]}>
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </Text>
                  </Pressable>
                </View>
                {error !== '' && <Text style={[styles.error, { color: STATUS_COLORS.error }]}>{error}</Text>}
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: theme.colors.primary },
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => void handleCodeLogin()}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={theme.colors.onPrimary} />
                  ) : (
                    <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>登 录</Text>
                  )}
                </Pressable>
              </>
            )}
          </View>
        )}

        {/* 返回门户（用户旅程可回溯） */}
        {!resetMode && (
          <Pressable
            style={({ pressed }) => [styles.backPortal, pressed && styles.buttonPressed]}
            onPress={() => router.replace('/portal')}
            hitSlop={8}
          >
            <MaterialCommunityIcons name="chevron-left" size={16} color={theme.colors.outline} />
            <Text style={[styles.backPortalText, { color: theme.colors.outline }]}>返回门户</Text>
          </Pressable>
        )}
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
  brandIcon: { width: 64, height: 64, borderRadius: 20, marginBottom: 14 },
  brandTitle: { fontSize: 26, fontWeight: '700', color: '#fff' },
  brandSlogan: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 8 },
  formArea: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  formContent: {
    padding: 24,
    paddingTop: 28,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 22,
  },
  methodTab: { alignItems: 'center' },
  methodTabText: { fontSize: 15, fontWeight: '600' },
  methodIndicator: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginTop: 6,
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
  codeRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  codeInput: { flex: 1 },
  codeBtn: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  codeBtnText: { fontSize: 13, fontWeight: '600' },
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
  resetTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  resetSub: { fontSize: 13, marginBottom: 20 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: 18,
  },
  linkText: { fontSize: 13 },
  backPortal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: 18,
  },
  backPortalText: { fontSize: 13 },
});
