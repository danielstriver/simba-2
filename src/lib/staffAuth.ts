import { useState } from "react";
import { User } from "@/lib/store";

const KEY = "simba-staff-session";

export function getStaffSession(): User | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); }
  catch { return null; }
}

function persistStaffSession(user: User | null): void {
  if (user) localStorage.setItem(KEY, JSON.stringify(user));
  else localStorage.removeItem(KEY);
}

export function useStaffUser() {
  const [staffUser, setStaffUser] = useState<User | null>(() => getStaffSession());

  function signIn(user: User) {
    persistStaffSession(user);
    setStaffUser(user);
  }

  function signOut() {
    persistStaffSession(null);
    setStaffUser(null);
  }

  return { staffUser, signIn, signOut };
}
