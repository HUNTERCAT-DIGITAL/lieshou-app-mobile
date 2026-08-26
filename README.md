# @lieshoucloud/mobile

LieShou Cloud Mobile —— React Native + Expo + Expo Router。

## 启动

前置：Node 22 + pnpm 9+ + Expo CLI (`npx expo` 自带)。

```bash
# 仓库根
pnpm install                                  # 装所有 workspace

# 仅 mobile (推荐 dev 流程)
pnpm turbo run dev --filter=@lieshoucloud/mobile

# 或单独 (Expo CLI 提示按 i/a/w 选平台)
cd apps/mobile && pnpm start

# Type check
pnpm turbo run typecheck --filter=@lieshoucloud/mobile

# Test
pnpm turbo run test --filter=@lieshoucloud/mobile
```

### Expo Go 真机调试（公网域名）

开发服务器通过宝塔 nginx 暴露为 `https://expo.lieshoucloud.huntercat.cn`：

- `/` → Metro (127.0.0.1:8081，watch 模式)
- `/api/*` → gateway (127.0.0.1:9001)
- WebSocket upgrade → Metro HMR

启动 Metro 时需带 `EXPO_PACKAGER_PROXY_URL`（让 manifest 的 hostUri/bundleUrl 指向 443 域名而非 8081 端口）：

```bash
EXPO_PACKAGER_PROXY_URL=https://expo.lieshoucloud.huntercat.cn pnpm start
```

手机 Expo Go：扫码或输入 `exp://expo.lieshoucloud.huntercat.cn`。
注意 Expo Go 版本须与 SDK 匹配（本项目 Expo SDK 57）。

nginx 配置见 `deploy/bt-panel-nginx/expo.lieshoucloud.huntercat.cn.conf`。

## 路由（Expo Router · 文件式）

- `app/(main)/index.tsx` —— 工作台（客户统计 + 最近客户）
- `app/(main)/customers/index.tsx` + `[id].tsx` —— 客户列表 / 详情
- `app/login.tsx` —— 登录页（Zustand + JWT）
- `app/_layout.tsx` —— Root Stack 容器（统一 header 配色 #1677ff）

## 跨包共享

通过 monorepo pnpm workspace：

| 包 | mobile 怎么用 |
|---|---|
| `@lieshoucloud/types` | `import type { HealthStatus } from '@lieshoucloud/types'` —— 纯类型，零 peerDep 冲突 |
| `@lieshoucloud/api-client` | `import { request } from '@lieshoucloud/api-client'` —— 共享 HTTP 层；mobile 原生端启动时 `setBaseUrl(https://expo.lieshoucloud.huntercat.cn)`，web 端走相对 `/api` |

**mobile 不复用 `packages/ui` 的 DOM 组件**：`packages/ui` 是 React 19 + antd（DOM 专用），mobile 用 RN 原生 View/Text 组件（`src/components/MobileUI.tsx` 等），类型通过 `@lieshoucloud/types` 共享。

## 技术栈

- Expo SDK 57（Expo Go 57.x）
- Expo Router 57（文件式路由 + typed routes，SDK 对齐版本号）
- React 19.2.3
- React Native 0.86（新架构）
- react-native-web ~0.21（同一份代码支持 Web 端）
- react-native-reanimated 4 + react-native-worklets（babel 插件由 babel-preset-expo 自动添加）
- TypeScript 6.0
- jest-expo 57

## 已知限制

- assets/icon.png、splash.png 缺失：Phase 1 不 build native 不报错；首次 build 前请补（用 `npx expo-asset` 或手放 1024×1024 PNG）
- `@types/react` 故意锁 `~19.0.0`（而非 SDK 默认 ~19.2.4）：避免 19.2.x 与 admin/desktop/ui 的 19.0.0 并存导致 `packages/ui` 出现重复 ReactNode 类型冲突；已在 `expo.install.exclude` 声明
- 无头服务器上 RN DevTools（GUI 调试器）会报 libgtk 缺失错误，非致命，Metro 正常服务

## 关联文档

- `.ai/decisions/0013-mobile-app.md`
- `.ai/conversations/2026-08-22-mobile-app.md`
- ADR-0012（monorepo 升级）
