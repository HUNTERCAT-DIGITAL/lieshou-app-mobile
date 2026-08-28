/**
 * Mobile finance service 单测（2026-09 上收 core-web 后测 ApiPort 传输）.
 *
 * services/finance.ts 为 core-web 薄 re-export，实现走 requestApi → 注入的 ApiPort。
 * 注入 portRequest spy，验证 URL path / body 透传（全路径带 /api 前缀）。
 */
import { configureCore } from "@lieshoucloud/core-web";

import {
  LEDGER_CATEGORIES,
  LEDGER_TYPE_META,
  createLedger,
  getLedgerSummary,
  listLedger,
} from "./finance";

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

describe("mobile finance service（core-web 上收 · ApiPort 传输）", () => {
  it("listLedger 无参 → GET /api/ledger", async () => {
    portRequest.mockResolvedValue([]);
    await listLedger();
    expect(portRequest).toHaveBeenCalledWith("/api/ledger", undefined);
  });

  it("getLedgerSummary → GET /api/ledger/summary", async () => {
    portRequest.mockResolvedValue({ income: 1, expense: 2, balance: -1, count: 1 });
    await expect(getLedgerSummary()).resolves.toMatchObject({ balance: -1 });
    expect(portRequest).toHaveBeenCalledWith("/api/ledger/summary", undefined);
  });

  it("getLedgerSummary 带 from/to → query", async () => {
    portRequest.mockResolvedValue({ income: 0, expense: 0, balance: 0, count: 0 });
    await getLedgerSummary({ from: "2026-08-01", to: "2026-08-31" });
    expect(portRequest).toHaveBeenCalledWith(
      "/api/ledger/summary?from=2026-08-01&to=2026-08-31",
      undefined,
    );
  });

  it("createLedger → POST /api/ledger + body", async () => {
    portRequest.mockResolvedValue({ id: 2 });
    await createLedger({ type: "EXPENSE", amount: 88, category: "房租", occurredAt: "2026-08-01" });
    expect(portRequest).toHaveBeenCalledWith("/api/ledger", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ type: "EXPENSE", amount: 88, category: "房租", occurredAt: "2026-08-01" }),
    });
  });

  it("META 常量来自 contract-types（薄壳 re-export）", () => {
    expect(LEDGER_TYPE_META.EXPENSE.text).toBe("支出");
    expect(LEDGER_CATEGORIES).toContain("销售收入");
  });
});
