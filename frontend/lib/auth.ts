const TOKEN_KEY = "token";
const USER_KEY = "user";

export const AUTH_CHANGED_EVENT = "auth-changed";

export type AuthUser = {
  id: number;
  email: string;
  display_name: string;
};

function notifyAuthChanged(): void {
  try {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  } catch {
    // SSR やイベント不可環境では無視
  }
}

export function setAuth(token: string, user: AuthUser): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // localStorage 不可（プライベートモード等）は無視
  }
  notifyAuthChanged();
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // 無視
  }
  notifyAuthChanged();
}
