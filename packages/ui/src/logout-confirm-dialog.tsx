"use client";

import { useTranslation } from "./localization";

interface LogoutConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutConfirmDialog({
  onConfirm,
  onCancel,
}: LogoutConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <div className="logout-confirm-backdrop" role="presentation">
      <section
        className="logout-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        aria-describedby="logout-confirm-description"
      >
        <div className="logout-confirm-icon">!</div>
        <h2 id="logout-confirm-title">{t("logout.title")}</h2>
        <p id="logout-confirm-description">{t("logout.description")}</p>
        <div className="logout-confirm-actions">
          <button type="button" className="logout-confirm-cancel" onClick={onCancel}>
            {t("logout.cancel")}
          </button>
          <button type="button" className="logout-confirm-submit" onClick={onConfirm}>
            {t("logout.confirm")}
          </button>
        </div>
      </section>
    </div>
  );
}
