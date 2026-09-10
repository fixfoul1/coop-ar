import { useCallback, useRef, useState } from "react";
import Peer from "peerjs";
import type { DataConnection } from "peerjs";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export function usePeerConnection() {
  const peerRef = useRef<Peer | null>(null);
  const connsRef = useRef<Map<string, DataConnection>>(new Map());
  const [state, setState] = useState<{ peerId: string | null; roomCode: string | null; status: ConnectionStatus; isHost: boolean; players: { id: string; name: string }[] }>({ peerId: null, roomCode: null, status: "disconnected", isHost: false, players: [] });
  const onDataRef = useRef<((data: unknown) => void) | null>(null);

  const onData = useCallback((data: unknown) => { onDataRef.current?.(data); }, []);
  const broadcast = useCallback((data: unknown) => { const msg = JSON.stringify(data); connsRef.current.forEach((c) => { if (c.open) c.send(msg); }); }, []);
  const disconnect = useCallback(() => { connsRef.current.forEach((c) => c.close()); connsRef.current.clear(); peerRef.current?.destroy(); peerRef.current = null; setState({ peerId: null, roomCode: null, status: "disconnected", isHost: false, players: [] }); }, []);

  const createRoom = useCallback((cb: (data: unknown) => void) => {
    onDataRef.current = cb;
    const peer = new Peer(`h-${Date.now()}`);
    peerRef.current = peer;
    peer.on("open", (id) => setState({ peerId: id, roomCode: id, status: "connected", isHost: true, players: [{ id, name: "Host" }] }));
    peer.on("connection", (conn) => {
      const pid = conn.peer || `p-${connsRef.current.size}`;
      connsRef.current.set(pid, conn);
      setState((p) => ({ ...p, players: [...p.players, { id: pid, name: `Player ${p.players.length}` }] }));
      conn.on("open", () => broadcast({ type: "players-update", players: state.players }));
      conn.on("data", (d) => onData(JSON.parse(d as string)));
      conn.on("close", () => { connsRef.current.delete(pid); setState((p) => ({ ...p, players: p.players.filter((x) => x.id !== pid) })); });
    });
    peer.on("error", () => setState((p) => ({ ...p, status: "error" })));
  }, [state.players, onData]);

  const joinRoom = useCallback((code: string, cb: (data: unknown) => void) => {
    onDataRef.current = cb;
    const peer = new Peer();
    peerRef.current = peer;
    peer.on("open", (id) => { setState({ peerId: id, roomCode: code, status: "connecting", isHost: false, players: [] }); const conn = peer.connect(code, { reliable: true }); connsRef.current.set(code, conn); conn.on("open", () => setState((p) => ({ ...p, status: "connected" }))); conn.on("data", (d) => onData(JSON.parse(d as string))); conn.on("close", () => setState((p) => ({ ...p, status: "disconnected" }))); conn.on("error", () => setState((p) => ({ ...p, status: "error" }))); });
    peer.on("error", () => setState((p) => ({ ...p, status: "error" })));
  }, []);

  const sendAll = useCallback((data: unknown) => { const msg = JSON.stringify(data); connsRef.current.forEach((c) => { if (c.open) c.send(msg); }); onData(data); }, [onData]);

  return { ...state, createRoom, joinRoom, sendAll, disconnect, isConnected: state.status === "connected", playerIdx: state.isHost ? 0 : state.players.findIndex((p) => p.id === state.peerId), playerId: state.peerId || "" };
}
