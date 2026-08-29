/**
 * Mobile 主题色 —— 对齐 UI.md §2.1 设计令牌（antd 为单一事实源）.
 * 单一事实源: UI.md §2.1（对应 antd ConfigProvider theme.token）
 * mobile 用 hex 近似 antd 的 rgba 文本色（RN 无 antd，值以 UI.md 为准）.
 */
export const colors = {
  /** colorPrimary · 品牌主色（海赞数智蓝） */
  primary: "#103070",
  /** colorBgLayout · 页面背景 */
  bg: "#f5f5f5",
  /** colorBgContainer · 卡片/容器背景 */
  card: "#ffffff",
  /** colorText · 文本主色（近似 rgba(0,0,0,0.88)） */
  text: "#1f1f1f",
  /** colorTextSecondary · 文本次色（近似 rgba(0,0,0,0.65)） */
  textSecondary: "#666666",
  /** colorTextDisabled · 文本禁用 */
  textDisabled: "#bfbfbf",
  /** colorBorder · 边框 */
  border: "#d9d9d9",
  /** colorSplit · 卡片分隔线/弱边框（antd 分割线色） */
  divider: "#f0f0f0",
  /** TextInput/Input 占位符颜色 */
  placeholder: "#bfbfbf",
  /** 输入框/浅底（近似 colorFillAlter） */
  surface: "#fafafa",
  /** colorSuccess */
  success: "#52c41a",
  /** colorError */
  error: "#f5222d",
  /** colorWarning */
  warning: "#faad14",
} as const;

export type ThemeColor = keyof typeof colors;
