/**
 * Mobile lead service 单测（Phase B · 线索/公海/跟进）.
 * 同 approval.test：jest.spyOn 命名空间。
 */
import * as apiClient from "@lieshoucloud/contract-api";

import {
  FOLLOWUP_TYPE_META,
  LEAD_SOURCE_META,
  LEAD_STATUS_META,
  addLeadFollowUp,
  assignLead,
  convertLead,
  createLead,
  getLead,
  listLeadFollowUps,
  listLeads,
  releaseLead,
} from "./lead";

const mockRequest = jest.spyOn(apiClient, "request");

beforeEach(() => {
  mockRequest.mockReset();
  mockRequest.mockResolvedValue(undefined as never);
});

describe("mobile lead service", () => {
  it("listLeads 无参 → GET /leads", async () => {
    mockRequest.mockResolvedValue([]);
    await listLeads();
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/api/leads", query: {} });
  });

  it("listLeads 带 status/owner/keyword → query", async () => {
    mockRequest.mockResolvedValue([]);
    await listLeads({ status: "FOLLOWING", owner: -1, keyword: "李" });
    expect(mockRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/api/leads",
      query: { status: "FOLLOWING", owner: -1, keyword: "李" },
    });
  });

  it("getLead → GET /leads/{id}", async () => {
    mockRequest.mockResolvedValue({ id: 1 });
    await getLead(1);
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/api/leads/1" });
  });

  it("createLead body 透传", async () => {
    mockRequest.mockResolvedValue({ id: 1 });
    await createLead({ name: "星辰科技", source: "CHANNEL" });
    expect(mockRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/api/leads",
      body: { name: "星辰科技", source: "CHANNEL" },
    });
  });

  it("assignLead → POST /leads/{id}/assign", async () => {
    mockRequest.mockResolvedValue({ id: 1 });
    await assignLead(1);
    expect(mockRequest).toHaveBeenCalledWith({ method: "POST", path: "/api/leads/1/assign", body: {} });
  });

  it("releaseLead → POST /leads/{id}/release", async () => {
    mockRequest.mockResolvedValue({ id: 1 });
    await releaseLead(1);
    expect(mockRequest).toHaveBeenCalledWith({ method: "POST", path: "/api/leads/1/release", body: {} });
  });

  it("convertLead → POST /leads/{id}/convert", async () => {
    mockRequest.mockResolvedValue({ id: 1 });
    await convertLead(1);
    expect(mockRequest).toHaveBeenCalledWith({ method: "POST", path: "/api/leads/1/convert", body: {} });
  });

  it("listLeadFollowUps → GET /leads/{id}/follow-ups", async () => {
    mockRequest.mockResolvedValue([]);
    await listLeadFollowUps(1);
    expect(mockRequest).toHaveBeenCalledWith({ method: "GET", path: "/api/leads/1/follow-ups" });
  });

  it("addLeadFollowUp body 透传", async () => {
    mockRequest.mockResolvedValue({ id: 9 });
    await addLeadFollowUp(1, { type: "PHONE", content: "客户有意向" });
    expect(mockRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/api/leads/1/follow-ups",
      body: { type: "PHONE", content: "客户有意向" },
    });
  });

  it("元数据完整性", () => {
    expect(LEAD_STATUS_META.CONVERTED.text).toBe("已转化");
    expect(LEAD_SOURCE_META.CHANNEL).toBe("渠道");
    expect(FOLLOWUP_TYPE_META.VISIT).toBe("拜访");
  });
});
