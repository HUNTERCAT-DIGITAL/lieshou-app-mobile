/**
 * Mobile approval service 单测（ADR-0032 · 多端接入）.
 * 同 business.test：用 jest.spyOn 命名空间（moduleNameMapper 下 jest.mock 不生效）。
 */

import * as apiClient from "@lieshoucloud/contract-api";

import {
  APPROVAL_STATUS_META,
  APPROVAL_TYPE_META,
  approveApproval,
  cancelApproval,
  createApproval,
  getApprovalCounts,
  listApprovals,
  rejectApproval,
} from "./approval";

const mockRequest = jest.spyOn(apiClient, "request");

beforeEach(() => {
  mockRequest.mockReset();
  mockRequest.mockResolvedValue(undefined as never);
});

describe("mobile approval service", () => {
  it("listApprovals 无参数 → GET /approvals", async () => {
    mockRequest.mockResolvedValue([]);
    await listApprovals();
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/api/approvals", query: {} });
  });

  it("listApprovals 带 role/status/type → query", async () => {
    mockRequest.mockResolvedValue([]);
    await listApprovals({ role: "inbox", status: "PENDING", type: "EXPENSE" });
    expect(mockRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/api/approvals",
      query: { role: "inbox", status: "PENDING", type: "EXPENSE" },
    });
  });

  it("getApprovalCounts → GET /approvals/counts", async () => {
    mockRequest.mockResolvedValue({ inbox: 3, mine: 1 });
    await expect(getApprovalCounts()).resolves.toEqual({ inbox: 3, mine: 1 });
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/api/approvals/counts" });
  });

  it("createApproval body 透传", async () => {
    mockRequest.mockResolvedValue({ id: 1 });
    await createApproval({ type: "PURCHASE", title: "采购原料", approverId: 10 });
    expect(mockRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/api/approvals",
      body: { type: "PURCHASE", title: "采购原料", approverId: 10 },
    });
  });

  it("approveApproval → POST /approvals/{id}/approve（空 body）", async () => {
    mockRequest.mockResolvedValue({ id: 1, status: "APPROVED" });
    await approveApproval(1);
    expect(mockRequest).toHaveBeenCalledWith({ method: "POST", path: "/api/approvals/1/approve", body: {} });
  });

  it("rejectApproval → POST /approvals/{id}/reject（comment 必填）", async () => {
    mockRequest.mockResolvedValue({ id: 1 });
    await rejectApproval(1, "金额超预算");
    expect(mockRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/api/approvals/1/reject",
      body: { comment: "金额超预算" },
    });
  });

  it("cancelApproval → POST /approvals/{id}/cancel", async () => {
    mockRequest.mockResolvedValue({ id: 1 });
    await cancelApproval(1);
    expect(mockRequest).toHaveBeenCalledWith({ method: "POST", path: "/api/approvals/1/cancel", body: {} });
  });

  it("类型/状态元数据", () => {
    expect(APPROVAL_TYPE_META.SALE.text).toBe("销售出库");
    expect(APPROVAL_STATUS_META.REJECTED.text).toBe("已驳回");
  });
});
