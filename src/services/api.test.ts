/**
 * Mobile api 服务单测（baseUrl 配置 + gateway 健康检查降级）.
 */
import * as apiClient from "@lieshoucloud/api-client";

import { configureApiBaseUrl, fetchGatewayHealth, MOBILE_API_BASE } from "./api";

describe("mobile api", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("fetchGatewayHealth 正常 → 返回 status", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ status: "up" }),
    }) as never;
    await expect(fetchGatewayHealth()).resolves.toBe("up");
  });

  it("fetchGatewayHealth 网络异常 → 降级 down", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network down")) as never;
    await expect(fetchGatewayHealth()).resolves.toBe("down");
  });

  it("configureApiBaseUrl 在 native 端设置公网 baseUrl", () => {
    const setBaseUrl = jest.spyOn(apiClient, "setBaseUrl");
    configureApiBaseUrl();
    // jest-expo 默认 Platform.OS 非 web → 应设置公网域名
    expect(setBaseUrl).toHaveBeenCalledWith(MOBILE_API_BASE);
  });

  it("MOBILE_API_BASE 为公网域名", () => {
    expect(MOBILE_API_BASE).toBe("https://expo.lieshoucloud.huntercat.cn");
  });
});
