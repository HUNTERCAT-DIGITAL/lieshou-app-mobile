/**
 * Mobile auth store 单测（Phase 9 · 多端真实化）.
 */
import { useAuthStore } from "../stores/auth";

// 移动端用 RN（jest-expo preset 默认 environment 是 node，不像 admin jsdom）。
// 这里只测 store 的纯逻辑：set / get 状态；不触发 fetchMe 异步副作用。

describe("mobile auth store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it("初始 isAuthenticated=false", () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it("logout 清空全部", () => {
    useAuthStore.setState({
      accessToken: "a",
      refreshToken: "r",
      user: { userId: 1, username: "u", roles: [] },
      isAuthenticated: true,
    });
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it("fetchMe 抛错时会 reject（store 不吞 fetchMe 自身的错）", async () => {
    // fetchMe 本身是裸 promise，错误向上抛；是 login()/.fetchMe() 在调用方
    // 才决定吞 / 不吞。验证 fetchMe 抛错时的行为。
    await expect(useAuthStore.getState().fetchMe()).rejects.toBeDefined();
  });
});
