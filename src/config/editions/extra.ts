/**
 * 客户仓注入槽位（客户聚合仓模式 · 2026-09）.
 *
 * 独立仓库（无客户仓）：占位（空数组），行为与通用版完全一致；
 * 客户仓 deploy:prepare 会覆盖本文件注入 EXTRA_TABS / EXTRA_HIDDEN（一个部署 = 一个客户，槽位名保持中性）。
 *
 * 注：Expo Router 为文件路由，客户薄壳页（app/(main)/<key>/...）存在即注册路由；
 * 本槽位只声明「客户 tab 入口」与「客户非 tab 路由」，由 workbench.ts / 主布局消费。
 */
export interface ClientTab {
  /** 对应 Expo Router 文件路由名（Tabs.Screen name），如 'legalmind/workspace' */
  key: string;
  /** tab 文案 */
  title: string;
  /** MaterialCommunityIcons 图标名（端壳 TabIcon 矢量渲染，禁 emoji，见 UI.md §4.4） */
  icon: string;
  /** 路由路径（Tab 点击跳转），如 '/legalmind/workspace' */
  href: string;
}

export const EXTRA_TABS: ClientTab[] = [];

/**
 * 客户注入的非 tab 路由（详情页/次级页，如 'dwjk/topo'、'dwjk/device/[id]'）.
 * 主布局 (main)/_layout.tsx 会把「不在工作台 items 中的路由」显式 href:null 隐藏——
 * 注意只能由布局层声明生效，页面内 <Tabs.Screen options={{href:null}}/>（setOptions）无效。
 */
export const EXTRA_HIDDEN: string[] = [];

/**
 * 客户 API 基址覆盖（可空）。
 * 客户仓 deploy:prepare 注入：`export const API_BASE: string | undefined = "https://...";`；
 * 独立仓为空字符串 → api.ts 回退 env（EXPO_PUBLIC_API_BASE）/ 默认 dev 域名。
 */
export const API_BASE: string | undefined = "";
