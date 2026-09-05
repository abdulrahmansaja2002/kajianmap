"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import type { AuthUser } from "@/lib/auth-store";

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

/** On success, immediately persists the session via `useAuth().login` so
 *  every other hook (e.g. `useCreateKajianMutation`) can read the token
 *  right away — no extra round trip or manual store wiring needed at the
 *  call site. */
// This is no longer needed since we are using the cookie now
// but, the old code is kept here for reference, use useAuth from useAuth.old.ts instead
// export function useLoginMutation() {
//   const { login } = useAuth();

//   return useMutation({
//     mutationFn: (input: LoginInput) =>
//       apiFetch<LoginResponse>("/api/auth/login", { method: "POST", body: input }),
//     onSuccess: (data) => {
//       login(data.token, data.user);
//     },
//   });
// }

export function useLoginMutation() {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<LoginResponse>("/api/auth/login", { method: "POST", body: input }),
    onSuccess: (data) => setUser(data.user),
  });
}