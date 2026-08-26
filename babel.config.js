module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // SDK 57 / Reanimated 4: babel-preset-expo 检测到 react-native-worklets 后
    // 自动添加 worklets/reanimated babel 插件（手动加 react-native-reanimated/plugin
    // 会与 v4 的 worklets 插件冲突），因此这里不再手动配置。
  };
};