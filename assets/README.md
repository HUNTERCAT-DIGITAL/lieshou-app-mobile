# Mobile Assets

Expo 应用图标、启动屏、自适应图标存放目录。

## 当前状态

**Phase 1 占位** —— 此目录暂无图。`expo start` 使用 Expo 默认占位图；不影响开发体验。

## 首次 build 前请补

`expo prebuild` / `eas build` 之前，请放入以下文件（1024×1024 PNG，≤1MB）：

- `icon.png` —— 应用图标（iOS + Android 共用）
- `splash.png` —— 启动屏
- `adaptive-icon.png` —— Android 自适应图标前景层
- `favicon.png` —— Web favicon

## 推荐工具

- 设计稿 → [Figma](https://figma.com) / Sketch
- 一键生成：[https://www.appicon.co/](https://www.appicon.co/)
- Expo 官方工具：`npx expo-asset`

## 配色

主题色 `#1677ff`（与 antd 默认主蓝对齐）。`adaptiveIcon.backgroundColor` 已在 `app.json` 设置为该值。