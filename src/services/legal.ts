/**
 * Mobile legal service（ADR-0036/0045 · 案件管理 + 办案时间线）.
 *
 * 类型与 admin types/legal.ts 对齐；分页结构 {items,total,page,size} 与后端统一。
 */
import { request } from "@lieshoucloud/api-client";

export type CaseType = "CIVIL" | "CRIMINAL" | "ADMIN" | "COMMERCIAL" | "IP" | "OTHER";
export type CaseStatus = "INTAKE" | "FILED" | "IN_TRIAL" | "CLOSED" | "ARCHIVED";
export type EventType =
  | "INTAKE"
  | "FILING"
  | "HEARING"
  | "EVIDENCE"
  | "MEDIATION"
  | "JUDGMENT"
  | "ARCHIVE"
  | "OTHER";

export interface LegalCase {
  id: number;
  tenantId: number;
  caseNo: string;
  title: string;
  caseType: CaseType;
  party?: string | null;
  oppositeParty?: string | null;
  court?: string | null;
  status: CaseStatus;
  responsibleLawyer?: string | null;
  coLawyer?: string | null;
  amount?: number | null;
  filedAt?: string | null;
  closedAt?: string | null;
  remark?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CaseEvent {
  id: number;
  tenantId: number;
  caseId: number;
  eventType: EventType;
  occurredAt: string;
  title: string;
  detail?: string | null;
}

export interface LegalPage<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

/** GET /api/legal/cases — 案件分页列表 */
export async function listCases(params?: {
  keyword?: string;
  status?: CaseStatus;
  caseType?: CaseType;
  lawyer?: string;
}, page = 1, size = 20): Promise<LegalPage<LegalCase>> {
  const query: Record<string, string> = { page: String(page), size: String(size) };
  if (params?.keyword) query.keyword = params.keyword;
  if (params?.status) query.status = params.status;
  if (params?.caseType) query.caseType = params.caseType;
  if (params?.lawyer) query.lawyer = params.lawyer;
  return request<LegalPage<LegalCase>>({ method: "GET", path: "/legal/cases", query });
}

/** GET /api/legal/cases/{id} — 案件详情 */
export async function getCase(id: number): Promise<LegalCase> {
  return request<LegalCase>({ method: "GET", path: `/legal/cases/${id}` });
}

/** GET /api/legal/cases/{id}/events — 办案时间线（升序） */
export async function listCaseEvents(caseId: number): Promise<CaseEvent[]> {
  return request<CaseEvent[]>({ method: "GET", path: `/legal/cases/${caseId}/events` });
}

export const CASE_STATUS_META: Record<CaseStatus, { text: string; color: string }> = {
  INTAKE: { text: "待立案", color: "#8c8c8c" },
  FILED: { text: "已立案", color: "#1677ff" },
  IN_TRIAL: { text: "审理中", color: "#fa8c16" },
  CLOSED: { text: "已结案", color: "#52c41a" },
  ARCHIVED: { text: "已归档", color: "#8c8c8c" },
};

export const CASE_TYPE_META: Record<CaseType, string> = {
  CIVIL: "民事",
  CRIMINAL: "刑事",
  ADMIN: "行政",
  COMMERCIAL: "商事仲裁",
  IP: "知识产权",
  OTHER: "其他",
};

export const EVENT_TYPE_META: Record<EventType, { text: string; color: string }> = {
  INTAKE: { text: "委托收案", color: "#1677ff" },
  FILING: { text: "立案", color: "#13c2c2" },
  HEARING: { text: "开庭", color: "#faad14" },
  EVIDENCE: { text: "举证", color: "#2f54eb" },
  MEDIATION: { text: "调解", color: "#722ed1" },
  JUDGMENT: { text: "判决", color: "#52c41a" },
  ARCHIVE: { text: "归档", color: "#8c8c8c" },
  OTHER: { text: "其他", color: "#8c8c8c" },
};
