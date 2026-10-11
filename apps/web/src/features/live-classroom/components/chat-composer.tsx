"use client";

import { memo, useCallback, useState, type FormEvent } from "react";
import { Send } from "lucide-react";

interface ChatComposerProps {
  connected: boolean;
  onSend: (text: string) => boolean;
}

export const ChatComposer = memo(function ChatComposer({
  connected,
  onSend,
}: ChatComposerProps) {
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
        placeholder="따뜻한 한마디를 남겨보세요"
        maxLength={2000}
        aria-label="채팅 메시지"
      />
      <button aria-label="메시지 보내기" disabled={!text.trim() || !connected}>
        <Send size={17} />
      </button>
      <span>Enter ↵</span>
    </form>
  );
});
