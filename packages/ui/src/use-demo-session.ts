"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AuthMode, AuthRole, AuthUser } from "./auth-dialog";

interface AuthCredentials {
  mode: AuthMode;
  email: string;
  password: string;
  name?: string;
}

interface DemoSession {
  user: AuthUser | null;
  ready: boolean;
  login: (credentials: AuthCredentials) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

const DemoSessionContext = createContext<DemoSession | null>(null);
let supabaseClient: SupabaseClient | undefined;

function getSupabaseAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Supabase authentication is not configured.");
  }

  supabaseClient ??= createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClient;
}

async function getProfile(authUserId: string): Promise<AuthUser> {
  const { data, error } = await getSupabaseAuthClient()
    .from("profiles")
    .select("email, full_name, role")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`프로필을 불러오지 못했습니다: ${error.message}`);
  }
  if (!data || typeof data.email !== "string" || typeof data.full_name !== "string") {
    throw new Error("인증 계정과 연결된 프로필이 없습니다. 관리자에게 계정 연결을 요청하세요.");
  }

  const role: AuthRole | null =
    data.role === "admin"
      ? "admin"
      : data.role === "instructor"
        ? "instructor"
        : data.role === "student" || data.role === "learner"
          ? "learner"
          : null;
  if (!role) throw new Error("프로필에 허용되지 않은 역할이 설정되어 있습니다.");

  return { name: data.full_name, email: data.email, role };
}

function useDemoSessionState() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let authClient: SupabaseClient;

    try {
      localStorage.removeItem("classmate-demo-session");
    } catch (error) {
      console.warn("Could not clear obsolete demo session", error);
    }

    try {
      authClient = getSupabaseAuthClient();
    } catch (error) {
      console.error("Could not initialize Supabase Auth", error);
      setReady(true);
      return;
    }

    const syncSession = async (session: Awaited<ReturnType<typeof authClient.auth.getSession>>["data"]["session"]) => {
      if (!session) {
        if (active) {
          setUser(null);
          setReady(true);
        }
        return;
      }

      try {
        const profile = await getProfile(session.user.id);
        if (active) setUser(profile);
      } catch (error) {
        console.error("Could not resolve authenticated profile", error);
        await authClient.auth.signOut();
        if (active) setUser(null);
      } finally {
        if (active) setReady(true);
      }
    };

    const { data: { subscription } } = authClient.auth.onAuthStateChange(
      (_event, session) => {
        void Promise.resolve().then(() => syncSession(session));
      },
    );

    void authClient.auth.getSession().then(({ data, error }) => {
      if (error) throw error;
      return syncSession(data.session);
    }).catch((error: unknown) => {
      console.error("Could not restore Supabase Auth session", error);
      if (active) setReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async ({ mode, email, password, name }: AuthCredentials) => {
    const authClient = getSupabaseAuthClient();
    const trimmedEmail = email.trim();

    // [데모용 간편 로그인] 비밀번호가 '0000'인 경우 profiles 테이블에서 직접 조회
    if (password === "0000") {
      const { data: profileData, error } = await authClient
        .from("profiles")
        .select("email, full_name, role")
        .eq("email", trimmedEmail)
        .maybeSingle();

      if (error || !profileData) {
        throw new Error("등록되지 않은 가상 사용자 이메일입니다.");
      }

      const role: AuthRole =
        profileData.role === "admin"
          ? "admin"
          : profileData.role === "instructor"
            ? "instructor"
            : "learner";

      const demoUser: AuthUser = {
        name: profileData.full_name,
        email: profileData.email,
        role,
      };

      setUser(demoUser);
      return demoUser;
    }

    // 일반 Supabase Auth 로그인/회원가입 처리
    const result = mode === "signup"
      ? await authClient.auth.signUp({
          email: trimmedEmail,
          password,
          options: { data: { full_name: name?.trim() ?? "" } },
        })
      : await authClient.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

    if (result.error) throw new Error("이메일 또는 비밀번호를 확인해 주세요.");
    if (!result.data.session || !result.data.user) {
      if (mode === "signup") return null;
      throw new Error("로그인 세션을 생성하지 못했습니다.");
    }

    try {
      const profile = await getProfile(result.data.user.id);
      setUser(profile);
      return profile;
    } catch (error) {
      await authClient.auth.signOut();
      setUser(null);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await getSupabaseAuthClient().auth.signOut();
    setUser(null);
  }, []);

  return { user, ready, login, logout };
}

export function DemoSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const session = useDemoSessionState();
  return createElement(DemoSessionContext.Provider, { value: session }, children);
}

export function useDemoSession(): DemoSession {
  const session = useContext(DemoSessionContext);
  if (!session) {
    throw new Error("useDemoSession must be used within DemoSessionProvider");
  }
  return session;
}