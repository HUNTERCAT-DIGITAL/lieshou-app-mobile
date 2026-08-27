/**
 * 客户仓注入槽位（客户聚合仓模式 · 2026-09）.
 *
 * 独立仓库（无客户仓）：占位（空数组），行为与通用版完全一致；
 * 客户仓 deploy:prepare 会覆盖本文件注入 EXTRA_TABS（一个部署 = 一个客户，槽位名保持中性）。
 *
 * 注：Expo Router 为文件路由，客户薄壳页（app/(main)/<key>/...）存在即注册路由；
 * 本槽位只声明「客户 tab 入口」，由 workbench.ts 合并进工作台菜单。
 */
export interface ClientTab {
  /** 对应 Expo Router 文件路由名（Tabs.Screen name），如 'legalmind/workspace' */
  key: string;
  /** tab 文案 */
  title: string;
  /** emoji 图标（端壳 TabIcon 渲染，省 RN 图标库） */
  icon: string;
  /** 路由路径（Tab 点击跳转），如 '/legalmind/workspace' */
  href: string;
}

export const EXTRA_TABS: ClientTab[] = [];
