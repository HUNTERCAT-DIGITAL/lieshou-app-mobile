/**
 * Mobile auth API service（Phase 9 · 多端真实化）.
 *
 * 跟 admin / desktop 共享 @lieshoucloud/contract-api 的 request<T>()。
 * 不同：mobile 是 RN，不能用 window.localStorage —— token 持久化走
 * AsyncStorage（异步），api-client 的 setAccessTokenProvider 用
 * 同步读取函数（getState() 同步返回最新 token，getToken 来自 Zustand store）。
 */
import { request } from "@lieshoucloud/contract-api";
import type { CurrentUser, LoginRequest, TokenResponse } from "@lieshoucloud/contract-types";

import { configureApiBaseUrl } from "./api";

// 模块加载时配置 baseUrl（原生端指向公网域名，web 端走相对 /api）
configureApiBaseUrl();

export async function login(req: LoginRequest): Promise<TokenResponse> {
  return request<TokenResponse>({
    method: "POST",
    path: `/auth/login`,
    body: req,
  });
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  return request<CurrentUser>({
    method: "GET",
    path: `/auth/me`,
  });
}

export interface ApiError extends Error {
  code?: string;
  status?: number;
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof Error && "status" in e;
}
