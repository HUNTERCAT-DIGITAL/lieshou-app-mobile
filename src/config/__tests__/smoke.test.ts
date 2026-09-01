/**
 * 冒烟测试（jest-expo）：验证测试链路 + editions 装配 + 版本常量解析
 * 注：客户仓 prepare 会覆盖 extra.ts（品牌/品牌名注入），故不断言具体品牌值，只锁结构。
 */
import { getEdition } from '../editions';
import { APP_VERSION } from '../version';

describe('冒烟', () => {
  it('版本常量可解析', () => {
    expect(APP_VERSION).toBe('0.0.1');
  });

  it('getEdition 返回可用版别配置（generic 或客户注入）', () => {
    const e = getEdition();
    expect(typeof e.id).toBe('string');
    expect(e.brandName.length).toBeGreaterThan(0);
    expect(typeof e.login?.required).toBe('boolean');
  });
});
