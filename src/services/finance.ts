/**
 * Mobile finance service —— 收支记账（Phase 9 · 多端真实化）.
 *
 * 2026-09 上收 lieshou-core-web（业务逻辑唯一源，同 approval/customer/lead 模式）：
 * 实现移至 core-web features/finance/finance.api.ts（走注入的 ApiPort 传输），
 * 本文件保留导出路径兼容既有页面/测试（import '../../services/finance' 不变）。
 * 命名对齐 core-web：getSummary → getLedgerSummary；META/类型来自 contract-types。
 */
export {
  listLedger,
  getLedgerSummary,
  getMonthlySummary,
  getLedger,
  createLedger,
  updateLedger,
  deleteLedger,
} from "@lieshoucloud/core-web";
export type {
  CreateLedgerRequest,
  LedgerEntry,
  LedgerSummary,
  LedgerType,
  MonthlySummary,
  UpdateLedgerRequest,
} from "@lieshoucloud/contract-types";
export { LEDGER_CATEGORIES, LEDGER_TYPE_META } from "@lieshoucloud/contract-types";
