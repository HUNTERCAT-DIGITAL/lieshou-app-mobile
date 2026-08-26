/**
 * 响应式断点 hook（端壳模板 · 手机/平板自适应）.
 *
 * 断点约定：
 *   - <768px      → phone（手机：底部 Tab、单列内容）
 *   - >=768px     → tablet（平板：内容自适应、多栏布局）
 *
 * 供页面/布局统一消费，避免各页面各自 useWindowDimensions 重复逻辑。
 * @see .ai/decisions/0013-mobile-app.md（端壳模板化 · 响应式）
 */
import { useWindowDimensions } from "react-native";

export type Breakpoint = "phone" | "tablet";

/** 平板阈值：与常见 iPad / Android 平板竖屏宽度对齐（iPad mini 768 / iPad 810+） */
export const TABLET_MIN_WIDTH = 768;

/** 平板内容区最大宽度（大屏不铺满，居中卡片式；超宽屏舒适阅读宽度） */
export const TABLET_CONTENT_MAX_WIDTH = 960;

export interface ResponsiveInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isTablet: boolean;
  isPhone: boolean;
  /** 平板内容区宽度（手机 = 全宽 undefined） */
  contentWidth: number;
  /** 平板内容区是否应居中（padding 用） */
  contentPadding: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= TABLET_MIN_WIDTH;
  const breakpoint: Breakpoint = isTablet ? "tablet" : "phone";

  return {
    width,
    height,
    breakpoint,
    isTablet,
    isPhone: !isTablet,
    contentWidth: isTablet ? Math.min(width, TABLET_CONTENT_MAX_WIDTH) : width,
    contentPadding: isTablet ? Math.max(12, Math.round((width - Math.min(width, TABLET_CONTENT_MAX_WIDTH)) / 2)) : 0,
  };
}
