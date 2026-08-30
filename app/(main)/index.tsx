/**
 * 主框架首页（(main)/index）· 客户模式重定向到业务首页（EXTRA_TABS[0]）；generic 显示通用欢迎页。
 */
import { Redirect, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@lieshoucloud/ui-native/rn';

import { getEdition } from '../../src/config/editions';
import { EXTRA_TABS } from '../../src/config/editions/extra';

export default function MainIndex() {
  const router = useRouter();
  const theme = useTheme();
  const edition = getEdition();
  const home = EXTRA_TABS[0]?.href;

  if (home) {
    return <Redirect href={home as Href} />;
  }

  // generic：无业务 tab → 通用欢迎页（详情见「我的」）
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.hero}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>{edition.brandName}</Text>
        {edition.slogan && <Text style={[styles.slogan, { color: theme.colors.outline }]}>{edition.slogan}</Text>}
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.colors.primary },
          pressed && styles.pressed,
        ]}
        onPress={() => router.push('/about')}
      >
        <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>进入应用</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, justifyContent: 'center', padding: 24 },
  hero: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '700' },
  slogan: { fontSize: 14, marginTop: 8 },
  button: {
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.8 },
});
