import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { ApiLog } from "../lib/api";

const getSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return apiUrl.replace(/\/api\/?$/, "");
};

const SOCKET_URL = getSocketUrl();

export function useSocket(projectId: string, onNewLog?: (log: ApiLog) => void) {
  const socketRef = useRef<Socket | null>(null);
  const onNewLogRef = useRef(onNewLog);

  // Keep callback ref updated without triggering connection effects
  useEffect(() => {
    onNewLogRef.current = onNewLog;
  }, [onNewLog]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token || !projectId) return;

    // Connect to the socket server
    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`[Socket] Connected to server, joining project: ${projectId}`);
      // Join the project-specific channel room
      socket.emit("join_project", projectId);
    });

    socket.on("joined", (room) => {
      console.log(`[Socket] Successfully subscribed to project room: ${room}`);
    });

    socket.on("new_log", (log) => {
      console.log("[Socket] New telemetry log received in real-time:", log);
      if (onNewLogRef.current) {
        onNewLogRef.current(log);
      }
    });

    socket.on("error_msg", (msg) => {
      console.error("[Socket] Authorization/Server error message:", msg);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Handshake/Connection error:", err.message);
    });

    return () => {
      if (socket.connected) {
        socket.emit("leave_project", projectId);
        socket.disconnect();
      }
    };
  }, [projectId]); // Excluded onNewLog from dependency array to prevent reconnect loops

  return socketRef;
}