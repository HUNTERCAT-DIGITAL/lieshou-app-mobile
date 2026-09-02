/**
 * 客户仓注入槽位（客户聚合仓模式 · 2026-09）.
 *
 * 独立仓库（无客户仓）：占位（空数组），行为与通用版完全一致；
 * 客户仓 deploy:prepare 会覆盖本文件注入 EXTRA_TABS / EXTRA_HIDDEN / BRAND / PORTAL / API_BASE / PRIMARY_COLOR。
 *
 * 类型契约：ClientTab / BrandConfig 来自 @lieshoucloud/core-web；EditionPortal 来自 contract-types
 * （共享，禁止客户仓重新定义）。
 */
import type { ClientTab, BrandConfig } from "@lieshoucloud/core-web";
import type { EditionPortal } from "@lieshoucloud/contract-types";

export type { ClientTab, BrandConfig };

/** 门户页内容占位（客户仓 prepare 注入 PORTAL；generic 回落端默认） */
export const PORTAL: EditionPortal | undefined = undefined;

export const EXTRA_TABS: ClientTab[] = [];

/** 非 tab 路由（布局层 href:null 隐藏） */
export const EXTRA_HIDDEN: string[] = [];

export const BRAND: BrandConfig = {
  name: "猎手云",
  title: "猎手云",
  subtitle: "数字化平台 · 移动端",
};

/** API 基址（generic 走 env / _layout 默认） */
export const API_BASE: string | undefined = undefined;

/** 客户默认租户（客户仓 prepare 注入；generic 走 genericEdition 缺省） */
export const TENANT_CODE: string | undefined = undefined;

/** 品牌主色（generic 猎手云主色） */
export const PRIMARY_COLOR: string = "#1677ff";
