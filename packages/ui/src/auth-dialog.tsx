"use client";

import { useState, type FormEvent } from "react";

export type AuthMode = "login" | "signup";

export interface AuthUser {
  name: string;
  email: string;
}

interface AuthDialogProps {
  onAuthenticated: (user: AuthUser) => void;
  onClose: () => void;
  initialMode?: AuthMode;
}

export function AuthDialog({
  onAuthenticated,
  onClose,
  initialMode = "login",
}: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "signup" && !name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    onAuthenticated({
      name: name.trim() || email.trim().split("@")[0] || "학습자",
      email: email.trim(),
    });
  };

  return (
    <div className="auth-backdrop" role="presentation" onClick={onClose}>
      <section
        className="auth-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="auth-close" type="button" onClick={onClose} aria-label="닫기">×</button>
        <span className="auth-eyebrow">CLASSMATE STUDIO</span>
        <h2 id="auth-title">{mode === "login" ? "다시 만나 반가워요" : "함께 배움을 시작해요"}</h2>
        <p className="auth-description">
          {mode === "login" ? "계정에 로그인하고 클래스 운영을 이어가세요." : "계정을 만들고 나만의 클래스를 운영해보세요."}
        </p>
        <form className="auth-form" onSubmit={submit}>
          {mode === "signup" && (
            <label>이름<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required /></label>
          )}
          <label>이메일<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>비밀번호<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={1} /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit">{mode === "login" ? "로그인" : "회원가입"}</button>
        </form>
        <p className="auth-demo-note">데모 인증입니다. 비밀번호는 저장하거나 전송하지 않습니다.</p>
        <button
          className="auth-switch"
          type="button"
          onClick={() => {
            setError("");
            setMode((current) => current === "login" ? "signup" : "login");
          }}
        >
          {mode === "login" ? "아직 계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
        </button>
      </section>
    </div>
  );
}
