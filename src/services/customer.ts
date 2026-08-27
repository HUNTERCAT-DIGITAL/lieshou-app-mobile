/**
 * Mobile customer service（Phase 9 · 多端真实化）.
 */
import { request } from "@lieshoucloud/contract-api";

export type CustomerStatus = "NEW" | "FOLLOWING" | "CONVERTED" | "LOST";

export interface Customer {
  id: number;
  tenantId: number;
  name: string;
  contactName?: string | null;
  contactPhone?: string | null;
  email?: string | null;
  address?: string | null;
  status: CustomerStatus;
  ownerId?: number | null;
  remark?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export async function listCustomers(keyword?: string, status?: CustomerStatus): Promise<Customer[]> {
  const query: Record<string, string> = {};
  if (keyword) query.keyword = keyword;
  if (status) query.status = status;
  return request<Customer[]>({
    method: "GET",
    path: `/customers`,
    query,
  });
}

export async function countCustomers(): Promise<number> {
  return request<number>({ method: "GET", path: `/customers/count` });
}

export async function getCustomer(id: number): Promise<Customer> {
  return request<Customer>({ method: "GET", path: `/customers/${id}` });
}

export const STATUS_META: Record<CustomerStatus, { text: string; color: string }> = {
  NEW: { text: "新客户", color: "#1677ff" },
  FOLLOWING: { text: "跟进中", color: "#faad14" },
  CONVERTED: { text: "已转化", color: "#52c41a" },
  LOST: { text: "已流失", color: "#bfbfbf" },
};

export interface CustomerApiError extends Error {
  status?: number;
  code?: string;
}

export function isCustomerApiError(e: unknown): e is CustomerApiError {
  return e instanceof Error && "status" in e;
}
