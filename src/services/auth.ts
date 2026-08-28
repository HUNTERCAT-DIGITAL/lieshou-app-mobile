/**
 * Mobile auth service —— 登录 / 当前用户（Phase 9 · 多端真实化）.
 *
 * 2026-09 上收 lieshou-core-web（业务逻辑唯一源，同 approval/customer 模式）：
 * 实现移至 core-web features/auth/auth.api.ts（走注入的 ApiPort 传输），
 * 本文件保留导出路径兼容既有页面/测试（import '../../services/auth' 不变）。
 * isApiError/ApiError 来自 contract-api（统一错误类型，去除本地重复实现）。
 * baseUrl 配置由 app/_layout.tsx 的 ApiPort 统一处理（本文件不再 configureApiBaseUrl）。
 */
export { login, refreshTokens, fetchCurrentUser, switchTenant } from "@lieshoucloud/core-web";
export type { CurrentUser, LoginRequest, TokenResponse } from "@lieshoucloud/contract-types";
export { isApiError } from "@lieshoucloud/contract-api";
export type { ApiError } from "@lieshoucloud/contract-api";
