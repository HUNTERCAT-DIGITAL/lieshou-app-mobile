/**
 * 子路径部署自定义 Babel Transformer（EXPO_BASE_URL）。
 *
 * 背景：expo-router 的 appendBaseUrl 读 process.env.EXPO_BASE_URL 生成带前缀的
 * 链接（web 子路径部署必需），但 babel-preset-expo 把它 define 为 caller.baseUrl
 * （默认空串），而 Metro 的 caller.baseUrl 来自 options.customTransformOptions.baseUrl
 * ——Expo CLI 不主动提供，故 web 子路径（如 /mobile）下 router.replace('/login')
 * 会跳到域名根。此 transformer 在请求级注入 baseUrl（官方管道，不 hack node_modules）。
 *
 * 用法：EXPO_BASE_URL=/mobile expo export ...（未设置时透传原行为，兼容独立仓）。
 */
const path = require('path');
const fs = require('fs');

/** 解析 @expo/metro-config/babel-transformer：pnpm 布局无顶层符号链接（传递依赖），
 *  直接指向 .pnpm 真实路径；独立仓库（顶层有）走常规 require。 */
function resolveExpoBabelTransformer() {
  try {
    return require('@expo/metro-config/babel-transformer');
  } catch {
    const pnpmDir = path.join(__dirname, 'node_modules/.pnpm');
    if (fs.existsSync(pnpmDir)) {
      const hit = fs.readdirSync(pnpmDir).find((n) => n.startsWith('@expo+metro-config@'));
      if (hit) {
        const entry = path.join(pnpmDir, hit, 'node_modules/@expo/metro-config/build/babel-transformer.js');
        if (fs.existsSync(entry)) return require(entry);
      }
    }
    throw new Error('[babel-transformer] 无法解析 @expo/metro-config/babel-transformer');
  }
}

const expoBabelTransformer = resolveExpoBabelTransformer();

// 归一化：剥首尾斜杠（appendBaseUrl 内部会自行处理）
const baseUrl = (process.env.EXPO_BASE_URL ?? '').replace(/^\/+|\/+$/g, '');

module.exports = {
  transform(args) {
    if (!baseUrl) return expoBabelTransformer.transform(args);
    const options = {
      ...args.options,
      customTransformOptions: {
        ...(args.options.customTransformOptions ?? {}),
        baseUrl,
      },
    };
    return expoBabelTransformer.transform({ ...args, options });
  },

  getCacheKey(options) {
    const key = expoBabelTransformer.getCacheKey(options);
    return baseUrl ? `${key}|baseUrl=${baseUrl}` : key;
  },
};

