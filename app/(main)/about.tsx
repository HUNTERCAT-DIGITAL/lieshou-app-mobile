/**
 * 我的（个人主页薄壳 · 主框架「我的」tab）.
 * 个人驾驶舱（L3 个人域）由客户包 ProfileHome 承载：身份卡 + 今日驾驶舱数据 +
 * 个人空间导航 + 关于/版本收底；退出登录与品牌 props 由本薄壳从
 * authStore/edition 注入（客户包零 core-web 依赖）。
 * 历史「检查后端连通性」诊断下移至 ProfileHome「关于本应用」区外（dev 工具）。
 */
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@lieshoucloud/core-web';
import { useTheme } from '@lieshoucloud/ui-native/rn';

const CANVAS = '#f3f6fa';

import { getEdition } from '../../src/config/editions';
import { APP_VERSION } from '../../src/config/version';
import { ProfileHome } from '@lieshoucloud/legalmind/mobile';

export default function AboutPage() {
  const router = useRouter();
  const theme = useTheme();
  const edition = getEdition();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout(): Promise<void> {
    await logout();
    // 用户旅程闭环：登出 → 返回登录页
    router.replace('/login' as never);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: CANVAS }]} edges={['bottom']}>
      <ProfileHome
        user={user ?? undefined}
        brandName={edition.brandName}
        companyName={edition.companyName ?? edition.slogan}
        version={APP_VERSION}
        editionId={edition.id}
        onLogout={() => void handleLogout()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
