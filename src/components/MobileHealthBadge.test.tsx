/**
 * MobileHealthBadge 单测.
 * jest-expo + react-test-renderer 19 渲染不兼容（toJSON 恒 null），
 * 直接调用组件函数断言元素树（对齐 MobileUI.test 风格）。
 */
import type { ReactNode } from "react";

import { MobileHealthBadge } from "./MobileHealthBadge";

type El = { type: unknown; props: Record<string, unknown> };

/** 递归收集所有文本节点 */
function collectText(el: El | null | undefined, out: string[] = []): string[] {
  if (!el || typeof el !== "object") {
    if (el !== null) out.push(String(el));
    return out;
  }
  const children = (el as El).props?.children as unknown;
  if (Array.isArray(children)) {
    children.forEach((c) => collectText(c as El, out));
  } else if (typeof children === "string" || typeof children === "number") {
    out.push(String(children));
  } else if (children && typeof children === "object") {
    collectText(children as El, out);
  }
  return out;
}

function render(status: "up" | "down" | "degraded", serviceName?: string): string[] {
  const el = MobileHealthBadge({ status, serviceName }) as El;
  return collectText(el);
}

describe("MobileHealthBadge", () => {
  it("up 状态显示 UP", () => {
    const texts = render("up");
    expect(texts.join(" ")).toContain("UP");
  });

  it("down 状态显示 DOWN", () => {
    const texts = render("down");
    expect(texts.join(" ")).toContain("DOWN");
  });

  it("degraded 状态显示 DEGRADED", () => {
    const texts = render("degraded");
    expect(texts.join(" ")).toContain("DEGRADED");
  });

  it("带 serviceName 时前缀展示", () => {
    const texts = render("up", "gateway");
    expect(texts.join(" ")).toContain("gateway");
  });

  it("返回 React 元素（非空）", () => {
    const el = MobileHealthBadge({ status: "up" }) as ReactNode;
    expect(el).not.toBeNull();
  });
});
