/**
 * 工作台配置（端壳模板 · 角色工作台框架）.
 *
 * 每个行业（generic/edu/legal/iot）× 登录角色 → 一组菜单/首页。
 * 主布局 (main)/_layout.tsx 从本配置渲染导航，行业菜单由行业包
 * （industry-{edu,iot,legal}，经 industry/ submodule 提供）装配
 * （2026-09 行业版收敛：edu/iot/legal-mobile 已废弃，回迁通用仓）。
 *
 * 角色值对齐后端（admin/auth/user 服务）：
 *   PLATFORM_ADMIN / TENANT_ADMIN / DUTY_OFFICER / 行业角色（EDU_* / LEGAL_* / IOT_*）。
 * item.roles 缺省 = 全部登录用户可见。
 */
import type { IndustryId } from "./industry";
import { EXTRA_TABS } from "./editions/extra";


export interface WorkbenchItem {
  /** 对应 Expo Router 文件路由名（Tabs.Screen name） */
  key: string;
  title: string;
  icon: string;
  /** 路由路径（Tab 点击跳转） */
  href: string;
  /** 可见角色白名单（缺省全部）；角色名见 auth store user.roles */
  roles?: string[];
}

export interface Workbench {
  industry: IndustryId;
  /** 登录后首页 */
  home: string;
  items: WorkbenchItem[];
}

/** 通用工作台（现有功能映射：客户/线索/案件/库存/记账/审批） */
const GENERIC_WORKBENCH: Workbench = {
  industry: "generic",
  home: "/",
  items: [
    { key: "index", title: "工作台", icon: "📊", href: "/" },
    { key: "customers", title: "客户", icon: "👥", href: "/customers" },
    { key: "leads", title: "线索", icon: "🎯", href: "/leads" },
    { key: "inventory", title: "库存", icon: "📦", href: "/inventory" },
    { key: "finance", title: "记账", icon: "💰", href: "/finance" },
    { key: "approval", title: "审批", icon: "📋", href: "/approval" },
  ],
};

export const WORKBENCHES: Record<IndustryId, Workbench> = {
  generic: GENERIC_WORKBENCH,
  edu: GENERIC_WORKBENCH,
  legal: GENERIC_WORKBENCH,
  iot: GENERIC_WORKBENCH,
};

/**
 * 客户仓注入 tab → 工作台菜单项（槽位：editions/extra.ts 的 EXTRA_TABS）.
 * 独立仓库 EXTRA_TABS 为空 → 零变化；客户仓 prepare 注入后自动合并。
 */
export function mergeClientTabs(items: WorkbenchItem[]): WorkbenchItem[] {
  return [
    ...items,
    ...EXTRA_TABS.map((t) => ({
      key: t.key,
      title: t.title,
      icon: t.icon,
      href: t.href,
    })),
  ];
}

/**
 * 按行业 + 登录角色取工作台（过滤 role 白名单）.
 * 行业包可注入自定义工作台（替换 WORKBENCHES[id]）；
 * 客户仓注入的 tab 由 mergeClientTabs 合并（2026-09 客户聚合仓模式）。
 */
export function getWorkbench(industry: IndustryId, roles: string[] = []): Workbench {
  const wb = WORKBENCHES[industry] ?? GENERIC_WORKBENCH;
  return {
    ...wb,
    items: mergeClientTabs(wb.items).filter(
      (it) => !it.roles || it.roles.length === 0 || it.roles.some((r) => roles.includes(r)),
    ),
  };
}

/** 角色是否有权访问某菜单（供 RouteGuard 用） */
export function canAccess(item: WorkbenchItem, roles: string[]): boolean {
  return !item.roles || item.roles.length === 0 || item.roles.some((r) => roles.includes(r));
}
