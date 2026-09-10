import { useCallback, useRef, useState } from "react";
import Peer from "peerjs";
import type { DataConnection } from "peerjs";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
    { urls: ["turn:openrelay.metered.ca:80", "turn:openrelay.metered.ca:443", "turn:openrelay.metered.ca:443?transport=tcp"], username: "openrelayproject", credential: "openrelayproject" },
  ],
};

interface Player { id: string; name: string; }
interface State { peerId: string | null; roomCode: string | null; status: ConnectionStatus; isHost: boolean; players: Player[]; }

function parseMessage(raw: string): unknown | null { try { return JSON.parse(raw); } catch { return null; } }

export function usePeerConnection() {
  const peerRef = useRef<Peer | null>(null);
  const connsRef = useRef<Map<string, DataConnection>>(new Map());
  const onDataRef = useRef<((data: unknown) => void) | null>(null);
  const playersRef = useRef<Player[]>([]);
  const peerIdRef = useRef("");
  const isHostRef = useRef(false);
  const [state, setState] = useState<State>({ peerId: null, roomCode: null, status: "disconnected", isHost: false, players: [] });

  const updatePlayers = useCallback((fn: (prev: Player[]) => Player[], alsoBroadcast = true) => {
    setState((prev) => {
      const next = fn(prev.players);
      playersRef.current = next;
      if (alsoBroadcast) {
        const str = JSON.stringify({ type: "players-list", players: next });
        connsRef.current.forEach((c) => { if (c.open) c.send(str); });
      }
      return { ...prev, players: next };
    });
  }, []);

  const broadcastType = useCallback((msg: unknown) => {
    const str = JSON.stringify(msg);
    connsRef.current.forEach((c) => { if (c.open) c.send(str); });
  }, []);

  const handleIncoming = useCallback((raw: string) => {
    const data = parseMessage(raw);
    if (!data || typeof data !== "object") return;
    const msg = data as any;
    if (msg.type === "hello") {
      const p: Player = { id: msg.id, name: msg.name };
      updatePlayers((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));
      return;
    }
    if (msg.type === "players-list") {
      playersRef.current = msg.players;
      setState((prev) => ({ ...prev, players: msg.players }));
      return;
    }
    if (msg.type === "leave") {
      updatePlayers((prev) => prev.filter((x) => x.id !== msg.id), false);
      return;
    }
    onDataRef.current?.(data);
    if (isHostRef.current) broadcastType(data);
  }, [broadcastType, updatePlayers]);

  const sendAll = useCallback((data: unknown) => {
    onDataRef.current?.(data);
    broadcastType(data);
  }, [broadcastType]);

  const disconnect = useCallback(() => {
    broadcastType({ type: "leave", id: peerIdRef.current });
    connsRef.current.forEach((c) => { try { c.close(); } catch {} });
    connsRef.current.clear();
    peerRef.current?.destroy();
    peerRef.current = null;
    playersRef.current = [];
    setState({ peerId: null, roomCode: null, status: "disconnected", isHost: false, players: [] });
  }, [broadcastType]);

  const createRoom = useCallback((name: string, cb: (data: unknown) => void) => {
    onDataRef.current = cb;
    const peerId = `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    peerIdRef.current = peerId;
    const peer = new Peer(peerId, { config: ICE_SERVERS });
    peerRef.current = peer;
    peer.on("open", () => {
      const me: Player = { id: peerId, name };
      isHostRef.current = true;
      playersRef.current = [me];
      setState({ peerId, roomCode: peerId, status: "connected", isHost: true, players: [me] });
    });
    peer.on("connection", (conn) => {
      const pid = conn.peer;
      connsRef.current.set(pid, conn);
      conn.on("open", () => {
        updatePlayers((prev) => prev, true);
        conn.send(JSON.stringify({ type: "players-list", players: playersRef.current }));
      });
      conn.on("data", (d) => handleIncoming(d as string));
      conn.on("close", () => {
        connsRef.current.delete(pid);
        updatePlayers((prev) => {
          const next = prev.filter((x) => x.id !== pid);
          return next;
        });
      });
    });
    peer.on("error", () => setState((p) => ({ ...p, status: "error" })));
  }, [handleIncoming, updatePlayers]);

  const joinRoom = useCallback((code: string, name: string, cb: (data: unknown) => void) => {
    onDataRef.current = cb;
    const peer = new Peer({ config: ICE_SERVERS });
    peerRef.current = peer;
    peer.on("open", (id) => {
      isHostRef.current = false;
      peerIdRef.current = id;
      const me: Player = { id, name };
      playersRef.current = [me];
      setState({ peerId: id, roomCode: code, status: "connecting", isHost: false, players: [me] });
      const conn = peer.connect(code, { reliable: true });
      connsRef.current.set(code, conn);
      conn.on("open", () => {
        setState((p) => ({ ...p, status: "connected" }));
        conn.send(JSON.stringify({ type: "hello", id, name }));
      });
      conn.on("data", (d) => handleIncoming(d as string));
      conn.on("close", () => setState((p) => ({ ...p, status: "disconnected" })));
      conn.on("error", () => setState((p) => ({ ...p, status: "error" })));
    });
    peer.on("error", () => setState((p) => ({ ...p, status: "error" })));
  }, [handleIncoming]);

  return {
    ...state,
    createRoom,
    joinRoom,
    sendAll,
    disconnect,
    isConnected: state.status === "connected",
    playerIdx: state.players.findIndex((p) => p.id === state.peerId),
    playerId: state.peerId || "",
  };
}