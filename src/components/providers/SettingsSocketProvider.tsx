"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAppSelector } from "@/store";
import { getBackendUrl } from "@/lib/api-config";

interface SettingsSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SettingsSocketContext = createContext<SettingsSocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSettingsSocket = () => useContext(SettingsSocketContext);

export function SettingsSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    // Backend currently requires JWT for all Socket.IO connections.
    // Skip connection when no token to avoid repeated auth failures on public pages.
    if (!token) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const baseUrl = apiUrl
      ? apiUrl.endsWith("/api")
        ? apiUrl.slice(0, -4)
        : apiUrl
      : getBackendUrl();

    const socketInstance = io(baseUrl, {
      auth: {
        token,
      },
      withCredentials: true,
      transports: ["polling", "websocket"],
    });

    socketInstance.on("connect", () => {
      console.log("Connected to socket server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Settings socket connect error:", error.message);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return (
    <SettingsSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SettingsSocketContext.Provider>
  );
}
