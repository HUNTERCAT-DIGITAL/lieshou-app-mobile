/**
 * Mobile 法律行业 API 层（industry-legal · 计时能力）.
 * 案件管理走 src/services/legal.ts（后端契约对齐版，ADR-0036/0045）；
 * 此处仅承载行业包独有能力（计时/日程等），共享 api-client 适配 IndustryHttpClient。
 */
import { request } from "@lieshoucloud/api-client";
import { createLegalApi, type IndustryHttpClient } from "@lieshoucloud/industry-legal";

/** 去掉行业包路径的 /api 前缀（api-client 自动补） */
const stripApi = (p: string) => p.replace(/^\/api/, "");

const http: IndustryHttpClient = {
  get: (path, query) =>
    request({
      method: "GET",
      path: stripApi(path),
      query: query as Record<string, string | number | boolean> | undefined,
    }),
  post: (path, body) => request({ method: "POST", path: stripApi(path), body }),
  put: (path, body) => request({ method: "PUT", path: stripApi(path), body }),
  delete: (path) => request({ method: "DELETE", path: stripApi(path) }),
};

export const legalApi = createLegalApi(http);
