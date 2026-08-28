/**
 * Mobile user service —— 租户内用户列表（审批流选审批人用）.
 *
 * 2026-09 上收 lieshou-core-web（业务逻辑唯一源，同 approval/customer 模式）：
 * 实现移至 core-web features/user/user.api.ts + userDisplayName.ts（纯函数），
 * 本文件保留导出路径兼容既有页面/测试（import '../../services/users' 不变）。
 * 类型统一为 contract-types User（原本地 TenantUser 移除，字段为 User 子集）。
 */
export { listUsers } from "@lieshoucloud/core-web";
export { userDisplayName } from "@lieshoucloud/core-web";
export type { User } from "@lieshoucloud/contract-types";
