/**
 * Mobile 埋点框架单测.
 * dev 模式 track 走 console.debug，不抛异常、不影响业务。
 */
import { EVENTS, track } from "./analytics";

describe("mobile analytics", () => {
  const originalDebug = console.debug;

  afterEach(() => {
    console.debug = originalDebug;
    jest.restoreAllMocks();
  });

  it("事件常量已定义（业务代码引用入口）", () => {
    expect(EVENTS.LOGIN_SUCCESS).toBe("mobile.login_success");
    expect(EVENTS.APPROVAL_CREATED).toBe("mobile.approval_created");
    expect(EVENTS.LOGOUT).toBe("mobile.logout");
  });

  it("track 在 dev 下输出 debug 且不抛错", () => {
    const debug = jest.fn();
    console.debug = debug;
    expect(() => track(EVENTS.LOGIN_SUCCESS, { username: "admin" })).not.toThrow();
    expect(debug).toHaveBeenCalled();
  });

  it("track 内部异常不影响调用方（吞错）", () => {
    console.debug = () => {
      throw new Error("boom");
    };
    expect(() => track(EVENTS.LOGIN_SUCCESS)).not.toThrow();
  });
});
