"use client";

import { memo, useCallback, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { useTranslation } from "@classmate/ui/localization";

interface ChatComposerProps {
  connected: boolean;
  onSend: (text: string) => boolean;
}

export const ChatComposer = memo(function ChatComposer({
  connected,
  onSend,
}: ChatComposerProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setText(event.target.value),
    [],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (onSend(text)) setText("");
    },
    [onSend, text],
  );

  return (
    <form className="chat-compose" onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={handleChange}
        placeholder={t("chat.placeholder")}
        maxLength={2000}
        aria-label={t("chat.messageLabel")}
      />
      <button aria-label={t("chat.send")} disabled={!text.trim() || !connected}>
        <Send size={17} />
      </button>
      <span>Enter ↵</span>
    </form>
  );
});
