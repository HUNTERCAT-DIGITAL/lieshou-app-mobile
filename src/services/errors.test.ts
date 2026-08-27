/**
 * Mobile 统一错误判断工具单测（Phase D）.
 * 基于 api-client 的 ApiError（code / message / status；网络错误 status=0）。
 */
import { ApiError } from "@lieshoucloud/contract-api";

import { getErrorMessage, isNetworkError, isNotFound, isServerError, isUnauthorized } from "./errors";

describe("mobile errors utils", () => {
  it("isNotFound 识别 404", () => {
    expect(isNotFound(new ApiError("NOT_FOUND", "not found", 404))).toBe(true);
    expect(isNotFound(new ApiError("SERVER_ERROR", "server error", 500))).toBe(false);
    expect(isNotFound(new Error("plain"))).toBe(false);
  });

  it("isUnauthorized 识别 401", () => {
    expect(isUnauthorized(new ApiError("UNAUTHORIZED", "unauthorized", 401))).toBe(true);
    expect(isUnauthorized(new ApiError("NOT_FOUND", "not found", 404))).toBe(false);
  });

  it("isNetworkError 识别 status=0（网络层）", () => {
    expect(isNetworkError(new ApiError("NETWORK_ERROR", "network down", 0))).toBe(true);
    expect(isNetworkError(new ApiError("SERVER_ERROR", "http 500", 500))).toBe(false);
  });

  it("isServerError 识别 5xx/4xx（非 401/404，不含网络错误）", () => {
    expect(isServerError(new ApiError("BAD_REQUEST", "bad", 400))).toBe(true);
    expect(isServerError(new ApiError("SERVER_ERROR", "boom", 500))).toBe(true);
    expect(isServerError(new ApiError("NOT_FOUND", "nf", 404))).toBe(false);
    expect(isServerError(new ApiError("NETWORK_ERROR", "net", 0))).toBe(false);
  });

  it("getErrorMessage 网络错误给通用文案", () => {
    expect(getErrorMessage(new ApiError("NETWORK_ERROR", "fetch failed", 0))).toContain("网络");
  });

  it("getErrorMessage 后端 message 优先", () => {
    expect(getErrorMessage(new ApiError("INSUFFICIENT_STOCK", "库存不足", 400))).toBe("库存不足");
  });

  it("getErrorMessage 未知错误兜底", () => {
    expect(getErrorMessage("whatever")).toBe("发生未知错误");
  });
});
