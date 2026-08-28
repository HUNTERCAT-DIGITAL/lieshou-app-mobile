/**
 * Mobile approval service 单测（ADR-0032 · 2026-09 上收 core-web 后测 ApiPort 传输）.
 *
 * services/approval.ts 为 core-web 薄 re-export，实现走 requestApi → 注入的 ApiPort。
 * 注入 portRequest spy，验证 URL path / body 透传（全路径带 /api 前缀）。
 */
import { configureCore } from "@lieshoucloud/core-web";

import {
  APPROVAL_STATUS_META,
  APPROVAL_TYPE_META,
  approveApproval,
  cancelApproval,
  createApproval,
  getApproval,
  getApprovalCounts,
  listApprovals,
  rejectApproval,
} from "./approval";

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

describe("mobile approval service（core-web 上收 · ApiPort 传输）", () => {
  it("listApprovals 无参数 → GET /api/approvals", async () => {
    portRequest.mockResolvedValue([]);
    await listApprovals();
    expect(portRequest).toHaveBeenCalledWith("/api/approvals", undefined);
  });

  it("listApprovals 带 role/status/type → query", async () => {
    portRequest.mockResolvedValue([]);
    await listApprovals({ role: "inbox", status: "PENDING", type: "EXPENSE" });
    expect(portRequest).toHaveBeenCalledWith(
      "/api/approvals?role=inbox&status=PENDING&type=EXPENSE",
      undefined,
    );
  });

  it("getApprovalCounts → GET /api/approvals/counts", async () => {
    portRequest.mockResolvedValue({ inbox: 1, mine: 2 });
    await expect(getApprovalCounts()).resolves.toEqual({ inbox: 1, mine: 2 });
    expect(portRequest).toHaveBeenCalledWith("/api/approvals/counts", undefined);
  });

  it("getApproval → GET /api/approvals/{id}", async () => {
    portRequest.mockResolvedValue({ id: 7 });
    await getApproval(7);
    expect(portRequest).toHaveBeenCalledWith("/api/approvals/7", undefined);
  });

  it("createApproval → POST /api/approvals + body", async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await createApproval({ type: "EXPENSE", title: "差旅报销", amount: 100, approverId: 3 });
    expect(portRequest).toHaveBeenCalledWith("/api/approvals", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ type: "EXPENSE", title: "差旅报销", amount: 100, approverId: 3 }),
    });
  });

  it("approveApproval → POST /api/approvals/{id}/approve（空 body 兜底）", async () => {
    portRequest.mockResolvedValue({ id: 1, status: "APPROVED" });
    await approveApproval(1);
    expect(portRequest).toHaveBeenCalledWith("/api/approvals/1/approve", {
      method: "POST",
      headers: JSON_HEADERS,
      body: "{}",
    });
  });

  it("rejectApproval → POST /api/approvals/{id}/reject（comment 必填）", async () => {
    portRequest.mockResolvedValue({ id: 1, status: "REJECTED" });
    await rejectApproval(1, "信息不全");
    expect(portRequest).toHaveBeenCalledWith("/api/approvals/1/reject", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ comment: "信息不全" }),
    });
  });

  it("cancelApproval → POST /api/approvals/{id}/cancel（无 comment 空 body）", async () => {
    portRequest.mockResolvedValue({ id: 1, status: "CANCELLED" });
    await cancelApproval(1);
    expect(portRequest).toHaveBeenCalledWith("/api/approvals/1/cancel", {
      method: "POST",
      headers: JSON_HEADERS,
      body: "{}",
    });
  });

  it("META 常量来自 contract-types（薄壳 re-export）", () => {
    expect(APPROVAL_STATUS_META.REJECTED.text).toBe("已驳回");
    expect(APPROVAL_TYPE_META.SALE.text).toBe("销售出库");
  });
});
