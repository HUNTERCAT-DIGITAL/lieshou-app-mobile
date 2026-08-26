/**
 * Mobile 功能开关单测.
 */
import { enabledFeatures, isFeatureEnabled } from "./features";

describe("mobile feature flags", () => {
  it("approval 默认开启", () => {
    expect(isFeatureEnabled("approval")).toBe(true);
    expect(isFeatureEnabled("approval", null)).toBe(true);
  });

  it("未实现功能默认关闭", () => {
    expect(isFeatureEnabled("scan-stock")).toBe(false);
    expect(isFeatureEnabled("dark-mode")).toBe(false);
  });

  it("版别不影响默认值（覆盖表为空）", () => {
    expect(isFeatureEnabled("approval", "ZHIYE")).toBe(true);
    expect(isFeatureEnabled("lead-pool", "LEGALMIND")).toBe(true);
  });

  it("enabledFeatures 只返回开启项", () => {
    const on = enabledFeatures("GENERIC");
    expect(on).toContain("approval");
    expect(on).toContain("lead-pool");
    expect(on).not.toContain("scan-stock");
  });
});
