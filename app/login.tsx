/**
 * Mobile 登录页（Phase 9 · 多端真实化）.
 *
 * RN 原生组件 + 内联样式；用 `useAuthStore` 直接调 login。
 */
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { isApiError } from "../src/services/auth";
import { useAuthStore } from "../src/stores/auth";
import { colors } from "../src/theme/colors";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!username || !password) {
      Alert.alert("提示", "请输入用户名和密码");
      return;
    }
    setSubmitting(true);
    try {
      await login(username, password);
      router.replace("/(main)");
    } catch (e) {
      const msg = isApiError(e) ? e.message : String(e);
      Alert.alert("登录失败", msg || "请检查用户名密码");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.brandRow}>
          <View style={styles.dot} />
          <Text style={styles.brandText}>LieShou Cloud</Text>
        </View>
        <Text style={styles.title}>登录 · Mobile</Text>
        <Text style={styles.subtitle}>与 Admin / Desktop 共享后端；登录态走 Zustand + AsyncStorage</Text>

        <View style={styles.field}>
          <Text style={styles.label}>用户名</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="futurewl"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            testID="username-input"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>密码</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="password"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            testID="password-input"
          />
        </View>

        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={submitting}
          testID="login-button"
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>登录</Text>}
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  flex: { flex: 1 },
  brandRow: { flexDirection: "row", alignItems: "center", marginBottom: 32, marginTop: 24 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginRight: 8 },
  brandText: { fontSize: 16, fontWeight: "600" },
  title: { fontSize: 28, fontWeight: "700", color: colors.primary, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
