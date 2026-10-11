"use client";

import { useState } from "react";
import { AuthDialog, type AuthMode, type AuthUser } from "./auth-dialog";
import { LogoutConfirmDialog } from "./logout-confirm-dialog";
import { useDemoSession } from "./use-demo-session";
import { LanguageSwitcher, useTranslation } from "./localization";

interface AccountMenuProps {
  onAuthenticated?: (user: AuthUser) => void;
  onLoggedOut?: () => void;
}

export function AccountMenu({
  onAuthenticated,
  onLoggedOut,
}: AccountMenuProps) {
  const { user, ready, login, logout } = useDemoSession();
  const { t } = useTranslation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showAuth, setShowAuth] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const openAuth = (mode: AuthMode) => {
    setProfileOpen(false);
    setAuthMode(mode);
    setShowAuth(true);
  };

  const handleAuth = (nextUser: AuthUser) => {
    login(nextUser);
    setShowAuth(false);
    onAuthenticated?.(nextUser);
  };

  const handleLogout = () => {
    logout();
    setConfirmLogout(false);
    setProfileOpen(false);
    onLoggedOut?.();
  };

  return (
    <>
      <LanguageSwitcher />
      <div className="profile-control">
        {!ready ? (
          <button className="avatar" type="button" disabled aria-label={t("account.checking")}>
            …
          </button>
        ) : user ? (
          <>
            <button
              className="avatar"
              type="button"
              aria-label={t("account.profile")}
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((open) => !open)}
            >
              {user.name.slice(0, 1)}
            </button>
            {profileOpen && (
              <div className="profile-dropdown">
                <strong>{user.name}</strong>
                <small>{t(`auth.role${user.role[0].toUpperCase()}${user.role.slice(1)}`)}</small>
                <small>{user.email}</small>
                <button type="button" onClick={() => setConfirmLogout(true)}>
                  {t("account.logout")}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="account-auth-actions">
            <button type="button" onClick={() => openAuth("login")}>{t("actions.login")}</button>
            <button type="button" onClick={() => openAuth("signup")}>{t("actions.signup")}</button>
          </div>
        )}
      </div>
      {showAuth && (
        <AuthDialog
          initialMode={authMode}
          onAuthenticated={handleAuth}
          onClose={() => setShowAuth(false)}
        />
      )}
      {confirmLogout && (
        <LogoutConfirmDialog
          onCancel={() => setConfirmLogout(false)}
          onConfirm={handleLogout}
        />
      )}
    </>
  );
}
