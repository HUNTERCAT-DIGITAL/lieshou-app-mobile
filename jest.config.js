module.exports = {
  preset: "jest-expo",
  setupFiles: ["./jest.setup.js"],
  // 覆盖率统计范围（仅 src，排除测试自身；对齐 .ai/TESTING.md 起步 50% 不阻断策略）
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.{test,spec}.{ts,tsx}", "!src/**/__tests__/**"],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  // monorepo + pnpm 符号链接下, 让 Jest 把 workspace 包直接指向源码
  moduleNameMapper: {
    "^@lieshoucloud/contract-api$": "<rootDir>/open/contract-api/src",
    "^@lieshoucloud/contract-types$": "<rootDir>/open/contract-types/src",
    "^@lieshoucloud/core-web$": "<rootDir>/open/core-web/src",
  },
  // 排除 open/ submodule（开源 packages 的测试由各自仓库/包自行跑，端仓库 jest 不扫）
  testPathIgnorePatterns: ["/node_modules/", "/open/", "/dist/", "/.expo/"],
  // 排除 industry submodule 树（其内部另挂 open/，避免 jest-haste-map 撞上重复的 @lieshoucloud/* 包）
  modulePathIgnorePatterns: ["<rootDir>/industry/"],
  // jest-expo preset 默认的 transformIgnorePatterns 漏了 `@react-native+js-polyfills`
  // （pnpm 把包放在 .pnpm/<name>+<ver>/node_modules/，目录名里用 `+` 而不是 `/`）。
  // 用 .pnpm 路径前缀做白名单，让 babel 处理 .pnpm 下所有 react-native 系包。
  transformIgnorePatterns: [
    "node_modules/(?!(.pnpm/.*(@react-native(\\+.*)?|react-native(\\+.*)?|@react-navigation(\\+.*)?|expo(\\+.*)?|@expo(\\+.*)?/.*|@react-native-async-storage(\\+.*)?|@unimodules/.*)|(jest-)?react-native|@react-native(-community)?|@react-navigation/.*|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))",
  ],
};
