export interface RegisteredUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  noShowCount: number;
  createdAt: string;
}

const USERS_KEY = "simba-users";

function hashPw(pw: string): string {
  return btoa(`${pw}:simba2025salt`);
}

function readUsers(): RegisteredUser[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
  catch { return []; }
}

function writeUsers(users: RegisteredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export type AuthResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function register(
  name: string, phone: string, email: string, password: string
): AuthResult<RegisteredUser> {
  const trimmedEmail = email.toLowerCase().trim();
  if (!name.trim()) return { ok: false, error: "Full name is required" };
  if (!trimmedEmail.includes("@")) return { ok: false, error: "Enter a valid email address" };
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters" };

  const users = readUsers();
  if (users.find(u => u.email === trimmedEmail)) {
    return { ok: false, error: "An account with this email already exists. Sign in instead." };
  }

  const user: RegisteredUser = {
    id: (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)),
    name: name.trim(),
    phone: phone.trim(),
    email: trimmedEmail,
    passwordHash: hashPw(password),
    noShowCount: 0,
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  return { ok: true, data: user };
}

export function login(email: string, password: string): AuthResult<RegisteredUser> {
  const trimmedEmail = email.toLowerCase().trim();
  const users = readUsers();
  const user = users.find(u => u.email === trimmedEmail);
  if (!user) return { ok: false, error: "No account found with this email address" };
  if (user.passwordHash !== hashPw(password)) return { ok: false, error: "Incorrect password. Try again." };
  return { ok: true, data: user };
}

export function requestReset(email: string): AuthResult<string> {
  const trimmedEmail = email.toLowerCase().trim();
  const users = readUsers();
  if (!users.find(u => u.email === trimmedEmail)) {
    return { ok: false, error: "No account found with this email address" };
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  try {
    sessionStorage.setItem(
      `simba_reset:${trimmedEmail}`,
      JSON.stringify({ code, exp: Date.now() + 10 * 60 * 1000 })
    );
  } catch { /* storage unavailable */ }
  return { ok: true, data: code };
}

export function confirmReset(email: string, code: string, newPassword: string): AuthResult<void> {
  if (newPassword.length < 6) return { ok: false, error: "Password must be at least 6 characters" };
  const trimmedEmail = email.toLowerCase().trim();
  try {
    const raw = sessionStorage.getItem(`simba_reset:${trimmedEmail}`);
    if (!raw) return { ok: false, error: "Reset code not found. Request a new one." };
    const { code: stored, exp } = JSON.parse(raw) as { code: string; exp: number };
    if (Date.now() > exp) {
      sessionStorage.removeItem(`simba_reset:${trimmedEmail}`);
      return { ok: false, error: "Reset code expired. Request a new one." };
    }
    if (code.trim() !== stored) return { ok: false, error: "Incorrect code. Check and try again." };
    writeUsers(readUsers().map(u =>
      u.email === trimmedEmail ? { ...u, passwordHash: hashPw(newPassword) } : u
    ));
    sessionStorage.removeItem(`simba_reset:${trimmedEmail}`);
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "Something went wrong. Try again." };
  }
}

export function getNoShowCount(userId: string): number {
  return readUsers().find(u => u.id === userId)?.noShowCount ?? 0;
}

export function incrementNoShow(userId: string): void {
  writeUsers(readUsers().map(u =>
    u.id === userId ? { ...u, noShowCount: u.noShowCount + 1 } : u
  ));
}

export function getDepositAmount(userId: string): number {
  const n = getNoShowCount(userId);
  if (n >= 3) return 2000;
  if (n >= 1) return 1000;
  return 500;
}
