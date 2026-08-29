/**
 * Mobile customer service 单测（P0 · 2026-09 上收 core-web 后测 ApiPort 传输）.
 *
 * services/customer.ts 为 core-web 薄 re-export，实现走 requestApi → 注入的 ApiPort。
 * 注入 portRequest spy，验证 URL path / query 透传（全路径带 /api 前缀）。
 */
import { configureCore } from "@lieshoucloud/core-web";

import { STATUS_META, countCustomers, getCustomer, listCustomers } from "./customer";

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

describe("mobile customer service（core-web 上收 · ApiPort 传输）", () => {
  it("listCustomers 无参数 → GET /api/customers", async () => {
    portRequest.mockResolvedValue([]);
    await listCustomers();
    expect(portRequest).toHaveBeenCalledWith("/api/customers", undefined);
  });

  it("listCustomers 带 keyword + status → query 透传", async () => {
    portRequest.mockResolvedValue([]);
    await listCustomers("张", "FOLLOWING");
    expect(portRequest).toHaveBeenCalledWith(
      "/api/customers?keyword=%E5%BC%A0&status=FOLLOWING",
      undefined,
    );
  });

  it("countCustomers → GET /api/customers/count", async () => {
    portRequest.mockResolvedValue(12);
    await expect(countCustomers()).resolves.toBe(12);
    expect(portRequest).toHaveBeenCalledWith("/api/customers/count", undefined);
  });

  it("getCustomer → GET /api/customers/{id}", async () => {
    portRequest.mockResolvedValue({ id: 7 });
    await getCustomer(7);
    expect(portRequest).toHaveBeenCalledWith("/api/customers/7", undefined);
  });

  it("STATUS_META 来自 contract-types（薄壳 re-export）", () => {
    expect(STATUS_META.NEW.text).toBe("新客户");
  });
});
