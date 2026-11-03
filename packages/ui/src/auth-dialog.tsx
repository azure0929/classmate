"use client";

import { useState, type FormEvent } from "react";
import { useTranslation } from "./localization";
import { useDemoSession } from "./use-demo-session";

export type AuthMode = "login" | "signup";
export type AuthRole = "learner" | "instructor" | "admin";

export interface AuthUser {
  name: string;
  email: string;
  role: AuthRole;
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
  const { t } = useTranslation();
  const { login } = useDemoSession();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "signup" && !name.trim()) {
      setError(t("auth.nameRequired"));
      return;
    }
    if (!email.trim() || !password) {
      setError(t("auth.credentialsRequired"));
      return;
    }
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const authenticatedUser = await login({
        mode,
        email: email.trim(),
        password,
        name: name.trim(),
      });
      if (!authenticatedUser) {
        setNotice(t("auth.emailConfirmationRequired"));
        return;
      }
      onAuthenticated(authenticatedUser);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "인증에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
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
        <button className="auth-close" type="button" onClick={onClose} aria-label={t("actions.close")}>×</button>
        <span className="auth-eyebrow">CLASSMATE STUDIO</span>
        <h2 id="auth-title">{mode === "login" ? t("auth.welcome") : t("auth.signupWelcome")}</h2>
        <p className="auth-description">
          {mode === "login" ? t("auth.loginDescription") : t("auth.signupDescription")}
        </p>
        <form className="auth-form" onSubmit={submit}>
          {mode === "signup" && (
            <label>{t("auth.name")}<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required /></label>
          )}
          <label>{t("auth.email")}<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>{t("auth.password")}<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={1} /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "확인 중…" : mode === "login" ? t("actions.login") : t("actions.signup")}</button>
        </form>
        <p className="auth-demo-note" role={notice ? "status" : undefined}>{notice || t("auth.demoNote")}</p>
        <button
          className="auth-switch"
          type="button"
          onClick={() => {
            setError("");
            setNotice("");
            setMode((current) => current === "login" ? "signup" : "login");
          }}
        >
          {mode === "login" ? t("auth.signupSwitch") : t("auth.loginSwitch")}
        </button>
      </section>
    </div>
  );
}
