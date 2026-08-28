/**
 * Mobile finance + inventory service 单测（P0 · 三端补测试）.
 * 同 customer.test：用 jest.spyOn 命名空间（moduleNameMapper 下 jest.mock 不生效）。
 */

import * as apiClient from "@lieshoucloud/contract-api";

import { LEDGER_CATEGORIES, createLedger, getSummary, listLedger } from "./finance";
import { MOVEMENT_META, listProducts, stockIn, stockOut } from "./inventory";

const mockRequest = jest.spyOn(apiClient, "request");

beforeEach(() => {
  mockRequest.mockReset();
  mockRequest.mockResolvedValue(undefined as never);
});

describe("mobile finance service", () => {
  it("listLedger → GET /ledger", async () => {
    mockRequest.mockResolvedValue([]);
    await listLedger();
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/api/ledger" });
  });

  it("getSummary → GET /ledger/summary", async () => {
    mockRequest.mockResolvedValue({ income: 1, expense: 2, balance: -1, count: 1 });
    await expect(getSummary()).resolves.toMatchObject({ balance: -1 });
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/api/ledger/summary" });
  });

  it("createLedger → POST /ledger + body 透传", async () => {
    mockRequest.mockResolvedValue({ id: 2 });
    const body = { type: "EXPENSE" as const, amount: 88, category: "房租", occurredAt: "2026-08-01" };
    await createLedger(body);
    expect(mockRequest).toHaveBeenCalledWith({ method: "POST", path: "/api/ledger", body });
  });

  it("分类元数据", () => {
    expect(LEDGER_CATEGORIES).toContain("销售收入");
  });
});

describe("mobile inventory service", () => {
  it("listProducts 带 keyword → query 对象", async () => {
    mockRequest.mockResolvedValue([]);
    await listProducts("布洛芬");
    expect(mockRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/api/products",
      query: { keyword: "布洛芬" },
    });
  });

  it("stockIn → POST /products/{id}/stock-in", async () => {
    mockRequest.mockResolvedValue({ id: 1, stockQuantity: 20 });
    await stockIn(1, 5, "补货");
    expect(mockRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/api/products/1/stock-in",
      body: { quantity: 5, remark: "补货" },
    });
  });

  it("stockOut → POST /products/{id}/stock-out", async () => {
    mockRequest.mockResolvedValue({ id: 1, stockQuantity: 15 });
    await stockOut(1, 3);
    expect(mockRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/api/products/1/stock-out",
      body: { quantity: 3, remark: undefined },
    });
  });

  it("MOVEMENT_META 文案", () => {
    expect(MOVEMENT_META.IN.text).toBe("入库");
  });
});
