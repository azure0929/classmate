export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  author: string;
  text: string;
  createdAt: string;
  editedAt?: string;
}

export interface CourseQuestion {
  id: string;
  courseId: string;
  senderId: string;
  author: string;
  text: string;
  createdAt: string;
  editedAt?: string;
}

export interface RtcSignal {
  roomId: string;
  to: string;
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export interface ServerToClientEvents {
  "chat:history": (messages: ChatMessage[]) => void;
  "chat:new": (message: ChatMessage) => void;
  "chat:updated": (message: ChatMessage) => void;
  "chat:deleted": (payload: { roomId: string; messageId: string }) => void;
  "qa:history": (questions: CourseQuestion[]) => void;
  "qa:new": (question: CourseQuestion) => void;
  "qa:updated": (question: CourseQuestion) => void;
  "qa:deleted": (payload: { courseId: string; questionId: string }) => void;
  "room:count": (count: number) => void;
  "room:peers": (peerIds: string[]) => void;
  "rtc:signal": (signal: RtcSignal & { from: string }) => void;
}

export interface ClientToServerEvents {
  "room:join": (roomId: string) => void;
  "chat:send": (message: {
    roomId: string;
    author: string;
    text: string;
  }) => void;
  "chat:edit": (message: {
    roomId: string;
    messageId: string;
    text: string;
  }) => void;
  "chat:delete": (message: { roomId: string; messageId: string }) => void;
  "qa:join": (courseId: string) => void;
  "qa:ask": (question: {
    courseId: string;
    author: string;
    text: string;
  }) => void;
  "qa:edit": (question: {
    courseId: string;
    questionId: string;
    text: string;
  }) => void;
  "qa:delete": (question: { courseId: string; questionId: string }) => void;
  "rtc:signal": (signal: RtcSignal) => void;
}
