/**
 * Mobile auth service 单测（2026-09 上收 core-web 后测 ApiPort 传输）.
 *
 * services/auth.ts 为 core-web 薄 re-export，实现走 requestApi → 注入的 ApiPort。
 * 注入 portRequest spy，验证 URL path / body 透传（全路径带 /api 前缀）；
 * isApiError 来自 contract-api（统一错误类型）。
 */
import { configureCore } from "@lieshoucloud/core-web";
import { ApiError, isApiError } from "@lieshoucloud/contract-api";

import { fetchCurrentUser, login } from "./auth";

const portRequest = jest.fn();

beforeEach(() => {
  portRequest.mockReset();
  configureCore({
    storage: { get: () => null, set: () => {}, remove: () => {} },
    notifier: { success: () => {}, error: () => {} },
    navigation: { to: () => {}, replace: () => {} },
    api: { request: portRequest },
  });
});

const JSON_HEADERS = { "Content-Type": "application/json" };

describe("mobile auth service（core-web 上收 · ApiPort 传输）", () => {
  it("login → POST /api/auth/login + body（skipAuth401 透传，登录 401 不拦截）", async () => {
    portRequest.mockResolvedValue({ accessToken: "t", refreshToken: "r", expiresIn: 1800 });
    await login({ username: "admin", password: "admin123" });
    expect(portRequest).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ username: "admin", password: "admin123" }),
      skipAuth401: true,
    });
  });

  it("login 支持 tenantCode", async () => {
    portRequest.mockResolvedValue({ accessToken: "t" });
    await login({ username: "admin", password: "admin123", tenantCode: "huntercat" });
    expect(portRequest).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ username: "admin", password: "admin123", tenantCode: "huntercat" }),
      skipAuth401: true,
    });
  });

  it("fetchCurrentUser → GET /api/auth/me", async () => {
    portRequest.mockResolvedValue({ userId: 1, username: "admin", roles: ["USER"] });
    await expect(fetchCurrentUser()).resolves.toEqual({
      userId: 1,
      username: "admin",
      roles: ["USER"],
    });
    expect(portRequest).toHaveBeenCalledWith("/api/auth/me", undefined);
  });

  it("isApiError 来自 contract-api（instanceof ApiError）", () => {
    const apiErr = new ApiError("NOT_FOUND", "资源不存在", 404);
    expect(isApiError(apiErr)).toBe(true);
    expect(isApiError(new Error("plain"))).toBe(false);
    expect(isApiError("not an error")).toBe(false);
  });
});
