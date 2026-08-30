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

// 子路径部署（EXPO_BASE_URL=/mobile）：自定义 Babel Transformer 注入
// customTransformOptions.baseUrl → babel-preset-expo define process.env.EXPO_BASE_URL
// （expo-router appendBaseUrl 依赖；未设 EXPO_BASE_URL 时透传原行为）
config.transformer.babelTransformerPath = require.resolve('./babel-transformer.js');

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
//    运行时解析（extraNodeModules 包级映射，子路径自动拼接；对齐 admin-web vite 客户包兜底）。
//    独立仓库（无客户仓）../packages 不存在 → 跳过，行为与通用版完全一致。
const clientRoot = path.resolve(monorepoRoot, '../packages');
if (fs.existsSync(clientRoot)) {
  config.watchFolders.push(clientRoot);
  for (const name of fs.readdirSync(clientRoot)) {
    if (!fs.statSync(path.join(clientRoot, name)).isDirectory()) continue;
    const src = path.join(clientRoot, name, 'src');
    config.resolver.extraNodeModules = {
      ...(config.resolver.extraNodeModules ?? {}),
      [`@lieshoucloud/${name}`]: src,
    };
  }
}

// 3b. 客户包 react 系列强制重写为本仓副本（2026-09）：客户包文件在
//     ../packages/<client>/src，层级查找会向上命中 delivery 根 node_modules 的
//     react@19.0.0（admin-web 生态）→ 双 React 白屏。extraNodeModules 是层级查找
//     兜底（已命中则不走），故用 resolver.alias 强制重写（alias 优先于层级查找）。
//     取代 build 脚本的「移走 delivery 根 node_modules」隔离 hack（dev server 不能隔离）。
config.resolver.alias = {
  ...(config.resolver.alias ?? {}),
  react: path.join(projectRoot, 'node_modules/react'),
  'react-dom': path.join(projectRoot, 'node_modules/react-dom'),
  'react/jsx-runtime': path.join(projectRoot, 'node_modules/react/jsx-runtime'),
  'react/jsx-dev-runtime': path.join(projectRoot, 'node_modules/react/jsx-dev-runtime'),
  'react-native': path.join(projectRoot, 'node_modules/react-native'),
};

// 3. 层级查找保持开启（默认）：pnpm 把包的传递依赖符号链接在
//    node_modules/.pnpm/<pkg>@<ver>/node_modules/ 同层，Metro 需要从模块
//    真实路径向上走才能解析到（disableHierarchicalLookup=true 会导致
//    expo-modules-core / whatwg-fetch 等传递依赖全部解析失败）。
//    workspace 包（@lieshoucloud/*）通过 apps/mobile/node_modules 的
//    符号链接解析，不受影响。

module.exports = config;