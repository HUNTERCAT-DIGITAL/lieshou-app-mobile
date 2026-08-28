/**
 * Mobile users service 单测（2026-09 上收 core-web 后测 ApiPort 传输 + 纯函数）.
 *
 * services/users.ts 为 core-web 薄 re-export：listUsers 走 requestApi → 注入的 ApiPort；
 * userDisplayName 为 core-web 纯函数（自 mobile 上收，审批流选人展示名统一）。
 */
import { configureCore } from "@lieshoucloud/core-web";

import { listUsers, userDisplayName, type User } from "./users";

const portRequest = jest.fn();

/** 构造完整 User（避免测试对象缺必填字段） */
const u = (over: Partial<User> = {}): User => ({
  id: 1,
  tenantId: 1,
  username: "u",
  displayName: "",
  status: "ACTIVE",
  roles: [],
  createdAt: "2026-01-01T00:00:00Z",
  ...over,
});

beforeEach(() => {
  portRequest.mockReset();
  configureCore({
    storage: { get: () => null, set: () => {}, remove: () => {} },
    notifier: { success: () => {}, error: () => {} },
    navigation: { to: () => {}, replace: () => {} },
    api: { request: portRequest },
  });
});

describe("mobile users service（core-web 上收 · ApiPort 传输）", () => {
  it("listUsers → GET /api/users", async () => {
    portRequest.mockResolvedValue([u({ id: 1, username: "admin" })]);
    await expect(listUsers()).resolves.toEqual([u({ id: 1, username: "admin" })]);
    expect(portRequest).toHaveBeenCalledWith("/api/users", undefined);
  });
});

describe("userDisplayName（core-web 纯函数 · 展示名优先 displayName）", () => {
  it("displayName 非空 → 优先展示", () => {
    expect(userDisplayName(u({ username: "admin", displayName: "平台管理员" }))).toBe("平台管理员");
  });

  it("displayName 空串 → 回落 username", () => {
    expect(userDisplayName(u({ username: "sales", displayName: "" }))).toBe("sales");
  });
});
