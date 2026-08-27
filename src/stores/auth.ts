/**
 * Auth store —— 由 lieshou-core-web 提供（业务逻辑唯一源，2026-09）.
 * 本地实现已上收 core-web；仅保留平台常量兼容。
 */
import { Platform } from 'react-native';

export { useAuthStore } from '@lieshoucloud/core-web';

export const _PLATFORM = Platform.OS;
