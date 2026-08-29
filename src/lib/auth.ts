/**
 * 移动端 · 登录态与 API 访问（端自身实现 · 零上游共享依赖）
 * 存储走 AsyncStorage（RN 无 localStorage），HTTP 走内置 fetch。
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'lsc_mobile_access_token';
const REFRESH_KEY = 'lsc_mobile_refresh_token';
const USER_KEY = 'lsc_mobile_user';

/** API 网关地址（构建期 EXPO_PUBLIC_API_BASE 注入；真机/模拟器必须绝对 URL） */
const API_BASE =
  (process.env.EXPO_PUBLIC_API_BASE as string | undefined)?.replace(/\/+$/, '') ??
  'https://dev.lieshoucloud.huntercat.cn';

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function isLoggedIn(): Promise<boolean> {
  return !!(await AsyncStorage.getItem(TOKEN_KEY));
}

export interface SessionUser {
  username?: string;
  displayName?: string;
  tenantCode?: string;
  tenantName?: string;
}

export async function getUser(): Promise<SessionUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

async function persistSession(
  data: { accessToken: string; refreshToken?: string } & SessionUser,
): Promise<void> {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, data.accessToken],
    ...(data.refreshToken ? ([[REFRESH_KEY, data.refreshToken]] as const) : []),
    [
      USER_KEY,
      JSON.stringify({
        username: data.username,
        displayName: data.displayName,
        tenantCode: data.tenantCode,
        tenantName: data.tenantName,
      }),
    ],
  ]);
}

/** 登录（POST /api/auth/login） */
export async function login(
  username: string,
  password: string,
  tenantCode?: string,
): Promise<SessionUser> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, tenantCode }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `登录失败（HTTP ${res.status}）`);
  }
  const data = (await res.json()) as {
    accessToken: string;
    refreshToken?: string;
    username?: string;
    displayName?: string;
    tenantCode?: string;
    tenantName?: string;
  };
  await persistSession(data);
  return data;
}

/** 当前用户（GET /api/auth/me · 同时验证 token 有效性/连通性） */
export async function fetchMe(): Promise<SessionUser> {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token ?? ''}` },
  });
  if (res.status === 401) {
    await logout();
    throw new Error('登录已过期，请重新登录');
  }
  if (!res.ok) {
    throw new Error(`获取当前用户失败（HTTP ${res.status}）`);
  }
  const me = (await res.json()) as SessionUser;
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
  return me;
}

export async function logout(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY, USER_KEY]);
}
