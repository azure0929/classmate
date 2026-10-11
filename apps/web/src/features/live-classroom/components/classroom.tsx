"use client";

import {
  ArrowLeft,
  Camera,
  CameraOff,
  Check,
  ChevronDown,
  Maximize2,
  Mic,
  MicOff,
  MessageCircle,
  MonitorUp,
  MoreHorizontal,
  Settings2,
  Signal,
  Users,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import type { RtcSignal } from "@classmate/realtime-types";
import { ChatComposer } from "./chat-composer";
import { ChatFeed } from "./chat-feed";
import {
  useLiveChat,
  type RealtimeSocket,
} from "../hooks/use-live-chat";
import { useUserMedia } from "../hooks/use-user-media";

const roomId = "drawing-club-live";
const signalingUrl =
  process.env.NEXT_PUBLIC_REALTIME_URL ?? "http://localhost:4001";

interface ClassroomProps {
  onClose: () => void;
}

export function Classroom({ onClose }: ClassroomProps) {
  const [socket, setSocket] = useState<RealtimeSocket | null>(null);
  const [peerIds, setPeerIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "people">("chat");
  const [notice, setNotice] = useState("");
  const socketRef = useRef<RealtimeSocket | null>(null);
  const peersRef = useRef(new Map<string, RTCPeerConnection>());
  const remoteVideosRef = useRef(new Map<string, HTMLVideoElement>());
  const pendingCandidatesRef = useRef(
    new Map<string, RTCIceCandidateInit[]>(),
  );
  const {
    messages,
    connected,
    participantCount,
    sendMessage,
    editMessage,
    deleteMessage,
  } = useLiveChat(
    socket,
    roomId,
  );
  const reportError = useCallback((message: string) => setNotice(message), []);
  const emitSignal = useCallback(
    (signal: RtcSignal) => socketRef.current?.emit("rtc:signal", signal),
    [],
  );
  const {
    localVideoRef,
    streamRef,
    screenRef,
    cameraOn,
    micOn,
    sharing,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
  } = useUserMedia({
    roomId,
    peerConnectionsRef: peersRef,
    emitSignal,
    reportError,
  });

  const getPeerConnection = useCallback((peerId: string) => {
    const existing = peersRef.current.get(peerId);
    if (existing) return existing;

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    const localStream = streamRef.current;
    const screenStream = screenRef.current;
    if (localStream || screenStream) {
      localStream?.getTracks().forEach((track) => {
        if (!screenStream || track.kind !== "video") {
          peer.addTrack(track, localStream);
        }
      });
      screenStream
        ?.getTracks()
        .forEach((track) => peer.addTrack(track, screenStream));
    } else {
      peer.addTransceiver("audio", { direction: "recvonly" });
      peer.addTransceiver("video", { direction: "recvonly" });
    }
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        emitSignal({
          roomId,
          to: peerId,
          candidate: event.candidate.toJSON(),
        });
      }
    };
    peer.ontrack = (event) => {
      const video = remoteVideosRef.current.get(peerId);
      if (video && event.streams[0]) video.srcObject = event.streams[0];
    };
    peersRef.current.set(peerId, peer);
    setPeerIds((current) =>
      current.includes(peerId) ? current : [...current, peerId],
    );
    return peer;
  }, [emitSignal, screenRef, streamRef]);

  const createOffer = useCallback(async (peerId: string) => {
    try {
      const peer = getPeerConnection(peerId);
      if (peer.signalingState !== "stable") return;
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      emitSignal({
        roomId,
        to: peerId,
        description: peer.localDescription ?? offer,
      });
    } catch (error) {
      console.error("WebRTC offer failed", error);
      setNotice("영상 연결을 시작하지 못했어요.");
    }
  }, [emitSignal, getPeerConnection]);

  const receiveSignal = useCallback(async (signal: RtcSignal & { from: string }) => {
    try {
      const peer = getPeerConnection(signal.from);
      if (signal.description) {
        await peer.setRemoteDescription(signal.description);
        const queued = pendingCandidatesRef.current.get(signal.from) ?? [];
        pendingCandidatesRef.current.delete(signal.from);
        for (const candidate of queued) {
          await peer.addIceCandidate(candidate);
        }
        if (signal.description.type === "offer") {
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          emitSignal({
            roomId,
            to: signal.from,
            description: peer.localDescription ?? answer,
          });
        }
      } else if (signal.candidate) {
        if (peer.remoteDescription) {
          await peer.addIceCandidate(signal.candidate);
        } else {
          const queued = pendingCandidatesRef.current.get(signal.from) ?? [];
          queued.push(signal.candidate);
          pendingCandidatesRef.current.set(signal.from, queued);
        }
      }
    } catch (error) {
      console.error("WebRTC signaling failed", error);
      setNotice("상대방과의 연결이 원활하지 않아요.");
    }
  }, [emitSignal, getPeerConnection]);

  useEffect(() => {
    const nextSocket: RealtimeSocket = io(signalingUrl, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
    socketRef.current = nextSocket;
    setSocket(nextSocket);

    return () => {
      nextSocket.disconnect();
      socketRef.current = null;
      peersRef.current.forEach((peer) => peer.close());
      peersRef.current.clear();
      pendingCandidatesRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handlePeers = (ids: string[]) => {
      for (const peerId of ids) void createOffer(peerId);
    };
    const handleSignal = (signal: RtcSignal & { from: string }) =>
      void receiveSignal(signal);

    socket.on("room:peers", handlePeers);
    socket.on("rtc:signal", handleSignal);
    socket.connect();
    return () => {
      socket.off("room:peers", handlePeers);
      socket.off("rtc:signal", handleSignal);
    };
  }, [createOffer, receiveSignal, socket]);

  return (
    <motion.div className="room-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <header className="room-header">
        <button className="room-back" onClick={onClose}><ArrowLeft size={18} /> <span>클래스 나가기</span></button>
        <div className="room-title"><span className="room-live-dot" /><span><b>라이브 클래스</b><small>좋아하는 장면을 그리는 아이패드 드로잉</small></span></div>
        <div className="room-status"><span className={connected ? "status-connected" : ""}><Signal size={15} /> {connected ? "연결됨" : "연결 중"}</span><i /><span><Users size={15} /> {participantCount}명</span><button aria-label="더 보기"><MoreHorizontal size={20} /></button></div>
      </header>
      <div className="room-body">
        <section className="stage-column">
          <div className="video-stage">
            <div className="stage-teacher">
              <div className="teacher-avatar">하나</div>
              <div><b>김하나</b><span>오늘의 작은 그림을 함께 그려요</span></div>
            </div>
            <div className={`teacher-video-placeholder ${cameraOn ? "teacher-video-placeholder--local" : ""}`}>
              <video ref={localVideoRef} autoPlay muted playsInline className={cameraOn || sharing ? "local-preview" : "local-preview local-preview--hidden"} />
              {!cameraOn && !sharing && <div className="stage-art"><div className="stage-art-sun" /><div className="stage-art-hill" /><span>오늘의 장면을<br />천천히 그려봐요</span></div>}
              <button className="stage-expand" aria-label="화면 크게 보기" onClick={() => document.querySelector(".video-stage")?.requestFullscreen()}><Maximize2 size={17} /></button>
              <div className="stage-caption"><span className="room-live-dot" /> {sharing ? "화면 공유 중" : "김하나 선생님"} <span className="stage-caption-mic"><Mic size={13} /></span></div>
              {peerIds.map((peerId, index) => (
                <video
                  key={peerId}
                  ref={(element) => {
                    if (element) remoteVideosRef.current.set(peerId, element);
                    else remoteVideosRef.current.delete(peerId);
                  }}
                  autoPlay
                  playsInline
                  className="remote-video"
                  style={{ right: `${18 + index * 166}px` }}
                />
              ))}
            </div>
            <div className="stage-controls">
              <button className={`media-control ${micOn ? "media-control--active" : ""}`} onClick={() => void toggleMic()} aria-label={micOn ? "마이크 끄기" : "마이크 켜기"}>{micOn ? <Mic size={18} /> : <MicOff size={18} />}<span>{micOn ? "마이크" : "음소거"}</span><ChevronDown size={13} /></button>
              <button className={`media-control ${cameraOn ? "media-control--active" : ""}`} onClick={() => void toggleCamera()} aria-label={cameraOn ? "카메라 끄기" : "카메라 켜기"}>{cameraOn ? <Camera size={18} /> : <CameraOff size={18} />}<span>{cameraOn ? "카메라" : "카메라 끔"}</span><ChevronDown size={13} /></button>
              <button className={`media-control ${sharing ? "media-control--active" : ""}`} onClick={() => void toggleScreenShare()}><MonitorUp size={18} /><span>{sharing ? "공유 중" : "화면 공유"}</span></button>
              <button className="media-control media-control--settings" onClick={() => setNotice("오디오 및 비디오 설정은 기기 권한에서 관리할 수 있어요.")}><Settings2 size={18} /><span>설정</span></button>
            </div>
            <div className="lesson-strip"><div className="lesson-icon"><Video size={17} /></div><div><small>지금 배우는 중 · 2/5</small><b>선과 색으로 나만의 풍경 완성하기</b></div><button onClick={() => setNotice("클래스 노트를 열었어요.")}>클래스 노트 <ArrowLeft size={14} /></button></div>
          </div>
        </section>
        <aside className="room-sidebar">
          <div className="room-sidebar-head"><div className="room-tabs"><button className={activeTab === "chat" ? "room-tab room-tab--active" : "room-tab"} onClick={() => setActiveTab("chat")}><MessageCircle size={16} /> 채팅</button><button className={activeTab === "people" ? "room-tab room-tab--active" : "room-tab"} onClick={() => setActiveTab("people")}><Users size={16} /> 참여자 <span>{participantCount}</span></button></div><button className="sidebar-close" aria-label="패널 닫기" onClick={onClose}><X size={17} /></button></div>
          {activeTab === "chat" ? <>
            <div className="chat-live-note"><span className="room-live-dot" /><span><b>실시간 채팅</b><small>서로를 응원하며 함께 배워요 ✨</small></span></div>
            <ChatFeed
              messages={messages}
              currentUserId={socket?.id ?? ""}
              onEdit={editMessage}
              onDelete={deleteMessage}
            />
            <ChatComposer connected={connected} onSend={sendMessage} />
          </> : <div className="people-list"><div className="people-count"><b>함께 배우는 사람들</b><span>{participantCount}명</span></div><div className="person-row"><span className="chat-avatar person-avatar--teacher">하</span><span><b>김하나</b><small>강사 · 진행 중</small></span><Check size={15} /></div><div className="person-row"><span className="chat-avatar">지</span><span><b>지민</b><small>나</small></span><MicOff size={15} /></div><p className="people-hint">서로의 배움에 따뜻한 응원을 보내주세요 💛</p></div>}
        </aside>
      </div>
      <AnimatePresence>{notice && <motion.div className="room-notice" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{notice}<button onClick={() => setNotice("")}><X size={14} /></button></motion.div>}</AnimatePresence>
      <div className="room-mobile-actions"><button onClick={() => setActiveTab("chat")}><MessageCircle size={18} /> 채팅</button><button onClick={() => setActiveTab("people")}><Users size={18} /> 참여자</button></div>
    </motion.div>
  );
}
