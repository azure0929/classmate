"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { RtcSignal } from "@classmate/realtime-types";

interface UseUserMediaOptions {
  roomId: string;
  peerConnectionsRef: MutableRefObject<Map<string, RTCPeerConnection>>;
  emitSignal: (signal: RtcSignal) => void;
  reportError: (message: string) => void;
}

interface UseUserMediaResult {
  localVideoRef: MutableRefObject<HTMLVideoElement | null>;
  streamRef: MutableRefObject<MediaStream | null>;
  screenRef: MutableRefObject<MediaStream | null>;
  cameraOn: boolean;
  micOn: boolean;
  sharing: boolean;
  toggleCamera: () => Promise<void>;
  toggleMic: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
}

export function useUserMedia({
  roomId,
  peerConnectionsRef,
  emitSignal,
  reportError,
}: UseUserMediaOptions): UseUserMediaResult {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [sharing, setSharing] = useState(false);

  const renegotiate = useCallback(
    async (peerId: string, peer: RTCPeerConnection) => {
      if (peer.signalingState !== "stable") return;
      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        emitSignal({
          roomId,
          to: peerId,
          description: peer.localDescription ?? offer,
        });
      } catch (error) {
        console.error("WebRTC renegotiation failed", error);
        reportError("영상 연결이 원활하지 않아요.");
      }
    },
    [emitSignal, reportError, roomId],
  );

  const setPeerTrack = useCallback(
    async (
      peerId: string,
      peer: RTCPeerConnection,
      track: MediaStreamTrack | null,
      stream: MediaStream,
      kind: "audio" | "video" = track?.kind === "audio" ? "audio" : "video",
    ) => {
      const sender =
        peer.getSenders().find((item) => item.track?.kind === kind) ??
        peer
          .getTransceivers()
          .find((item) => item.receiver.track.kind === kind)
          ?.sender;

      if (sender) {
        await sender.replaceTrack(track);
        return;
      }

      if (track) {
        peer.addTrack(track, stream);
        await renegotiate(peerId, peer);
      }
    },
    [renegotiate],
  );

  const enableMedia = useCallback(
    async (kind: "camera" | "mic") => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          reportError("이 브라우저에서는 미디어를 사용할 수 없어요.");
          return false;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: kind === "camera" ? { width: 1280, height: 720 } : false,
          audio: kind === "mic",
        });
        const current = streamRef.current ?? new MediaStream();

        for (const track of stream.getTracks()) {
          current.addTrack(track);
          if (!(kind === "camera" && sharing)) {
            for (const [peerId, peer] of peerConnectionsRef.current) {
              await setPeerTrack(peerId, peer, track, current);
            }
          }
        }

        streamRef.current = current;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenRef.current ?? current;
        }
        return true;
      } catch (error) {
        console.error(`Could not access ${kind}`, error);
        reportError("기기 권한을 확인한 뒤 다시 시도해주세요.");
        return false;
      }
    },
    [peerConnectionsRef, reportError, setPeerTrack, sharing],
  );

  const toggleCamera = useCallback(async () => {
    if (cameraOn) {
      const tracks = streamRef.current?.getVideoTracks() ?? [];
      for (const track of tracks) {
        try {
          if (!sharing) {
            for (const [peerId, peer] of peerConnectionsRef.current) {
              await setPeerTrack(peerId, peer, null, streamRef.current ?? new MediaStream(), "video");
            }
          }
        } catch (error) {
          console.error("Could not disable camera track", error);
          reportError("카메라 연결을 변경하지 못했어요.");
        } finally {
          track.stop();
          streamRef.current?.removeTrack(track);
        }
      }
      setCameraOn(false);
      return;
    }
    if (await enableMedia("camera")) setCameraOn(true);
  }, [cameraOn, enableMedia, peerConnectionsRef, setPeerTrack, sharing]);

  const toggleMic = useCallback(async () => {
    if (micOn) {
      const tracks = streamRef.current?.getAudioTracks() ?? [];
      for (const track of tracks) {
        try {
          for (const [peerId, peer] of peerConnectionsRef.current) {
            await setPeerTrack(peerId, peer, null, streamRef.current ?? new MediaStream(), "audio");
          }
        } catch (error) {
          console.error("Could not disable microphone track", error);
          reportError("마이크 연결을 변경하지 못했어요.");
        } finally {
          track.stop();
          streamRef.current?.removeTrack(track);
        }
      }
      setMicOn(false);
      return;
    }
    if (await enableMedia("mic")) setMicOn(true);
  }, [enableMedia, micOn, peerConnectionsRef, setPeerTrack]);

  const restoreCameraVideo = useCallback(async () => {
    const cameraTrack = cameraOn
      ? streamRef.current?.getVideoTracks()[0] ?? null
      : null;
    for (const [peerId, peer] of peerConnectionsRef.current) {
      try {
        await setPeerTrack(
          peerId,
          peer,
          cameraTrack,
          streamRef.current ?? new MediaStream(),
        );
      } catch (error) {
        console.error("Could not restore camera track", error);
        reportError("카메라 영상 복구에 실패했어요.");
      }
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = streamRef.current;
    }
    setSharing(false);
  }, [cameraOn, peerConnectionsRef, reportError, setPeerTrack]);

  const toggleScreenShare = useCallback(async () => {
    if (sharing) {
      screenRef.current?.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });
      screenRef.current = null;
      await restoreCameraVideo();
      return;
    }

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        reportError("이 브라우저에서는 화면 공유를 사용할 수 없어요.");
        return;
      }
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenRef.current = screen;
      const track = screen.getVideoTracks()[0];

      for (const [peerId, peer] of peerConnectionsRef.current) {
        await setPeerTrack(peerId, peer, track, screen);
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = screen;

      track.onended = () => {
        screenRef.current = null;
        void restoreCameraVideo();
      };
      setSharing(true);
    } catch (error) {
      screenRef.current?.getTracks().forEach((track) => track.stop());
      screenRef.current = null;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = streamRef.current;
      }
      console.error("Could not share screen", error);
      reportError("화면 공유를 시작하지 못했어요.");
    }
  }, [peerConnectionsRef, reportError, restoreCameraVideo, setPeerTrack, sharing]);

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      screenRef.current?.getTracks().forEach((track) => track.stop());
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
    },
    [],
  );

  return {
    localVideoRef,
    streamRef,
    screenRef,
    cameraOn,
    micOn,
    sharing,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
  };
}
