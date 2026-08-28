/**
 * (main) 路由清单一致性测试：防止新增页面漏登记导致意外变成底部 tab.
 *
 * 双向断言：
 *  1. 文件系统 app/(main)/ 下每个路由 → 必须在 GENERIC_MAIN_ROUTES 中（漏登记即失败）
 *  2. 清单每一项 → 必须能在文件系统找到（路由名写错即失败）
 */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { GENERIC_MAIN_ROUTES } from "./mainRoutes";

/** 文件相对路径 → expo-router 路由名（index 特例：customers/index → customers） */
function routeNameFromFile(rel: string): string {
  const withoutExt = rel.replace(/\.tsx?$/, "");
  return withoutExt.endsWith("/index") ? withoutExt.slice(0, -"/index".length) : withoutExt;
}

/** 递归收集 app/(main)/ 下全部路由名（排除 _layout；排除客户注入目录 daizhang/ 等 —— 槽位路由不参与通用清单一致性） */
function collectFileRoutes(dir: string, prefix = ""): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "_layout.tsx") continue;
    // 客户注入槽位（deploy:prepare 生成的薄壳页，如 daizhang/workspace）不属于通用路由清单
    if (entry === "daizhang" || entry === "legalmind" || entry === "dwjk") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectFileRoutes(full, `${prefix}${entry}/`));
    } else if (entry.endsWith(".tsx")) {
      out.push(routeNameFromFile(`${prefix}${entry}`));
    }
  }
  return out;
}

describe("(main) 路由清单一致性", () => {
  const mainDir = join(__dirname, "../../app/(main)");
  const fileRoutes = collectFileRoutes(mainDir).sort();

  it("每个文件路由都已登记（漏登记 → 意外变 tab）", () => {
    const known = new Set(GENERIC_MAIN_ROUTES);
    const missing = fileRoutes.filter((r) => !known.has(r));
    expect(missing).toEqual([]);
  });

  it("清单每一项都有对应文件（路由名写错 → expo-router 报错）", () => {
    const onDisk = new Set(fileRoutes);
    const orphan = GENERIC_MAIN_ROUTES.filter((r) => !onDisk.has(r));
    expect(orphan).toEqual([]);
  });

  it("清单与文件系统完全一致", () => {
    expect([...GENERIC_MAIN_ROUTES].sort()).toEqual(fileRoutes);
  });
});
