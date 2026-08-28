/**
 * Mobile inventory service 单测（2026-09 上收 core-web 后测 ApiPort 传输 + 纯函数）.
 *
 * services/inventory.ts 为 core-web 薄 re-export，实现走 requestApi → 注入的 ApiPort。
 * 注入 portRequest spy，验证 URL path / body 透传（全路径带 /api 前缀）；
 * 库存预警判定 stockLevel 为 core-web 纯函数（业务规则单点）。
 */
import { configureCore } from "@lieshoucloud/core-web";

import {
  LOW_STOCK_THRESHOLD,
  MOVEMENT_META,
  createProduct,
  listProducts,
  stockIn,
  stockLevel,
  stockOut,
} from "./inventory";

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

describe("mobile inventory service（core-web 上收 · ApiPort 传输）", () => {
  it("listProducts 无参 → GET /api/products", async () => {
    portRequest.mockResolvedValue([]);
    await listProducts();
    expect(portRequest).toHaveBeenCalledWith("/api/products", undefined);
  });

  it("listProducts 带 keyword → query", async () => {
    portRequest.mockResolvedValue([]);
    await listProducts("布洛芬");
    expect(portRequest).toHaveBeenCalledWith(
      "/api/products?keyword=%E5%B8%83%E6%B4%9B%E8%8A%AC",
      undefined,
    );
  });

  it("createProduct → POST /api/products + body", async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await createProduct({ name: "布洛芬", price: 12.5 });
    expect(portRequest).toHaveBeenCalledWith("/api/products", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ name: "布洛芬", price: 12.5 }),
    });
  });

  it("stockIn → POST /api/products/{id}/stock-in + body", async () => {
    portRequest.mockResolvedValue({ id: 1, stockQuantity: 20 });
    await stockIn(1, { quantity: 5 });
    expect(portRequest).toHaveBeenCalledWith("/api/products/1/stock-in", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ quantity: 5 }),
    });
  });

  it("stockOut → POST /api/products/{id}/stock-out + body", async () => {
    portRequest.mockResolvedValue({ id: 1, stockQuantity: 15 });
    await stockOut(1, { quantity: 3 });
    expect(portRequest).toHaveBeenCalledWith("/api/products/1/stock-out", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ quantity: 3 }),
    });
  });

  it("MOVEMENT_META 文案（薄壳 re-export）", () => {
    expect(MOVEMENT_META.IN.text).toBe("入库");
  });
});

describe("stockLevel 库存预警纯函数（core-web 业务规则）", () => {
  it("缺货/低库存/正常 判定（默认阈值 5）", () => {
    expect(stockLevel(0)).toBe("OUT");
    expect(stockLevel(-2)).toBe("OUT");
    expect(stockLevel(3)).toBe("LOW");
    expect(stockLevel(LOW_STOCK_THRESHOLD)).toBe("LOW");
    expect(stockLevel(6)).toBe("OK");
  });

  it("阈值参数化（客户 Edition 可覆盖）", () => {
    expect(stockLevel(10, 10)).toBe("LOW");
    expect(stockLevel(11, 10)).toBe("OK");
  });
});
