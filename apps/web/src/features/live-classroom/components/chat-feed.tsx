"use client";

import { memo, useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import type { ChatMessage } from "@classmate/realtime-types";

interface ChatFeedProps {
  messages: ChatMessage[];
  currentUserId: string;
  onEdit: (messageId: string, text: string) => boolean;
  onDelete: (messageId: string) => void;
}

interface ChatMessageRowProps {
  message: ChatMessage;
  isMine: boolean;
  onEdit: (messageId: string, text: string) => boolean;
  onDelete: (messageId: string) => void;
}

const ChatMessageRow = memo(function ChatMessageRow({
  message,
  isMine,
  onEdit,
  onDelete,
}: ChatMessageRowProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(message.text);
  useEffect(() => {
    if (!editing) setText(message.text);
  }, [editing, message.text]);

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onEdit(message.id, text)) setEditing(false);
  }, [message.id, onEdit, text]);

  return (
    <div className={`chat-message${isMine ? " chat-message--mine" : ""}`}>
      <span className="chat-avatar">{message.author.slice(0, 1)}</span>
      <div>
        <div className="chat-message-heading">
          <b>{message.author}</b>
          {isMine && !editing && (
            <div className="chat-message-actions">
              <button
                type="button"
                aria-label="메시지 수정"
                onClick={() => {
                  setText(message.text);
                  setEditing(true);
                }}
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                aria-label="메시지 삭제"
                onClick={() => onDelete(message.id)}
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
        {editing ? (
          <form className="chat-message-edit" onSubmit={handleSubmit}>
            <input
              aria-label="메시지 수정 내용"
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={2000}
              autoFocus
            />
            <button type="submit" aria-label="수정 저장" disabled={!text.trim()}>
              <Check size={15} />
            </button>
            <button type="button" aria-label="수정 취소" onClick={() => setEditing(false)}>
              <X size={15} />
            </button>
          </form>
        ) : (
          <p>{message.text}</p>
        )}
        <small>
          {new Date(message.createdAt).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {message.editedAt && <span className="chat-message-edited"> · 수정됨</span>}
        </small>
      </div>
    </div>
  );
});

export const ChatFeed = memo(function ChatFeed({
  messages,
  currentUserId,
  onEdit,
  onDelete,
}: ChatFeedProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-feed" aria-live="polite" aria-relevant="additions">
      <div className="chat-date">오늘 오후 8:00</div>
      <div className="chat-message chat-message--system">
        클래스에 오신 걸 환영해요! 편하게 인사 나눠보세요 👋
      </div>
      {messages.map((message) => (
        <ChatMessageRow
          key={message.id}
          message={message}
          isMine={message.senderId === currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
});
