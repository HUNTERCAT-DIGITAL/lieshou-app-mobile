/**
 * Mobile theme 数据完整性测试（colors.ts 是设计 token 唯一来源）.
 * 防止主题色被意外改动/删除导致多端不一致。
 */
import { colors } from "./colors";

describe("mobile theme colors", () => {
  it("主色与 admin 对齐（antd 主蓝 #1677ff）", () => {
    expect(colors.primary).toBe("#1677ff");
  });

  it("关键语义色存在", () => {
    expect(typeof colors.text).toBe("string");
    expect(typeof colors.textSecondary).toBe("string");
    expect(typeof colors.bg).toBe("string");
    expect(typeof colors.success).toBe("string");
  });

  it("无空值 token", () => {
    for (const v of Object.values(colors)) {
      expect(v).toBeTruthy();
    }
  });
});
