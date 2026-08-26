/**
 * Mobile users service 单测（审批流选审批人）.
 * 同 approval.test：jest.spyOn 命名空间（moduleNameMapper 下 jest.mock 不生效）。
 */
import * as apiClient from "@lieshoucloud/api-client";

import { listUsers, userDisplayName } from "./users";

const mockRequest = jest.spyOn(apiClient, "request");

beforeEach(() => {
  mockRequest.mockReset();
  mockRequest.mockResolvedValue(undefined as never);
});

describe("mobile users service", () => {
  it("listUsers → GET /users", async () => {
    mockRequest.mockResolvedValue([{ id: 1, username: "admin" }]);
    await expect(listUsers()).resolves.toEqual([{ id: 1, username: "admin" }]);
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/users" });
  });

  it("userDisplayName 优先 displayName", () => {
    expect(userDisplayName({ id: 1, username: "admin", displayName: "平台管理员" })).toBe("平台管理员");
  });

  it("userDisplayName 无 displayName 时回落 username", () => {
    expect(userDisplayName({ id: 2, username: "sales" })).toBe("sales");
  });
});
