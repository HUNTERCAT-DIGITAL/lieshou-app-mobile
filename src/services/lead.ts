/**
 * Mobile lead service —— 线索池 / 公海 / 跟进（Phase B · 销售场景）.
 *
 * 2026-09 上收 lieshou-core-web（业务逻辑唯一源，同 approval/customer 模式）：
 * 实现移至 core-web features/lead/lead.api.ts（走注入的 ApiPort 传输），
 * 本文件保留导出路径兼容既有页面/测试（import '../../services/lead' 不变）。
 * 签名对齐 core-web：listLeads(keyword?, status?, owner=0) 参数式；
 * 跟进相关命名 listFollowUps / addFollowUp；META 来自 contract-types（FOLLOW_UP_TYPE_META）。
 */
export {
  listLeads,
  getLead,
  createLead,
  assignLead,
  releaseLead,
  convertLead,
  listFollowUps,
  addFollowUp,
} from "@lieshoucloud/core-web";
export type {
  FollowUpRequest,
  FollowUpType,
  Lead,
  LeadFollowUp,
  LeadRequest,
  LeadSource,
  LeadStatus,
} from "@lieshoucloud/contract-types";
export {
  FOLLOW_UP_TYPE_META,
  LEAD_SOURCE_META,
  LEAD_STATUS_META,
} from "@lieshoucloud/contract-types";
