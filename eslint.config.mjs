// ESLint 9 flat config（mobile · React Native / Expo）
// 规则来源：eslint-config-expo（Expo 官方：react / react-hooks / react-native / import / expo）
//          + .ai/CONVENTIONS.md §1-§6（与 apps/admin 业务规则对齐）
// 跑法：pnpm lint / pnpm lint:fix
import expoConfig from "eslint-config-expo/flat.js";

export default [
  // 1. 忽略构建产物与依赖
  {
    ignores: [
      "open/**",
      "node_modules/**",
      ".expo/**",
      "dist/**",
      "web-build/**",
      "expo-env.d.ts",
    ],
  },

  // 2. Expo 官方规则集（RN 运行时规则、hooks、import 排序解析、expo 专属）
  ...expoConfig,

  // 3. 业务规则：与 .ai/CONVENTIONS.md §1-§6 / apps/admin 对齐
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",
      eqeqeq: ["error", "always"],
      // React 19 编译器时代激进规则：对「mount 时 void load() 拉数据」标准模式误报
      // （Effect 内 async 请求 + setState）。等迁移 React 19 use() / 数据请求库后再启用。
      "react-hooks/set-state-in-effect": "off",
    },
  },

  // 4. 测试与构建配置文件可以宽松
  {
    files: [
      "**/*.{test,spec}.{ts,tsx}",
      "**/__tests__/**/*.{ts,tsx}",
      "jest.config.js",
      "jest.setup.js",
      "metro.config.js",
      "babel.config.js",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
];
