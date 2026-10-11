"use client";

import { useState } from "react";
import { AuthDialog, type AuthMode, type AuthUser } from "./auth-dialog";
import { LogoutConfirmDialog } from "./logout-confirm-dialog";
import { useDemoSession } from "./use-demo-session";

interface AccountMenuProps {
  onAuthenticated?: (user: AuthUser) => void;
  onLoggedOut?: () => void;
}

const roleLabels = {
  learner: "학습자",
  instructor: "강사",
  admin: "관리자",
} as const;

export function AccountMenu({
  onAuthenticated,
  onLoggedOut,
}: AccountMenuProps) {
  const { user, ready, login, logout } = useDemoSession();
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
      <div className="profile-control">
        {!ready ? (
          <button className="avatar" type="button" disabled aria-label="계정 확인 중">
            …
          </button>
        ) : user ? (
          <>
            <button
              className="avatar"
              type="button"
              aria-label="내 프로필 메뉴"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((open) => !open)}
            >
              {user.name.slice(0, 1)}
            </button>
            {profileOpen && (
              <div className="profile-dropdown">
                <strong>{user.name}</strong>
                <small>{roleLabels[user.role]}</small>
                <small>{user.email}</small>
                <button type="button" onClick={() => setConfirmLogout(true)}>
                  로그아웃
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="account-auth-actions">
            <button type="button" onClick={() => openAuth("login")}>로그인</button>
            <button type="button" onClick={() => openAuth("signup")}>회원가입</button>
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
