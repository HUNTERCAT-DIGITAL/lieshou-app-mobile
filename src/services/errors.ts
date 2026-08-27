/**
 * Mobile 统一错误判断工具（Phase D · 错误态区分）.
 * 基于 api-client 结构化 ApiError（status=HTTP 码；网络错误无 status）。
 */
import { isApiError } from "@lieshoucloud/contract-api";

/** 404：资源不存在或不属于当前租户 */
export function isNotFound(e: unknown): boolean {
  return isApiError(e) && e.status === 404;
}

/** 401：未认证（一般已被 api-client 的 unauthorizedHandler 拦截） */
export function isUnauthorized(e: unknown): boolean {
  return isApiError(e) && e.status === 401;
}

/** 网络层错误（断网/DNS/TLS/超时）：api-client 统一 status=0 */
export function isNetworkError(e: unknown): boolean {
  return isApiError(e) && e.status === 0;
}

/** 其他服务端错误（5xx / 4xx 非 401/404） */
export function isServerError(e: unknown): boolean {
  return isApiError(e) && e.status !== 0 && e.status !== 401 && e.status !== 404;
}

/** 取可展示的错误消息（后端 message 优先，网络错误给通用文案） */
export function getErrorMessage(e: unknown): string {
  if (isApiError(e)) {
    if (e.status === 0) return "网络异常，请检查连接后重试";
    return e.message;
  }
  return "发生未知错误";
}
