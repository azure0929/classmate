"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Button, Group, Modal, Stack, Text, ThemeIcon } from "@mantine/core";
import { LockKeyhole } from "lucide-react";
import { AuthDialog, type AuthUser } from "./auth-dialog";
import { useDemoSession } from "./use-demo-session";
import { useTranslation } from "./localization";

type LoginRequest = (afterLogin?: () => void) => void;
const LoginRequiredContext = createContext<LoginRequest | null>(null);

interface LoginRequiredProviderProps {
  children: ReactNode;
}

export function LoginRequiredProvider({ children }: LoginRequiredProviderProps) {
  const { login, user } = useDemoSession();
  const { t } = useTranslation();
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [afterLogin, setAfterLogin] = useState<(() => void) | undefined>();

  const requestLogin = useCallback<LoginRequest>(
    (callback) => {
      if (user) {
        callback?.();
        return;
      }
      setAfterLogin(() => callback);
      setNoticeOpen(true);
    },
    [user],
  );

  const contextValue = useMemo(() => requestLogin, [requestLogin]);

  const completeLogin = (nextUser: AuthUser) => {
    login(nextUser);
    setAuthOpen(false);
    setNoticeOpen(false);
    afterLogin?.();
    setAfterLogin(undefined);
  };

  return (
    <LoginRequiredContext.Provider value={contextValue}>
      {children}
      <Modal
        opened={noticeOpen}
        onClose={() => setNoticeOpen(false)}
        title={t("auth.requiredTitle")}
        centered
        size="sm"
        radius="lg"
        overlayProps={{ backgroundOpacity: 0.58, blur: 4 }}
      >
        <Stack align="center" gap="md" pb="xs">
          <ThemeIcon size={58} radius="xl" variant="light" color="forest">
            <LockKeyhole size={26} />
          </ThemeIcon>
          <Text ta="center" c="dimmed" size="sm" maw={310}>
            {t("auth.requiredDescription")}
          </Text>
          <Group grow w="100%" mt="xs">
            <Button variant="default" onClick={() => setNoticeOpen(false)}>
              {t("auth.continueAsGuest")}
            </Button>
            <Button
              color="forest"
              onClick={() => {
                setNoticeOpen(false);
                setAuthOpen(true);
              }}
            >
              {t("auth.continueToLogin")}
            </Button>
          </Group>
        </Stack>
      </Modal>
      {authOpen && (
        <AuthDialog
          initialMode="login"
          onAuthenticated={completeLogin}
          onClose={() => setAuthOpen(false)}
        />
      )}
    </LoginRequiredContext.Provider>
  );
}

export function useLoginRequired(): LoginRequest {
  const requestLogin = useContext(LoginRequiredContext);
  if (!requestLogin) {
    throw new Error("useLoginRequired must be used within LoginRequiredProvider");
  }
  return requestLogin;
}
