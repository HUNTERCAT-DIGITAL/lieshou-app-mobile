/**
 * 行业标识（端壳模板 · 行业装配点）.
 *
 * 行业 app（edu-mobile / legal-mobile / iot-mobile）通过构建时环境变量
 * `EXPO_PUBLIC_INDUSTRY` 指定行业；通用版（本仓库）缺省 generic。
 * 运行期租户版别（tenantEdition）可作为回退/联动。
 *
 * 行业工作台/页面由各行业 app 装配（行业包），端壳只提供装配点与通用能力。
 */
import Constants from "expo-constants";
import type { IndustryId } from "@lieshoucloud/contract-types";

// IndustryId 契约来自 @lieshoucloud/types（L0 · 客户层与行业层解耦，2026-09）
export type { IndustryId } from "@lieshoucloud/contract-types";

export interface IndustryMeta {
  id: IndustryId;
  /** 显示名 */
  label: string;
  /** 对应用户端租户版别（后端 tenants.edition） */
  edition: string;
}

export const INDUSTRIES: Record<IndustryId, IndustryMeta> = {
  generic: { id: "generic", label: "通用", edition: "GENERIC" },
  edu: { id: "edu", label: "教育", edition: "ZHIYE" },
  legal: { id: "legal", label: "法律", edition: "LAYER" },
  iot: { id: "iot", label: "物联网", edition: "DWJK" },
};

const ENV_INDUSTRY = (Constants.expoConfig?.extra?.industry ??
  process.env.EXPO_PUBLIC_INDUSTRY) as IndustryId | undefined;

/** 校验 env 行业是否合法 */
function normalizeIndustry(v: string | undefined): IndustryId {
  return v && v in INDUSTRIES ? (v as IndustryId) : "generic";
}

/**
 * 行业标识（构建时 env 优先，缺省 generic）.
 * 行业 app 在构建/启动时注入 EXPO_PUBLIC_INDUSTRY=edu|legal|iot。
 */
export function getIndustryId(): IndustryId {
  return normalizeIndustry(ENV_INDUSTRY);
}

export function getIndustryMeta(): IndustryMeta {
  return INDUSTRIES[getIndustryId()];
}
