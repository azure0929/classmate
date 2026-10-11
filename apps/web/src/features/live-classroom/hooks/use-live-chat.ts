"use client";

import { useCallback, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import type {
  ChatMessage,
  ClientToServerEvents,
  ServerToClientEvents,
} from "@classmate/realtime-types";

export type RealtimeSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

interface UseLiveChatResult {
  messages: ChatMessage[];
  connected: boolean;
  participantCount: number;
  sendMessage: (text: string) => boolean;
  editMessage: (messageId: string, text: string) => boolean;
  deleteMessage: (messageId: string) => void;
}

export function useLiveChat(
  socket: RealtimeSocket | null,
  roomId: string,
  author = "지민",
): UseLiveChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setConnected(true);
      socket.emit("room:join", roomId);
    };
    const handleDisconnect = () => setConnected(false);
    const handleHistory = (history: ChatMessage[]) => setMessages(history);
    const handleNewMessage = (message: ChatMessage) => {
      setMessages((current) => [...current.slice(-99), message]);
    };
    const handleUpdatedMessage = (message: ChatMessage) => {
      setMessages((current) =>
        current.map((item) => (item.id === message.id ? message : item)),
      );
    };
    const handleDeletedMessage = ({
      roomId: deletedRoomId,
      messageId,
    }: {
      roomId: string;
      messageId: string;
    }) => {
      if (deletedRoomId !== roomId) return;
      setMessages((current) => current.filter((item) => item.id !== messageId));
    };
    const handleParticipantCount = (count: number) =>
      setParticipantCount(count);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chat:history", handleHistory);
    socket.on("chat:new", handleNewMessage);
    socket.on("chat:updated", handleUpdatedMessage);
    socket.on("chat:deleted", handleDeletedMessage);
    socket.on("room:count", handleParticipantCount);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chat:history", handleHistory);
      socket.off("chat:new", handleNewMessage);
      socket.off("chat:updated", handleUpdatedMessage);
      socket.off("chat:deleted", handleDeletedMessage);
      socket.off("room:count", handleParticipantCount);
    };
  }, [roomId, socket]);

  const sendMessage = useCallback(
    (text: string) => {
      const message = text.trim();
      if (!message || !socket?.connected) return false;

      socket.emit("chat:send", {
        roomId,
        author,
        text: message,
      });
      return true;
    },
    [author, roomId, socket],
  );

  const editMessage = useCallback(
    (messageId: string, text: string) => {
      const message = text.trim();
      const ownMessage = messages.find((item) => item.id === messageId);
      if (
        !message ||
        message.length > 2000 ||
        !socket?.connected ||
        ownMessage?.senderId !== socket.id
      ) {
        return false;
      }
      socket.emit("chat:edit", { roomId, messageId, text: message });
      return true;
    },
    [messages, roomId, socket],
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      const ownMessage = messages.find((item) => item.id === messageId);
      if (!socket?.connected || ownMessage?.senderId !== socket.id) return;
      socket.emit("chat:delete", { roomId, messageId });
    },
    [messages, roomId, socket],
  );

  return {
    messages,
    connected,
    participantCount,
    sendMessage,
    editMessage,
    deleteMessage,
  };
}
