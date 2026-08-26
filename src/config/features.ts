/**
 * Mobile 功能开关（Feature Flags）· ADR-0035 客户差异进配置层.
 *
 * 设计：
 *  - 功能键集中定义（FeatureKey），业务代码只引用键名
 *  - 默认开关表（DEFAULT_FEATURES）+ 版别覆盖表（EDITION_OVERRIDES）
 *  - 版别来源：登录响应 tenantEdition（后端权威，auth store 持有）
 *
 * 演进：
 *  - Phase 后接远端开关（tenant feature flags 接口 / 配置中心下发），
 *    isFeatureEnabled 签名不变，内部改为「远端优先 + 本地兜底」。
 */
export type FeatureKey =
  | "approval" // 审批流
  | "lead-pool" // 线索池 / 公海（Phase B ✅ 已实现）
  | "customer-follow" // 客户跟进记录（Phase B）
  | "scan-stock" // 扫码出入库（原生相机，P2）
  | "analytics-board" // 经营看板（Phase C）
  | "dark-mode"; // 深色模式

export type EditionId = "GENERIC" | "LAYER" | "LEGALMIND" | "ZHIYE" | "JMZZ";

/** 默认开关：核心功能开，未实现/依赖原生能力的关 */
const DEFAULT_FEATURES: Record<FeatureKey, boolean> = {
  approval: true,
  "lead-pool": true,
  "customer-follow": false,
  "scan-stock": false,
  "analytics-board": false,
  "dark-mode": false,
};

/** 版别覆盖：行业版对默认值的增量修改（暂无差异，结构预留） */
const EDITION_OVERRIDES: Partial<Record<EditionId, Partial<Record<FeatureKey, boolean>>>> = {};

/** 是否启用某功能（版别为空时回落默认表） */
export function isFeatureEnabled(key: FeatureKey, edition?: string | null): boolean {
  const e = edition as EditionId | undefined;
  const override = e ? EDITION_OVERRIDES[e]?.[key] : undefined;
  return override ?? DEFAULT_FEATURES[key];
}

/** 当前已实现并展示的功能键列表（Tab 渲染用，过滤未开启项） */
export function enabledFeatures(edition?: string | null): FeatureKey[] {
  return (Object.keys(DEFAULT_FEATURES) as FeatureKey[]).filter((k) => isFeatureEnabled(k, edition));
}
