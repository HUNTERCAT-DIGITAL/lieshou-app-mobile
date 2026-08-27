# lieshou-cloud-mobile · 猎手云移动端(开源)

> 猎手云(开源)的主移动端:Expo ~57(React Native),承载登录 / 工作台 / 客户 / 线索 / 库存 / 记账 / 审批等通用业务。
> 行业能力与客户定制通过 **Edition + 行业装配点**(`EXPO_PUBLIC_INDUSTRY`)注入,不在本仓内(行业包为闭源商业模块)。

<p align="center">
  <img src="https://img.shields.io/badge/Expo-57-4630EB" alt="Expo 57"/>
  <img src="https://img.shields.io/badge/React%20Native-0.79-61dafb" alt="React Native"/>
  <img src="https://img.shields.io/badge/License-Apache--2.0-brightgreen" alt="Apache-2.0"/>
</p>

## 技术栈

- Expo ~57(React Native + TypeScript)+ expo-router
- 共享层 `@lieshoucloud/{api-client,config,types}` 经 `open/` submodule 挂载 [lieshou-cloud-web](https://github.com/HUNTERCAT-DIGITAL/lieshou-cloud-web)

## 快速开始

```bash
git clone git@github.com:HUNTERCAT-DIGITAL/lieshou-mobile.git
git submodule update --init --recursive   # 拉 open/(lieshou-cloud-web 共享包)
pnpm install
pnpm start                                # Expo dev server
```

## 脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm start` | Expo 开发服务器 |
| `pnpm typecheck` | tsc --noEmit |
| `pnpm test` | Jest |
| `pnpm export` | 生产打包 |

## 客户/行业装配

本仓只含**通用部分**;行业能力与客户定制经装配点注入:

- `src/config/industry.ts`:`EXPO_PUBLIC_INDUSTRY` 行业装配点(缺省 generic;行业包为闭源商业模块)
- `src/config/workbench.ts`:角色工作台配置(开源版 generic;行业工作台由行业包扩展)
- 客户薄壳页由客户仓注入(如 `app/(main)/<client>/workspace.tsx`)

## 关联仓库

- 共享层(开源):`HUNTERCAT-DIGITAL/lieshou-cloud-web`
- 后端底座(开源):`HUNTERCAT-DIGITAL/lieshou-cloud`
- 其他端(开源):`lieshou-cloud-admin-web` · `lieshou-cloud-desktop` · `lieshou-cloud-mini-program`
- 商业主仓:`HUNTERCAT-DIGITAL/lieshou-cloud-pro`

## License

Apache-2.0,见 [LICENSE](LICENSE)。
