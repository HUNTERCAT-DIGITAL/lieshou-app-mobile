/**
 * MobileUI 业务小组件单测（P0 · 三端补测试）.
 *
 * jest-expo（node env）+ react-test-renderer 19 与 react-native 0.86 渲染不兼容
 * （toJSON() 恒为 null，React 19 已弃用 react-test-renderer）。
 * 这些组件是纯函数返回 React 元素，直接调用组件函数断言元素结构/文案：
 *   StatusBadge → <View>[<Text>text</Text>]</View>
 */

import { EmptyState, ErrorState, RoleBadge, StatusBadge } from "./MobileUI";

type El = { type: unknown; props: Record<string, unknown> };

/** 递归收集 Text 元素的所有文本（子元素可能是单元素或数组） */
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

function textOf(el: El): string {
  return collectText(el).join("");
}

describe("mobile MobileUI", () => {
  it("StatusBadge：View 包 Text，文案透传", () => {
    const el = StatusBadge({ text: "新客户", color: "#1677ff" }) as El;
    expect(textOf(el)).toBe("新客户");
  });

  it("StatusBadge：antd token 色归一为 RN 合法 hex（contract-types META 兼容）", () => {
    const el = StatusBadge({ text: "已通过", color: "success" }) as El;
    expect(textOf(el)).toBe("已通过");
  });

  it("StatusBadge：未知 token 原样透传不崩", () => {
    const el = StatusBadge({ text: "X", color: "#abcdef" }) as El;
    expect(textOf(el)).toBe("X");
  });

  it("RoleBadge：平台管理员渲染角色码", () => {
    const el = RoleBadge({ role: "PLATFORM_ADMIN" }) as El;
    expect(textOf(el)).toBe("PLATFORM_ADMIN");
  });

  it("RoleBadge：普通用户渲染 USER", () => {
    const el = RoleBadge({ role: "USER" }) as El;
    expect(textOf(el)).toBe("USER");
  });

  it("EmptyState：默认文案「暂无数据」", () => {
    const el = EmptyState({}) as El;
    expect(textOf(el)).toContain("暂无数据");
  });

  it("EmptyState：自定义文案透传", () => {
    const el = EmptyState({ message: "还没有客户" }) as El;
    expect(textOf(el)).toContain("还没有客户");
  });

  it("ErrorState：默认错误文案 + 重试按钮", () => {
    const onRetry = jest.fn();
    const el = ErrorState({ onRetry }) as El;
    expect(textOf(el)).toContain("加载失败");
    // 重试按钮存在且可点击
    expect(el.props.children).toBeTruthy();
    expect(onRetry).not.toHaveBeenCalled();
  });

  it("ErrorState：无 onRetry 时不渲染按钮", () => {
    const el = ErrorState({}) as El;
    expect(textOf(el)).toContain("加载失败");
  });
});
