/**
 * Mobile lead service —— 线索池 / 公海 / 跟进（Phase B · 销售场景）.
 * 对齐 CRM LeadController（GET/POST /api/leads + assign/release/convert/follow-ups）.
 */
import { request } from "@lieshoucloud/api-client";

export type LeadStatus = "NEW" | "FOLLOWING" | "CONVERTED" | "LOST";
export type LeadSource = "MANUAL" | "IMPORT" | "CHANNEL" | "OTHER";
export type FollowUpType = "PHONE" | "VISIT" | "WECHAT" | "NOTE";

export interface Lead {
  id: number;
  name: string;
  contactName?: string | null;
  contactPhone?: string | null;
  email?: string | null;
  source: LeadSource;
  status: LeadStatus;
  /** 认领人 id；null = 公海 */
  ownerId?: number | null;
  lastFollowUpAt?: string | null;
  nextFollowUpAt?: string | null;
  convertedCustomerId?: number | null;
  remark?: string | null;
  createdAt: string;
}

export interface LeadFollowUp {
  id: number;
  leadId: number;
  userId?: number;
  type: FollowUpType;
  content: string;
  nextFollowUpAt?: string | null;
  createdAt: string;
}

export interface CreateLeadBody {
  name: string;
  contactName?: string;
  contactPhone?: string;
  email?: string;
  source?: LeadSource;
  remark?: string;
}

/** 认领人过滤：-1=线索池(公海) 0=全部 >0=指定人 */
export type LeadOwnerFilter = -1 | 0 | number;

export async function listLeads(params?: {
  status?: LeadStatus;
  owner?: LeadOwnerFilter;
  keyword?: string;
}): Promise<Lead[]> {
  const query: Record<string, string | number | boolean> = {};
  if (params?.status) query.status = params.status;
  if (params?.owner !== undefined) query.owner = params.owner;
  if (params?.keyword) query.keyword = params.keyword;
  return request<Lead[]>({ method: "GET", path: "/leads", query });
}

export async function getLead(id: number): Promise<Lead> {
  return request<Lead>({ method: "GET", path: `/leads/${id}` });
}

export async function createLead(body: CreateLeadBody): Promise<Lead> {
  return request<Lead>({ method: "POST", path: "/leads", body });
}

/** 认领（给自己） */
export async function assignLead(id: number): Promise<Lead> {
  return request<Lead>({ method: "POST", path: `/leads/${id}/assign`, body: {} });
}

/** 释放到公海 */
export async function releaseLead(id: number): Promise<Lead> {
  return request<Lead>({ method: "POST", path: `/leads/${id}/release`, body: {} });
}

/** 转为客户 */
export async function convertLead(id: number): Promise<Lead> {
  return request<Lead>({ method: "POST", path: `/leads/${id}/convert`, body: {} });
}

export async function listLeadFollowUps(id: number): Promise<LeadFollowUp[]> {
  return request<LeadFollowUp[]>({ method: "GET", path: `/leads/${id}/follow-ups` });
}

export async function addLeadFollowUp(
  id: number,
  body: { type: FollowUpType; content: string; nextFollowUpAt?: string },
): Promise<LeadFollowUp> {
  return request<LeadFollowUp>({ method: "POST", path: `/leads/${id}/follow-ups`, body });
}

/** 状态 → 中文/颜色 */
export const LEAD_STATUS_META: Record<LeadStatus, { text: string; color: string }> = {
  NEW: { text: "新线索", color: "#1677ff" },
  FOLLOWING: { text: "跟进中", color: "#faad14" },
  CONVERTED: { text: "已转化", color: "#52c41a" },
  LOST: { text: "已流失", color: "#bfbfbf" },
};

/** 来源 → 中文 */
export const LEAD_SOURCE_META: Record<LeadSource, string> = {
  MANUAL: "手动录入",
  IMPORT: "批量导入",
  CHANNEL: "渠道",
  OTHER: "其他",
};

/** 跟进方式 → 中文 */
export const FOLLOWUP_TYPE_META: Record<FollowUpType, string> = {
  PHONE: "电话",
  VISIT: "拜访",
  WECHAT: "微信",
  NOTE: "备注",
};
