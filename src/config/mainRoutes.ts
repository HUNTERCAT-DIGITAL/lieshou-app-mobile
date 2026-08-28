/**
 * (main) 主布局路由清单（端壳模板 · 配置驱动）.
 *
 * 背景：expo-router Tabs 默认把 app/(main)/ 下所有路由渲染为底部 tab；
 * 布局层把「不在工作台 items 中」的路由显式 href:null 隐藏（页面内
 * setOptions 无效）。本清单是隐藏判断的事实源，由 (main)/_layout.tsx 消费。
 *
 * 约定：新增 (main) 下页面必须登记到本文件（NON_TAB_SCREENS 或
 * GENERIC_MAIN_ROUTES），否则会意外变成底部 tab——mainRoutes.test.ts
 * 以文件系统为准做双向断言，漏登记即测试失败。
 */
export const NON_TAB_SCREENS = [
  "customers/[id]",
  "leads/[id]",
  "approval/[id]",
  "profile",
] as const;

/**
 * (main) 下全部通用路由（端壳模板 · 不含客户注入路由）.
 * 布局层把「不在工作台 items 中」的路由显式隐藏——底部 tab 只由工作台配置驱动。
 */
export const GENERIC_MAIN_ROUTES: readonly string[] = [
  "index",
  "customers",
  "leads",
  "inventory",
  "finance",
  "approval",
  ...NON_TAB_SCREENS,
];
