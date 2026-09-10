import { useCallback, useEffect, useRef, useState } from "react";
import Peer from "peerjs";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface PeerState {
  peerId: string | null;
  roomCode: string | null;
  status: ConnectionStatus;
  isHost: boolean;
}

export function usePeerConnection() {
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<ReturnType<Peer["connect"]> | null>(null);
  const [state, setState] = useState<PeerState>({
    peerId: null,
    roomCode: null,
    status: "disconnected",
    isHost: false,
  });
  const onDataRef = useRef<((data: unknown) => void) | null>(null);

  useEffect(() => {
    return () => {
      connRef.current?.close();
      peerRef.current?.destroy();
    };
  }, []);

  const onData = useCallback((data: unknown) => {
    onDataRef.current?.(data);
  }, []);

  const createRoom = useCallback(
    (onDataCallback: (data: unknown) => void) => {
      onDataRef.current = onDataCallback;
      const id = `coop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const peer = new Peer(id);
      peerRef.current = peer;

      peer.on("open", (peerId) => {
        setState((s) => ({
          ...s,
          peerId,
          roomCode: peerId,
          status: "connecting",
          isHost: true,
        }));
        console.log(`[PeerJS] Room created: ${peerId}`);
      });

      peer.on("connection", (conn) => {
        connRef.current = conn;
        conn.on("open", () => {
          setState((s) => ({ ...s, status: "connected" }));
          console.log("[PeerJS] Guest connected");
        });
        conn.on("data", onData);
        conn.on("close", () => {
          setState((s) => ({ ...s, status: "disconnected" }));
          console.log("[PeerJS] Guest disconnected");
        });
        conn.on("error", (err) => {
          console.error("[PeerJS] Connection error:", err);
          setState((s) => ({ ...s, status: "error" }));
        });
      });

      peer.on("error", (err) => {
        console.error("[PeerJS] Peer error:", err);
        setState((s) => ({ ...s, status: "error" }));
      });
    },
    []
  );

  const joinRoom = useCallback(
    (roomCode: string, onDataCallback: (data: unknown) => void) => {
      onDataRef.current = onDataCallback;
      const peer = new Peer();
      peerRef.current = peer;

      peer.on("open", (peerId) => {
        setState((s) => ({
          ...s,
          peerId,
          status: "connecting",
          isHost: false,
        }));
        console.log(`[PeerJS] Joining room: ${roomCode}`);

        const conn = peer.connect(roomCode, { reliable: true });
        connRef.current = conn;

        conn.on("open", () => {
          setState((s) => ({ ...s, status: "connected", roomCode }));
          console.log("[PeerJS] Connected to host");
        });
        conn.on("data", onData);
        conn.on("close", () => {
          setState((s) => ({ ...s, status: "disconnected" }));
          console.log("[PeerJS] Host disconnected");
        });
        conn.on("error", (err) => {
          console.error("[PeerJS] Connection error:", err);
          setState((s) => ({ ...s, status: "error" }));
        });
      });

      peer.on("error", (err) => {
        console.error("[PeerJS] Peer error:", err);
        setState((s) => ({ ...s, status: "error" }));
      });
    },
    []
  );

  const sendData = useCallback((data: unknown) => {
    if (connRef.current?.open) {
      connRef.current.send(data);
    }
  }, []);

  const disconnect = useCallback(() => {
    connRef.current?.close();
    peerRef.current?.destroy();
    peerRef.current = null;
    connRef.current = null;
    setState({
      peerId: null,
      roomCode: null,
      status: "disconnected",
      isHost: false,
    });
  }, []);

  return { ...state, createRoom, joinRoom, sendData, disconnect };
}
