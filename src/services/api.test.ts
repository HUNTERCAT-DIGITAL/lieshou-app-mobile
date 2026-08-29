/**
 * Mobile api 服务单测（baseUrl 配置 + gateway 健康检查降级）.
 */
import * as apiClient from "@lieshoucloud/contract-api";
import { Platform } from "react-native";

import {
  apiBaseUrl,
  configureApiBaseUrl,
  fetchGatewayHealth,
  MOBILE_API_BASE,
} from "./api";

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

  it("MOBILE_API_BASE 为公网域名（注入优先，缺省 dev 域名）", () => {
    expect(MOBILE_API_BASE).toMatch(/^https?:\/\//);
  });

  it("apiBaseUrl web 端同源相对路径（nginx 反代 /api，避免跨域）", () => {
    jest.replaceProperty(Platform, "OS", "web");
    expect(apiBaseUrl()).toBe("");
  });

  it("apiBaseUrl native 端公网域名", () => {
    jest.replaceProperty(Platform, "OS", "ios");
    expect(apiBaseUrl()).toBe(MOBILE_API_BASE);
  });
});
