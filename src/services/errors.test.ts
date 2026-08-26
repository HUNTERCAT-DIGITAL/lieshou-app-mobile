/**
 * Mobile 统一错误判断工具单测（Phase D）.
 * 基于 api-client 的 ApiError（status / code / message）。
 */
import { ApiError } from "@lieshoucloud/api-client";

import { getErrorMessage, isNetworkError, isNotFound, isServerError, isUnauthorized } from "./errors";

describe("mobile errors utils", () => {
  it("isNotFound 识别 404", () => {
    expect(isNotFound(new ApiError("not found", 404))).toBe(true);
    expect(isNotFound(new ApiError("server error", 500))).toBe(false);
    expect(isNotFound(new Error("plain"))).toBe(false);
  });

  it("isUnauthorized 识别 401", () => {
    expect(isUnauthorized(new ApiError("unauthorized", 401, "UNAUTHORIZED"))).toBe(true);
    expect(isUnauthorized(new ApiError("not found", 404))).toBe(false);
  });

  it("isNetworkError 识别无 status 的错误（网络层）", () => {
    expect(isNetworkError(new ApiError("network down"))).toBe(true);
    expect(isNetworkError(new ApiError("http 500", 500))).toBe(false);
  });

  it("isServerError 识别 5xx/4xx（非 401/404）", () => {
    expect(isServerError(new ApiError("bad", 400))).toBe(true);
    expect(isServerError(new ApiError("boom", 500))).toBe(true);
    expect(isServerError(new ApiError("nf", 404))).toBe(false);
    expect(isServerError(new ApiError("net"))).toBe(false);
  });

  it("getErrorMessage 网络错误给通用文案", () => {
    expect(getErrorMessage(new ApiError("fetch failed"))).toContain("网络");
  });

  it("getErrorMessage 后端 message 优先", () => {
    expect(getErrorMessage(new ApiError("库存不足", 400, "INSUFFICIENT_STOCK"))).toBe("库存不足");
  });

  it("getErrorMessage 未知错误兜底", () => {
    expect(getErrorMessage("whatever")).toBe("发生未知错误");
  });
});
