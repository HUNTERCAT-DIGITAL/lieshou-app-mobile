/**
 * Mobile lead service 单测（2026-09 上收 core-web 后测 ApiPort 传输）.
 *
 * services/lead.ts 为 core-web 薄 re-export，实现走 requestApi → 注入的 ApiPort。
 * 注入 portRequest spy，验证 URL path / body 透传（全路径带 /api 前缀）。
 */
import { configureCore } from "@lieshoucloud/core-web";

import {
  FOLLOW_UP_TYPE_META,
  LEAD_SOURCE_META,
  LEAD_STATUS_META,
  addFollowUp,
  assignLead,
  convertLead,
  createLead,
  getLead,
  listFollowUps,
  listLeads,
  releaseLead,
} from "./lead";

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

describe("mobile lead service（core-web 上收 · ApiPort 传输）", () => {
  it("listLeads 无参 → GET /api/leads", async () => {
    portRequest.mockResolvedValue([]);
    await listLeads();
    expect(portRequest).toHaveBeenCalledWith("/api/leads", undefined);
  });

  it("listLeads keyword/status/owner(-1 公海) → query", async () => {
    portRequest.mockResolvedValue([]);
    await listLeads("华为", "NEW", -1);
    expect(portRequest).toHaveBeenCalledWith(
      "/api/leads?keyword=%E5%8D%8E%E4%B8%BA&status=NEW&owner=-1",
      undefined,
    );
  });

  it("listLeads owner 缺省 0（全部）→ 不拼 owner 参数", async () => {
    portRequest.mockResolvedValue([]);
    await listLeads(undefined, undefined, 0);
    expect(portRequest).toHaveBeenCalledWith("/api/leads", undefined);
  });

  it("getLead → GET /api/leads/{id}", async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await getLead(1);
    expect(portRequest).toHaveBeenCalledWith("/api/leads/1", undefined);
  });

  it("createLead → POST /api/leads + body", async () => {
    portRequest.mockResolvedValue({ id: 1 });
    await createLead({ name: "华为采购部", source: "CHANNEL" });
    expect(portRequest).toHaveBeenCalledWith("/api/leads", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ name: "华为采购部", source: "CHANNEL" }),
    });
  });

  it("assignLead → POST /api/leads/{id}/assign", async () => {
    portRequest.mockResolvedValue({ id: 1, ownerId: 5 });
    await assignLead(1);
    expect(portRequest).toHaveBeenCalledWith("/api/leads/1/assign", { method: "POST" });
  });

  it("releaseLead → POST /api/leads/{id}/release", async () => {
    portRequest.mockResolvedValue({ id: 1, ownerId: null });
    await releaseLead(1);
    expect(portRequest).toHaveBeenCalledWith("/api/leads/1/release", { method: "POST" });
  });

  it("convertLead → POST /api/leads/{id}/convert", async () => {
    portRequest.mockResolvedValue({ id: 1, status: "CONVERTED" });
    await convertLead(1);
    expect(portRequest).toHaveBeenCalledWith("/api/leads/1/convert", { method: "POST" });
  });

  it("listFollowUps → GET /api/leads/{id}/follow-ups", async () => {
    portRequest.mockResolvedValue([]);
    await listFollowUps(1);
    expect(portRequest).toHaveBeenCalledWith("/api/leads/1/follow-ups", undefined);
  });

  it("addFollowUp → POST /api/leads/{id}/follow-ups + body", async () => {
    portRequest.mockResolvedValue({ id: 9, leadId: 1 });
    await addFollowUp(1, { type: "PHONE", content: "电话回访" });
    expect(portRequest).toHaveBeenCalledWith("/api/leads/1/follow-ups", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ type: "PHONE", content: "电话回访" }),
    });
  });

  it("META 常量来自 contract-types（薄壳 re-export）", () => {
    expect(LEAD_STATUS_META.CONVERTED.text).toBe("已转化");
    expect(LEAD_SOURCE_META.CHANNEL).toBe("渠道");
    expect(FOLLOW_UP_TYPE_META.VISIT).toBe("拜访");
  });
});
