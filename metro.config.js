/**
 * Metro 配置 - monorepo (pnpm workspace) 适配.
 * @see https://docs.expo.dev/guides/monorepos/
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = projectRoot; // 独立仓库：根即 monorepo 根（open/ submodule）

const config = getDefaultConfig(projectRoot);

// 1. 监听整个 monorepo 根目录, 让 Metro 能感知 packages/* 与 apps/* 的源文件变化
config.watchFolders = [monorepoRoot];

// 2. Metro 从这两个 node_modules 解析依赖 (monorepo 根 + 当前 app)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. 层级查找保持开启（默认）：pnpm 把包的传递依赖符号链接在
//    node_modules/.pnpm/<pkg>@<ver>/node_modules/ 同层，Metro 需要从模块
//    真实路径向上走才能解析到（disableHierarchicalLookup=true 会导致
//    expo-modules-core / whatwg-fetch 等传递依赖全部解析失败）。
//    workspace 包（@lieshoucloud/*）通过 apps/mobile/node_modules 的
//    符号链接解析，不受影响。

module.exports = config;