/**
 * Mobile auth service 单测（login / fetchCurrentUser / isApiError）.
 */
import * as apiClient from "@lieshoucloud/contract-api";

import { fetchCurrentUser, isApiError, login } from "./auth";

const mockRequest = jest.spyOn(apiClient, "request");

beforeEach(() => {
  mockRequest.mockReset();
  mockRequest.mockResolvedValue(undefined as never);
});

describe("mobile auth service", () => {
  it("login → POST /auth/login（body 透传）", async () => {
    mockRequest.mockResolvedValue({ accessToken: "t", refreshToken: "r", expiresIn: 1800 } as never);
    await login({ username: "admin", password: "admin123" });
    expect(mockRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/api/auth/login",
      body: { username: "admin", password: "admin123" },
    });
  });

  it("login 支持 tenantCode", async () => {
    mockRequest.mockResolvedValue({ accessToken: "t" } as never);
    await login({ username: "admin", password: "admin123", tenantCode: "huntercat" });
    expect(mockRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/api/auth/login",
      body: { username: "admin", password: "admin123", tenantCode: "huntercat" },
    });
  });

  it("fetchCurrentUser → GET /auth/me", async () => {
    mockRequest.mockResolvedValue({ userId: 1, username: "admin", roles: ["USER"] } as never);
    await expect(fetchCurrentUser()).resolves.toEqual({
      userId: 1,
      username: "admin",
      roles: ["USER"],
    });
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/api/auth/me" });
  });

  it("isApiError 识别带 status 的 Error", () => {
    const withStatus = Object.assign(new Error("404"), { status: 404 });
    expect(isApiError(withStatus)).toBe(true);
    expect(isApiError(new Error("plain"))).toBe(false);
    expect(isApiError("not an error")).toBe(false);
  });
});
