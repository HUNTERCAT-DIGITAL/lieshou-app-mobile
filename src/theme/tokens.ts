/**
 * Mobile 设计令牌（Design Tokens）—— 对齐 UI.md §2.2-2.4.
 * 间距 4 基准 / 圆角 / 字号。新代码必须用 token，禁止魔法值。
 * 存量页面迁移见 UI.md 或 lint 提示。
 *
 * 2026-09 下沉 @lieshoucloud/ui-native（展示层 L1 · RN/Taro 共用）：
 * 本文件保留薄壳 re-export，import 'theme/tokens' 路径不变。
 */
export { spacing, radius, fontSize, lineHeight, fontWeightStrong } from "@lieshoucloud/ui-native";
