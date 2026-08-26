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

import { EDU_WORKBENCH_ITEMS } from "@lieshoucloud/industry-edu";
import { IOT_WORKBENCH_ITEMS } from "@lieshoucloud/industry-iot";
import { LEGAL_WORKBENCH_ITEMS } from "@lieshoucloud/industry-legal";

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
    { key: "legal", title: "案件", icon: "⚖️", href: "/legal" },
    { key: "inventory", title: "库存", icon: "📦", href: "/inventory" },
    { key: "finance", title: "记账", icon: "💰", href: "/finance" },
    { key: "approval", title: "审批", icon: "📋", href: "/approval" },
  ],
};

/**
 * 端侧已实现路由的行业菜单 key（行业包工作台数据裁剪点）.
 * 行业包 WORKBENCH_ITEMS 含规划态条目（师资/签到/拓扑/日程等尚无页面），
 * 只装配已实现的路由，避免 Tabs.Screen 引用不存在的路由导致崩溃。
 */
const IMPLEMENTED_KEYS: Record<"edu" | "iot" | "legal", string[]> = {
  edu: ["index", "edu/courses", "edu/lessons", "edu/children"],
  iot: ["index", "iot/devices", "iot/alerts", "iot/overview"],
  legal: ["index", "legal/time"],
};

/** 从行业包工作台数据挑选已实现条目（保留角色白名单） */
function pickItems(
  industry: keyof typeof IMPLEMENTED_KEYS,
  source: WorkbenchItem[],
): WorkbenchItem[] {
  const allowed = IMPLEMENTED_KEYS[industry];
  return source.filter((it) => allowed.includes(it.key));
}

/** 教育行业工作台（industry-edu 装配：课程/课时/孩子进度 × 三角色） */
const EDU_WORKBENCH: Workbench = {
  industry: "edu",
  home: "/",
  items: pickItems("edu", EDU_WORKBENCH_ITEMS),
};

/** 物联网行业工作台（industry-iot 装配：设备/告警/总览） */
const IOT_WORKBENCH: Workbench = {
  industry: "iot",
  home: "/",
  items: pickItems("iot", IOT_WORKBENCH_ITEMS),
};

/** 法律行业工作台（案件复用通用仓 /legal；计时来自 industry-legal） */
const LEGAL_WORKBENCH: Workbench = {
  industry: "legal",
  home: "/",
  items: [
    { key: "index", title: "工作台", icon: "📊", href: "/" },
    // 案件管理：复用通用仓 /legal（mobile 本地实现，后端契约 ADR-0036/0045 对齐）
    { key: "legal", title: "案件", icon: "⚖️", href: "/legal" },
    ...pickItems("legal", LEGAL_WORKBENCH_ITEMS).filter((it) => it.key !== "index"),
  ],
};

export const WORKBENCHES: Record<IndustryId, Workbench> = {
  generic: GENERIC_WORKBENCH,
  edu: EDU_WORKBENCH,
  legal: LEGAL_WORKBENCH,
  iot: IOT_WORKBENCH,
};

/**
 * 按行业 + 登录角色取工作台（过滤 role 白名单）.
 * 行业包可注入自定义工作台（替换 WORKBENCHES[id]）。
 */
export function getWorkbench(industry: IndustryId, roles: string[] = []): Workbench {
  const wb = WORKBENCHES[industry] ?? GENERIC_WORKBENCH;
  return {
    ...wb,
    items: wb.items.filter(
      (it) => !it.roles || it.roles.length === 0 || it.roles.some((r) => roles.includes(r)),
    ),
  };
}

/** 角色是否有权访问某菜单（供 RouteGuard 用） */
export function canAccess(item: WorkbenchItem, roles: string[]): boolean {
  return !item.roles || item.roles.length === 0 || item.roles.some((r) => roles.includes(r));
}
