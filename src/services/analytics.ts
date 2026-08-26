/**
 * Mobile 指标埋点框架 · 支撑 BUSINESS.md NSM（活跃商户/功能使用度量）.
 *
 * 设计：
 *  - 事件名集中定义（EVENTS），业务代码只引用常量，禁止裸字符串
 *  - dev（__DEV__）→ console.debug，便于联调观察
 *  - 生产 → 预留 AsyncStorage 缓冲 + 批量上报通道（后端契约见下 TODO）
 *
 * 后端上报契约（待接入）：
 *   POST /api/analytics/events
 *   body: { event: string, props: Record<string,string|number|boolean|null|undefined>,
 *           ts: ISO8601, platform: "ios"|"android"|"web" }
 *   鉴权：Bearer token（租户自动从 token 解析，服务端做租户聚合）
 *   幂等：客户端重试需带 clientEventId（UUID），服务端去重
 */
import { Platform } from "react-native";

export type TrackProps = Record<string, string | number | boolean | null | undefined>;

/** 集中事件定义：新增事件先在这里登记（与 docs/analytics 契约同步） */
export const EVENTS = {
  LOGIN_SUCCESS: "mobile.login_success",
  LOGIN_FAILED: "mobile.login_failed",
  LOGOUT: "mobile.logout",
  DASHBOARD_VIEWED: "mobile.dashboard_viewed",
  APPROVAL_CREATED: "mobile.approval_created",
  APPROVAL_DECIDED: "mobile.approval_decided",
  CUSTOMER_OPENED: "mobile.customer_opened",
  LEAD_CREATED: "mobile.lead_created",
  LEAD_ASSIGNED: "mobile.lead_assigned",
  LEAD_RELEASED: "mobile.lead_released",
  LEAD_CONVERTED: "mobile.lead_converted",
  LEAD_FOLLOWED_UP: "mobile.lead_followed_up",
  INVENTORY_STOCK_CHANGED: "mobile.inventory_stock_changed",
  LEDGER_CREATED: "mobile.ledger_created",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/** dev 模式下是否可见（可在调试期关闭噪声） */
export const TRACK_DEBUG = true;

/**
 * 记录一个事件。dev 打点、生产入缓冲队列。
 * 调用方不 await（fire-and-forget），内部捕获所有异常不抛出。
 */
export function track(event: EventName | string, props?: TrackProps): void {
  try {
    const payload = {
      event,
      props: props ?? {},
      ts: new Date().toISOString(),
      platform: Platform.OS,
    };
    if (__DEV__ && TRACK_DEBUG) {
      // 埋点 dev 输出是框架职责（调试观察用），豁免 no-console
      // eslint-disable-next-line no-console
      console.debug("[track]", payload.event, payload.props);
      return;
    }
    // TODO(analytics): 生产通道 —— AsyncStorage 缓冲 + 批量 POST /api/analytics/events
    // 接入时在此处入队，并确保 clientEventId 幂等。
    void payload;
  } catch {
    // 埋点绝不影响业务
  }
}
