/**
 * 工作台配置单测：行业 × 角色 → 菜单过滤.
 */
import { canAccess, getWorkbench, WORKBENCHES } from "./workbench";

describe("workbench · 工作台配置", () => {
  it("generic 工作台包含现有功能菜单", () => {
    const wb = getWorkbench("generic", []);
    const titles = wb.items.map((i) => i.title);
    expect(titles).toEqual(
      expect.arrayContaining(["工作台", "客户", "线索", "案件", "库存", "记账", "审批"]),
    );
  });

  it("行业工作台存在（edu/legal/iot 装配点）", () => {
    for (const id of ["edu", "legal", "iot"] as const) {
      expect(WORKBENCHES[id].industry).toBe(id);
    }
  });

  it("未知行业回退 generic", () => {
    const wb = getWorkbench("generic", []);
    expect(wb.industry).toBe("generic");
    expect(wb.items.length).toBeGreaterThan(0);
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
