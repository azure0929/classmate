"use client";

interface LogoutConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutConfirmDialog({
  onConfirm,
  onCancel,
}: LogoutConfirmDialogProps) {
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
        <h2 id="logout-confirm-title">로그아웃 하시겠습니까?</h2>
        <p id="logout-confirm-description">로그아웃 후에도 현재 보고 있는 페이지는 유지됩니다.</p>
        <div className="logout-confirm-actions">
          <button type="button" className="logout-confirm-cancel" onClick={onCancel}>
            닫기
          </button>
          <button type="button" className="logout-confirm-submit" onClick={onConfirm}>
            확인
          </button>
        </div>
      </section>
    </div>
  );
}
