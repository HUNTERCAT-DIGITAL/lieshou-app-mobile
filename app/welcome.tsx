/**
 * 欢迎页（端自身骨架 · 用户旅程起点）.
 * 品牌闪屏：品牌图标 + 平台名 + 标语 → 「进入应用」→ 门户页（未登录）或已登录守卫已跳业务首页。
 */
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@lieshoucloud/ui-native/rn';

import { getEdition } from '../src/config/editions';

export default function WelcomePage() {
  const router = useRouter();
  const theme = useTheme();
  const edition = getEdition();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.brand}>
        <View style={[styles.icon, { backgroundColor: `${theme.colors.onPrimary}22` }]}>
          <MaterialCommunityIcons name="shield-search" size={48} color={theme.colors.onPrimary} />
        </View>
        <Text style={styles.title}>{edition.brandName}</Text>
        {edition.slogan && <Text style={styles.slogan}>{edition.slogan}</Text>}
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.colors.onPrimary },
          pressed && styles.pressed,
        ]}
        onPress={() => router.replace('/portal')}
      >
        <Text style={[styles.buttonText, { color: theme.colors.primary }]}>进入应用</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, justifyContent: 'space-between', padding: 24 },
  brand: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 30, fontWeight: '700', color: '#fff' },
  slogan: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 10 },
  button: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonText: { fontSize: 16, fontWeight: '700', letterSpacing: 4 },
  pressed: { opacity: 0.85 },
});
