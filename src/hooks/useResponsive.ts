/**
 * useResponsive —— 薄壳 re-export.
 * 2026-09 下沉：原本地实现迁至共享仓 @lieshoucloud/hooks/rn。
 * 本文件保留以兼容既有 import 路径；新代码请直接 import '@lieshoucloud/hooks/rn'。
 */
export { useResponsive, TABLET_MIN_WIDTH, TABLET_CONTENT_MAX_WIDTH } from "@lieshoucloud/hooks/rn";
export type { Breakpoint, ResponsiveInfo } from "@lieshoucloud/hooks/rn";
