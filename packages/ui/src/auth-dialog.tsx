"use client";

import { useState, type FormEvent } from "react";
import { useTranslation } from "./localization";

export type AuthMode = "login" | "signup";
export type AuthRole = "learner" | "instructor" | "admin";

export interface AuthUser {
  name: string;
  email: string;
  role: AuthRole;
}

function isAuthRole(value: string): value is AuthRole {
  return value === "learner" || value === "instructor" || value === "admin";
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
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AuthRole>("learner");
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "signup" && !name.trim()) {
      setError(t("auth.nameRequired"));
      return;
    }
    if (!email.trim() || !password) {
      setError(t("auth.credentialsRequired"));
      return;
    }
    onAuthenticated({
      name: name.trim() || email.trim().split("@")[0] || "학습자",
      email: email.trim(),
      role,
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
          <label>
            {t("auth.demoRole")}
            <select
              value={role}
              onChange={(event) => {
                if (isAuthRole(event.target.value)) setRole(event.target.value);
              }}
            >
              <option value="learner">{t("auth.roleLearner")}</option>
              <option value="instructor">{t("auth.roleInstructor")}</option>
              <option value="admin">{t("auth.roleAdmin")}</option>
            </select>
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit">{mode === "login" ? t("actions.login") : t("actions.signup")}</button>
        </form>
        <p className="auth-demo-note">{t("auth.demoNote")}</p>
        <button
          className="auth-switch"
          type="button"
          onClick={() => {
            setError("");
            setMode((current) => current === "login" ? "signup" : "login");
          }}
        >
          {mode === "login" ? t("auth.signupSwitch") : t("auth.loginSwitch")}
        </button>
      </section>
    </div>
  );
}
