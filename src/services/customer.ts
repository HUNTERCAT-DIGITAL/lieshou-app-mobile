/**
 * Mobile customer service（Phase 9 · 多端真实化）.
 *
 * 2026-09 上收 lieshou-core-web（业务逻辑唯一源，同 auth/approval 模式）：
 * 实现移至 core-web features/crm/crm.api.ts（走注入的 ApiPort 传输），
 * 本文件保留导出路径兼容既有页面/测试（import '../../services/customer' 不变）。
 */
export { countCustomers, getCustomer, listCustomers } from "@lieshoucloud/core-web";
export type { Customer, CustomerStatus } from "@lieshoucloud/contract-types";
export { STATUS_META } from "@lieshoucloud/contract-types/business/customer";
