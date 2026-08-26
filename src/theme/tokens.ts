/**
 * Mobile 设计令牌（Design Tokens）—— 对齐 UI.md §2.2-2.4.
 * 间距 4 基准 / 圆角 / 字号。新代码必须用 token，禁止魔法值。
 * 存量页面迁移见 UI.md 或 lint 提示。
 */

/** 间距（UI.md §2.3 · 4 基准） */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

/** 圆角（UI.md §2.4） */
export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
} as const;

/** 字号（UI.md §2.2 移动端子集） */
export const fontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 22,
} as const;

/** 行高倍数（UI.md §2.2） */
export const lineHeight = 1.5715;

/** 加粗（UI.md §2.2 fontWeightStrong） */
export const fontWeightStrong = "600";
