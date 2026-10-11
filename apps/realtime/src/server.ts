import cors from "cors";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { Server } from "socket.io";
import type {
  ChatMessage,
  ClientToServerEvents,
  CourseQuestion,
  ServerToClientEvents,
} from "@classmate/realtime-types";

const port = Number(process.env.REALTIME_PORT ?? 4001);
const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.WEB_ORIGIN?.split(",") ?? [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST"],
  },
});
const messageHistory = new Map<string, ChatMessage[]>();
const courseQuestions = new Map<string, CourseQuestion[]>();

function courseQaRoom(courseId: string) {
  return `course-qa:${courseId}`;
}

io.on("connection", (socket) => {
  socket.on("room:join", (roomId) => {
    if (!roomId.trim() || roomId.length > 100) return;
    const peers = [...(io.sockets.adapter.rooms.get(roomId) ?? [])].filter(
      (peerId) => peerId !== socket.id,
    );

    void socket.join(roomId);
    socket.emit("room:peers", peers);
    socket.emit("chat:history", messageHistory.get(roomId) ?? []);
    io.to(roomId).emit(
      "room:count",
      io.sockets.adapter.rooms.get(roomId)?.size ?? 0,
    );
  });

  socket.on("qa:join", (courseId) => {
    if (
      typeof courseId !== "string" ||
      !courseId.trim() ||
      courseId.length > 100
    ) {
      return;
    }
    const roomId = courseQaRoom(courseId);
    void socket.join(roomId);
    socket.emit("qa:history", courseQuestions.get(courseId) ?? []);
  });

  socket.on("qa:ask", ({ courseId, author, text }) => {
    if (
      typeof courseId !== "string" ||
      typeof author !== "string" ||
      typeof text !== "string"
    ) {
      return;
    }
    const questionText = text.trim();
    const roomId = courseQaRoom(courseId);
    if (
      !socket.rooms.has(roomId) ||
      !courseId.trim() ||
      courseId.length > 100 ||
      !questionText ||
      questionText.length > 1000
    ) {
      return;
    }

    const question: CourseQuestion = {
      id: randomUUID(),
      courseId,
      senderId: socket.id,
      author: author.trim().slice(0, 60) || "학습자",
      text: questionText,
      createdAt: new Date().toISOString(),
    };
    const history = courseQuestions.get(courseId) ?? [];
    history.push(question);
    courseQuestions.set(courseId, history.slice(-100));
    io.to(roomId).emit("qa:new", question);
  });

  socket.on("qa:edit", ({ courseId, questionId, text }) => {
    if (
      typeof courseId !== "string" ||
      typeof questionId !== "string" ||
      typeof text !== "string"
    ) {
      return;
    }
    const questionText = text.trim();
    const roomId = courseQaRoom(courseId);
    const question = courseQuestions
      .get(courseId)
      ?.find((item) => item.id === questionId);
    if (
      !socket.rooms.has(roomId) ||
      !question ||
      question.senderId !== socket.id ||
      !questionText ||
      questionText.length > 1000
    ) {
      return;
    }

    question.text = questionText;
    question.editedAt = new Date().toISOString();
    io.to(roomId).emit("qa:updated", question);
  });

  socket.on("qa:delete", ({ courseId, questionId }) => {
    if (typeof courseId !== "string" || typeof questionId !== "string") return;
    const roomId = courseQaRoom(courseId);
    const history = courseQuestions.get(courseId);
    const questionIndex =
      history?.findIndex((item) => item.id === questionId) ?? -1;
    const question = questionIndex >= 0 ? history?.[questionIndex] : undefined;
    if (
      !socket.rooms.has(roomId) ||
      !history ||
      !question ||
      question.senderId !== socket.id
    ) {
      return;
    }

    history.splice(questionIndex, 1);
    io.to(roomId).emit("qa:deleted", { courseId, questionId });
  });

  socket.on("chat:send", ({ roomId, author, text }) => {
    const messageText = text.trim();
    if (!socket.rooms.has(roomId) || !messageText || messageText.length > 2000) {
      return;
    }

    const message: ChatMessage = {
      id: randomUUID(),
      roomId,
      senderId: socket.id,
      author: author.trim().slice(0, 60) || "학습자",
      text: messageText,
      createdAt: new Date().toISOString(),
    };
    const history = messageHistory.get(roomId) ?? [];
    history.push(message);
    messageHistory.set(roomId, history.slice(-100));
    io.to(roomId).emit("chat:new", message);
  });

  socket.on("chat:edit", ({ roomId, messageId, text }) => {
    if (
      typeof roomId !== "string" ||
      typeof messageId !== "string" ||
      typeof text !== "string"
    ) {
      return;
    }
    const messageText = text.trim();
    const history = messageHistory.get(roomId);
    const message = history?.find((item) => item.id === messageId);
    if (
      !socket.rooms.has(roomId) ||
      !message ||
      message.senderId !== socket.id ||
      !messageText ||
      messageText.length > 2000
    ) {
      return;
    }

    message.text = messageText;
    message.editedAt = new Date().toISOString();
    io.to(roomId).emit("chat:updated", message);
  });

  socket.on("chat:delete", ({ roomId, messageId }) => {
    if (typeof roomId !== "string" || typeof messageId !== "string") return;
    const history = messageHistory.get(roomId);
    const messageIndex = history?.findIndex((item) => item.id === messageId) ?? -1;
    const message = messageIndex >= 0 ? history?.[messageIndex] : undefined;
    if (
      !socket.rooms.has(roomId) ||
      !history ||
      messageIndex < 0 ||
      !message ||
      message.senderId !== socket.id
    ) {
      return;
    }

    history.splice(messageIndex, 1);
    io.to(roomId).emit("chat:deleted", { roomId, messageId });
  });

  socket.on("rtc:signal", (signal) => {
    if (
      !socket.rooms.has(signal.roomId) ||
      !signal.to ||
      signal.to === socket.id ||
      !io.sockets.sockets.get(signal.to)?.rooms.has(signal.roomId)
    ) {
      return;
    }
    socket.to(signal.to).emit("rtc:signal", { ...signal, from: socket.id });
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue;
      socket.to(roomId).emit(
        "room:count",
        Math.max(0, (io.sockets.adapter.rooms.get(roomId)?.size ?? 1) - 1),
      );
    }
  });
});

httpServer.on("request", (request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: "ok", service: "classmate-realtime" }));
    return;
  }
});

httpServer.listen(port, () => {
  console.info(`Realtime server listening on http://localhost:${port}`);
});
