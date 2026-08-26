/**
 * Mobile customer service 单测（P0 · 三端补测试）.
 *
 * mobile 的 request 用 query 对象形式（不同于 desktop 的字符串拼 query）。
 * 注意：不能 jest.mock("@lieshoucloud/api-client")——moduleNameMapper 把该
 * 包映射到 packages/api-client/src（jest.mock 按原 specifier 注册不匹配）。
 * 改用 jest.spyOn 命名空间对象（babel CJS 编译后是 _apiClient.request 属性访问）。
 */

import * as apiClient from "@lieshoucloud/api-client";

import { STATUS_META, countCustomers, getCustomer, listCustomers } from "./customer";

const mockRequest = jest.spyOn(apiClient, "request");

beforeEach(() => {
  mockRequest.mockReset();
  mockRequest.mockResolvedValue(undefined as never);
});

describe("mobile customer service", () => {
  it("listCustomers 无参数 → GET /customers（query 空对象）", async () => {
    mockRequest.mockResolvedValue([]);
    await listCustomers();
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/customers", query: {} });
  });

  it("listCustomers 带 keyword + status → query 对象", async () => {
    mockRequest.mockResolvedValue([]);
    await listCustomers("张", "FOLLOWING");
    expect(mockRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/customers",
      query: { keyword: "张", status: "FOLLOWING" },
    });
  });

  it("countCustomers → GET /customers/count", async () => {
    mockRequest.mockResolvedValue(12);
    await expect(countCustomers()).resolves.toBe(12);
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/customers/count" });
  });

  it("getCustomer 动态 id", async () => {
    mockRequest.mockResolvedValue({ id: 5 });
    await getCustomer(5);
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/customers/5" });
  });

  it("STATUS_META 四状态齐全", () => {
    expect(Object.keys(STATUS_META)).toEqual(["NEW", "FOLLOWING", "CONVERTED", "LOST"]);
    expect(STATUS_META.LOST.text).toBe("已流失");
  });
});
