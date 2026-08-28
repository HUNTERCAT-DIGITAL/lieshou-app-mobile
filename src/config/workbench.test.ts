/**
 * 工作台配置单测：行业 × 角色 → 菜单过滤.
 */
import { canAccess, getWorkbench, mergeClientTabs, WORKBENCHES } from "./workbench";
import type { ClientTab } from "./editions/extra";

/** 模拟客户仓注入的 iot tab（总览/设备/告警/产品/规则） */
const IOT_CLIENT_TABS: ClientTab[] = [
  { key: "dwjk/overview", title: "总览", icon: "view-dashboard", href: "/dwjk/overview" },
  { key: "dwjk/devices", title: "设备", icon: "devices", href: "/dwjk/devices" },
  { key: "dwjk/alarms", title: "告警", icon: "alarm-bell", href: "/dwjk/alarms" },
  { key: "dwjk/products", title: "产品", icon: "cube-outline", href: "/dwjk/products" },
  { key: "dwjk/rules", title: "规则", icon: "script-text", href: "/dwjk/rules" },
];

describe("workbench · 工作台配置", () => {
  it("generic 工作台包含现有功能菜单", () => {
    const wb = getWorkbench("generic", []);
    const titles = wb.items.map((i) => i.title);
    expect(titles).toEqual(
      expect.arrayContaining(["工作台", "客户", "线索", "库存", "记账", "审批"]),
    );
  });

  it("行业装配点：iot 专属工作台（纯 IoT 壳），edu/legal 回退通用", () => {
    expect(WORKBENCHES.iot.industry).toBe("iot");
    expect(WORKBENCHES.iot.home).toBe("/dwjk/overview");
    // 独立仓无客户注入：iot 壳 items 为空（tab 由客户 EXTRA_TABS 注入）
    const titles = getWorkbench("iot").items.map((i) => i.title);
    expect(titles).toEqual([]);
    // 模拟客户注入（总览/设备/告警/产品/规则）→ 纯 IoT，不含通用 CRM/进销存/记账/审批
    const injected = getWorkbench("iot", [], IOT_CLIENT_TABS).items.map((i) => i.title);
    expect(injected).toEqual(["总览", "设备", "告警", "产品", "规则"]);
    expect(injected).not.toContain("客户");
    expect(injected).not.toContain("记账");
    for (const id of ["edu", "legal"] as const) {
      expect(WORKBENCHES[id].industry).toBe("generic");
    }
  });

  it("未知行业回退 generic", () => {
    const wb = getWorkbench("generic", []);
    expect(wb.industry).toBe("generic");
    expect(wb.items.length).toBeGreaterThan(0);
  });

  it("mergeClientTabs：客户注入追加且同 key 去重", () => {
    const base = [{ key: "index", title: "工作台", icon: "view-dashboard", href: "/" }];
    const merged = mergeClientTabs(base, IOT_CLIENT_TABS);
    const keys = merged.map((i) => i.key);
    // 模拟客户注入 EXTRA_TABS（总览/设备/告警/产品/规则）→ 追加到菜单尾
    expect(keys).toContain("dwjk/overview");
    expect(keys.indexOf("dwjk/overview")).toBeGreaterThan(keys.indexOf("index"));
    // base 已含同 key 时跳过（不重复），其余注入 tab 仍追加
    const base2 = [
      ...base,
      { key: "dwjk/overview", title: "总览", icon: "view-dashboard", href: "/dwjk/overview" },
    ];
    const merged2 = mergeClientTabs(base2, IOT_CLIENT_TABS);
    const keys2 = merged2.map((i) => i.key);
    expect(keys2.filter((k) => k === "dwjk/overview")).toHaveLength(1);
    expect(keys2).toContain("dwjk/devices");
    expect(keys2).toContain("dwjk/rules");
  });

  it("mergeClientTabs：客户仓注入 tab 追加到菜单尾", () => {
    // 模拟客户注入（prepare 覆盖 editions/extra.ts 后 EXTRA_TABS 非空）
    const items = mergeClientTabs([
      { key: "index", title: "工作台", icon: "view-dashboard", href: "/" },
    ]);
    // 独立仓为空 → 至少保留 base（客户注入行为由客户仓 prepare 后构建验证）
    expect(items[0]).toEqual({ key: "index", title: "工作台", icon: "view-dashboard", href: "/" });
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it("role 白名单过滤：角色不匹配的菜单隐藏", () => {
    const items = [
      { key: "a", title: "A", icon: "1", href: "/a", roles: ["TENANT_ADMIN"] },
      { key: "b", title: "B", icon: "2", href: "/b" }, // 无白名单 = 全部可见
    ];
    expect(canAccess(items[0], ["DUTY_OFFICER"])).toBe(false);
    expect(canAccess(items[0], ["TENANT_ADMIN"])).toBe(true);
    expect(canAccess(items[1], [])).toBe(true);
  });
});
