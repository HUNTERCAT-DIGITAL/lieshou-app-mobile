
/**
 * 兼容客户包 web 侧 URL 工具（receiptContentUrl / documentContentUrl 等）
 * 引用 `import.meta.env?.VITE_API_BASE`——RN 运行时不取用（web-only helper），
 * 此处仅做类型补齐（Metro 无 vite/client 类型）。
 */
interface ImportMeta {
  env?: Record<string, string | undefined>;
}
