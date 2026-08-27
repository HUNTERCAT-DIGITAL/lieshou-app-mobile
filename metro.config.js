/**
 * Metro 配置 - monorepo (pnpm workspace) 适配.
 * @see https://docs.expo.dev/guides/monorepos/
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const monorepoRoot = projectRoot; // 独立仓库：根即 monorepo 根（open/ submodule）

const config = getDefaultConfig(projectRoot);

// Metro 默认无 resolver.alias，先初始化（客户包 alias 追加用）
config.resolver.alias = config.resolver.alias ?? {};

// 1. 监听整个 monorepo 根目录, 让 Metro 能感知 packages/* 与 apps/* 的源文件变化
config.watchFolders = [monorepoRoot];

// 2. Metro 从这两个 node_modules 解析依赖 (monorepo 根 + 当前 app)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. 客户聚合仓模式（2026-09）：客户仓 packages/<client> → @lieshoucloud/<client>
//    客户仓 deploy:prepare 生成 tsconfig.<client>.json（TS 层 paths），此处补充 Metro
//    运行时 alias（对齐 admin-web vite 客户包正则兜底；Metro 无正则，改扫描 ../packages）。
//    独立仓库（无客户仓）../packages 不存在 → 跳过，行为与通用版完全一致。
const clientRoot = path.resolve(monorepoRoot, '../packages');
if (fs.existsSync(clientRoot)) {
  config.watchFolders.push(clientRoot);
  for (const name of fs.readdirSync(clientRoot)) {
    if (!fs.statSync(path.join(clientRoot, name)).isDirectory()) continue;
    const src = path.join(clientRoot, name, 'src');
    config.resolver.alias[`@lieshoucloud/${name}`] = src;
    config.resolver.alias[`@lieshoucloud/${name}/*`] = `${src}/*`;
  }
}

// 3. 层级查找保持开启（默认）：pnpm 把包的传递依赖符号链接在
//    node_modules/.pnpm/<pkg>@<ver>/node_modules/ 同层，Metro 需要从模块
//    真实路径向上走才能解析到（disableHierarchicalLookup=true 会导致
//    expo-modules-core / whatwg-fetch 等传递依赖全部解析失败）。
//    workspace 包（@lieshoucloud/*）通过 apps/mobile/node_modules 的
//    符号链接解析，不受影响。

module.exports = config;