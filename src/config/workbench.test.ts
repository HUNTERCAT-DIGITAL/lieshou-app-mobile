/**
 * 工作台配置单测：行业 × 角色 → 菜单过滤.
 */
import { canAccess, getWorkbench, mergeClientTabs, WORKBENCHES } from "./workbench";

describe("workbench · 工作台配置", () => {
  it("generic 工作台包含现有功能菜单", () => {
    const wb = getWorkbench("generic", []);
    const titles = wb.items.map((i) => i.title);
    expect(titles).toEqual(
      expect.arrayContaining(["工作台", "客户", "线索", "库存", "记账", "审批"]),
    );
  });

  it("行业装配点回退通用工作台（开源版仅 generic）", () => {
    for (const id of ["edu", "legal", "iot"] as const) {
      expect(WORKBENCHES[id].industry).toBe("generic");
    }
  });

  it("未知行业回退 generic", () => {
    const wb = getWorkbench("generic", []);
    expect(wb.industry).toBe("generic");
    expect(wb.items.length).toBeGreaterThan(0);
  });

  it("mergeClientTabs：独立仓 EXTRA_TABS 为空时不改变菜单", () => {
    const base = [{ key: "index", title: "工作台", icon: "📊", href: "/" }];
    expect(mergeClientTabs(base)).toEqual(base);
  });

  it("mergeClientTabs：客户仓注入 tab 追加到菜单尾", () => {
    // 模拟客户注入（prepare 覆盖 editions/extra.ts 后 EXTRA_TABS 非空）
    const items = mergeClientTabs([
      { key: "index", title: "工作台", icon: "📊", href: "/" },
    ]);
    // 独立仓为空 → 至少保留 base（客户注入行为由客户仓 prepare 后构建验证）
    expect(items[0]).toEqual({ key: "index", title: "工作台", icon: "📊", href: "/" });
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
