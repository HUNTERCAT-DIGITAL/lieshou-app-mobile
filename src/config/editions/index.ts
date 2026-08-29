/**
 * 版别解析（端自身骨架）：
 * 构建期 `EXPO_PUBLIC_EDITION` 注入（如 EXPO_PUBLIC_EDITION=legalmind pnpm start）→ generic 兜底。
 */
import { genericEdition } from './generic';
import type { EditionConfig } from './types';

export function resolveEditionId(): string {
  const env = process.env.EXPO_PUBLIC_EDITION as string | undefined;
  if (env?.trim()) return env.trim();
  return 'generic';
}

export function getEdition(): EditionConfig {
  const id = resolveEditionId();
  return id === 'generic' ? genericEdition : { ...genericEdition, id };
}
