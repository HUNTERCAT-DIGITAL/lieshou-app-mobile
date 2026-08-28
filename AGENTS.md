# 项目记忆

> 由 pi 的 project-memory 扩展创建，与人类维护者共同维护。记录关键事实、决策与约定。

## 项目身份
- 名称: lieshou-mobile（@lieshoucloud/mobile-app）
- 类型: 移动端（Expo 57 + React Native 0.86 + expo-router 文件路由 + zustand）
- 仓库: github.com/HUNTERCAT-DIGITAL/lieshou-mobile（默认分支 main，已切 SSH 协议）
- 技术栈: Expo ~57 · RN 0.86 · React 19 · TypeScript strict · jest-expo · pnpm workspace

## 架构速览
通用版开源移动端，客户/行业能力经「装配点」注入，业务逻辑上收 `open/core-web`：
- `app/` expo-router 路由（login + (main) 工作台，导航由 workbench 配置驱动）
- `src/services/` 业务 API 封装（走 contract-api `request`）；`src/stores/auth` = core-web re-export
- `open/` submodule：`contract-api`（HTTP 客户端，401 单飞 refresh）、`contract-types`（契约）、`contract-config`（resolveApiBase）、`ui`、`core-web`（业务核心层：features/auth+approval+workbench、ports/api+navigation+storage）
- 端口-适配器：`app/_layout.tsx` `configureCore` 注入 Expo 实现（router/fetch/token）
- 行业装配点 `EXPO_PUBLIC_INDUSTRY`（generic/edu/legal/iot）；客户 tab 注入 `src/config/editions/extra.ts`（EXTRA_TABS/EXTRA_HIDDEN/API_BASE 占位）

## 关键约定
- 改业务逻辑 → 改 `lieshou-core-web`（上游同源），本仓只做薄壳装配，禁止复制底层代码
- 客户注入槽位 `editions/extra.ts` 由客户仓 prepare 覆盖（一个部署 = 一个客户）
- **类型契约**：ClientTab/BrandConfig 在 `@lieshoucloud/core-web`（禁止客户仓 prepare 复制粘贴定义）
- Commit: Conventional Commits；TS `strict`，不用 any
- 导航/图标：Tab 图标用 MaterialCommunityIcons 矢量，禁 emoji

## Submodule 维护纪律（2026-09-10 固化）
- `open/*` 5 个共享仓，SSH 协议（HTTPS 被网络阻断 TLS 失败）
- 改共享仓：在 submodule 内提交 → push 到对应仓 main（先 fetch+rebase）→ 本仓 bump pin（`git add open/<x> && git commit`）分两个提交
- 开工先 `git submodule update --init --recursive` + `git submodule status` 查漂移
- core-web 改动后 `codegraph sync` 刷新索引

## API 基址约定（2026-09-10 治本）
- `/api` 前缀由 `contract-api normalizeApiPath` 幂等归一（单一兜底点），path 写不写 /api 都安全
- **baseUrl 一律纯域名/空串**（同源反代）——禁止在 VITE_API_BASE/API_BASE_URL 注入带 `/api` 后缀（normalize 兼容但易歧义；desktop 生产注入历史带 /api，见下）
- 遗留：desktop 生产注入 VITE_API_BASE 带 /api 后缀（发布脚本）——normalize 的「baseUrl 含 /api 段 → path 不动」分支兼容；**待办：后续统一为纯域名**

## 当前阶段
- 2026-09 组合化重构铺开：core-web 已提供 auth/approval/workbench，本地实现持续上收
- 客户 dwjk（iot）5 tab 由 EXTRA_TABS 注入；web 端 SPA + 同源 API（nginx /api → gateway）

## 待办
- [ ] 推送上一次修复提交（1143e7e）

## 关键决策
- 2026-09: core-web 为业务唯一源，移动端 auth store 仅 re-export
- 2026-09: 行业版变体（edu/iot/legal-mobile）已废弃收敛回通用仓，行业经 env + edition 装配
- 2026-09-10: 修复上游回归——API_BASE 占位导出、workbench extraTabs 注入参数、index.tsx hooks 顺序
