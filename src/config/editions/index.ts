/**
 * 版别解析（端自身骨架 · 类型来自共享契约 contract-types）：
 * 构建期 `EXPO_PUBLIC_EDITION` 注入 → generic 兜底。
 * 客户版：合并 extra.ts 注入的品牌（BRAND/PRIMARY_COLOR，deploy:prepare 生成）。
 */
import type { EditionConfig } from '@lieshoucloud/contract-types';

import { genericEdition } from './generic';
import { BRAND } from './extra';

export function resolveEditionId(): string {
  const env = process.env.EXPO_PUBLIC_EDITION as string | undefined;
  if (env?.trim()) return env.trim();
  return 'generic';
}

export function getEdition(): EditionConfig {
  const id = resolveEditionId();
  // 总是合并客户注入品牌（extra.ts BRAND，deploy:prepare 生成）：
  // 不依赖 EXPO_PUBLIC_EDITION（web 构建/Expo Go 可能未设该变量，走 generic 也应有客户品牌）。
  // generic 独立仓：extra.ts 为占位（BRAND 同 generic），合并后无差异，向后兼容。
  return {
    ...genericEdition,
    id,
    brandName: BRAND.name || genericEdition.brandName,
    companyName: BRAND.title || genericEdition.brandName,
    slogan: BRAND.subtitle || genericEdition.slogan,
  };
}
