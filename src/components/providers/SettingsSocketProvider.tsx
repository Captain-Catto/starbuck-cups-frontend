"use client";

import { createContext, use, useEffect, useSyncExternalStore } from "react";
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

const initialSettingsSocketState: SettingsSocketContextType = {
  socket: null,
  isConnected: false,
};

let settingsSocketSnapshot = initialSettingsSocketState;
const settingsSocketListeners = new Set<() => void>();

const settingsSocketStore = {
  getSnapshot: () => settingsSocketSnapshot,
  getServerSnapshot: () => initialSettingsSocketState,
  subscribe: (listener: () => void) => {
    settingsSocketListeners.add(listener);
    return () => {
      settingsSocketListeners.delete(listener);
    };
  },
  setSnapshot: (nextSnapshot: SettingsSocketContextType) => {
    settingsSocketSnapshot = nextSnapshot;
    settingsSocketListeners.forEach((listener) => listener());
  },
};

export const useSettingsSocket = () => use(SettingsSocketContext);

export function SettingsSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const contextValue = useSyncExternalStore(
    settingsSocketStore.subscribe,
    settingsSocketStore.getSnapshot,
    settingsSocketStore.getServerSnapshot
  );
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    // Backend currently requires JWT for all Socket.IO connections.
    // Skip connection when no token to avoid repeated auth failures on public pages.
    if (!token) {
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

    const handleConnect = () => {
      settingsSocketStore.setSnapshot({
        socket: socketInstance,
        isConnected: true,
      });
    };

    const handleDisconnect = () => {
      settingsSocketStore.setSnapshot({
        socket: socketInstance,
        isConnected: false,
      });
    };

    const handleConnectError = () => {
      settingsSocketStore.setSnapshot({
        socket: socketInstance,
        isConnected: false,
      });
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("connect_error", handleConnectError);

    settingsSocketStore.setSnapshot({
      socket: socketInstance,
      isConnected: false,
    });

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("connect_error", handleConnectError);
      socketInstance.disconnect();
      settingsSocketStore.setSnapshot(initialSettingsSocketState);
    };
  }, [token]);

  return (
    <SettingsSocketContext.Provider value={contextValue}>
      {children}
    </SettingsSocketContext.Provider>
  );
}
