/**
 * 登录守卫（端自身骨架）· 未登录 → 欢迎页（用户旅程起点）；已登录 → 业务首页（EXTRA_TABS[0]）或主框架。
 */
import { Redirect, type Href } from 'expo-router';
import { useAuthStore } from '@lieshoucloud/core-web';

import { getEdition } from '../src/config/editions';
import { EXTRA_TABS } from '../src/config/editions/extra';

export default function Index() {
  const edition = getEdition();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (edition.login?.required !== false && !isAuthenticated) {
    return <Redirect href="/welcome" />;
  }

  const home = EXTRA_TABS[0]?.href;
  if (home) {
    return <Redirect href={home as Href} />;
  }
  return <Redirect href="/(main)" />;
}
