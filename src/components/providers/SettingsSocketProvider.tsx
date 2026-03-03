"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

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

  useEffect(() => {
    // Backend URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    
    // Connect to root namespace as per socket.service.ts
    // Note: socket.service.ts uses root namespace, unlike the Movie project which used /settings
    // Wait, let me check socket.service.ts again. 
    // It initializes 'new SocketIOServer(server, ...)' without explicit namespace in constructor
    // So it listens on root. But wait, it doesn't seem to distinct settings yet.
    // In socket.service.ts, I added emitSettingsUpdate using this.io.emit -> broadcasts to everyone.
    // So client should connect to root.

    const socketInstance = io(baseUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Connected to socket server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SettingsSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SettingsSocketContext.Provider>
  );
}
