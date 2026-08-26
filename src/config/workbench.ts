/**
 * 工作台配置（端壳模板 · 角色工作台框架）.
 *
 * 每个行业（generic/edu/legal/iot）× 登录角色 → 一组菜单/首页。
 * 主布局 (main)/_layout.tsx 从本配置渲染导航，行业 app 在各自装配中
 * 扩展对应行业的 items（行业包可替换 WORKBENCHES[industry]）。
 *
 * 角色值对齐后端（admin/auth/user 服务）：
 *   PLATFORM_ADMIN / TENANT_ADMIN / DUTY_OFFICER / 行业角色（EDU_* / LEGAL_* / IOT_* 预留）。
 * item.roles 缺省 = 全部登录用户可见。
 */
import type { IndustryId } from "./industry";

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

/** 行业工作台：行业 app 装配点（edu/legal/iot 由行业包扩展，先继承通用） */
const EDU_WORKBENCH: Workbench = {
  industry: "edu",
  home: "/",
  items: [
    { key: "index", title: "工作台", icon: "📊", href: "/" },
    // 学生/家长/老师三角色工作台：行业包装配（edu-mobile）时扩展
  ],
};

const LEGAL_WORKBENCH: Workbench = {
  industry: "legal",
  home: "/",
  items: [
    { key: "index", title: "工作台", icon: "📊", href: "/" },
    { key: "legal", title: "案件", icon: "⚖️", href: "/legal" },
    // 律师/助理：行业包装配（legal-mobile）时扩展（日程/时间记录等）
  ],
};

const IOT_WORKBENCH: Workbench = {
  industry: "iot",
  home: "/",
  items: [
    { key: "index", title: "工作台", icon: "📊", href: "/" },
    // 运维值班/客户看板：行业包装配（iot-mobile）时扩展（设备/告警/遥测）
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
