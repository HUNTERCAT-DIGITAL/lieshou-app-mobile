import { Platform } from "react-native";
import { setBaseUrl } from "@lieshoucloud/api-client";
import type { HealthStatus } from "@lieshoucloud/types";

/**
 * Mobile API client - 通过 @lieshoucloud/api-client 共享 HTTP 调用层.
 *
 * 后端地址: apps/mobile 在 Expo web/iOS/Android 下访问 Spring Cloud Gateway
 *   - Web (浏览器): 走相对 /api，由 nginx/vite 反代到 gateway
 *   - RN 原生 (Expo Go 真机/模拟器): 必须显式绝对地址
 *
 * 真机调试统一走公网域名 https://expo.lieshoucloud.huntercat.cn
 * （宝塔 nginx: /api/* → gateway 9001，/ → Metro 8081）。
 */
/**
 * 后端 API 基址：构建期可配置（EXPO_PUBLIC_API_BASE，见 .env.example）。
 *  - dev / Expo Go：默认 https://expo.lieshoucloud.huntercat.cn（Metro 代理域名，nginx /api → gateway）
 *  - 正式打包：构建时注入生产域名（EAS environment variable），默认值仅作 dev 兜底
 */
import { resolveApiBase } from '@lieshoucloud/config';

export const MOBILE_API_BASE = resolveApiBase({ defaultBase: 'https://expo.lieshoucloud.huntercat.cn', tool: 'expo' });

/**
 * 配置 api-client baseUrl：
 *  - native（Expo Go 真机）→ 公网域名（nginx /api → gateway）
 *  - web（react-native-web）→ 留空，走相对路径 /api（同域反代）
 */
export function configureApiBaseUrl(): void {
  if (Platform.OS !== "web") {
    setBaseUrl(MOBILE_API_BASE);
  }
}

/**
 * 健康检查 - 直连 gateway /actuator/health（无 /api 前缀，无需鉴权）.
 * 失败返回 'down'，不影响 UI.
 */
export async function fetchGatewayHealth(): Promise<HealthStatus> {
  try {
    const base = Platform.OS === "web" ? "" : MOBILE_API_BASE;
    const res = await fetch(`${base}/actuator/health`);
    const data = (await res.json()) as { status: HealthStatus };
    return data.status;
  } catch {
    return "down";
  }
}

export const __PLACEHOLDER_MOBILE_API__ = true;
