/**
 * Mobile user service —— 租户内用户列表（审批流选审批人用）.
 * 对齐 user-service GET /api/users（X-Tenant-Id 强制过滤）.
 */
import { request } from "@lieshoucloud/contract-api";

export interface TenantUser {
  id: number;
  username: string;
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
}

/** 租户内用户列表（仅本租户，后端强制过滤） */
export async function listUsers(): Promise<TenantUser[]> {
  return request<TenantUser[]>({ method: "GET", path: "/users" });
}

/** 展示名：displayName 优先，回落 username */
export function userDisplayName(u: TenantUser): string {
  return u.displayName || u.username;
}
