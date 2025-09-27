import { io, Socket } from "socket.io-client";
import { NotificationPayload } from "@/types/notification.types";

interface ServerToClientEvents {
  "notification:new": (notification: NotificationPayload) => void;
  "notification:count_update": (count: number) => void;
  "consultation:created": (data: NotificationPayload) => void;
  "order:created": (data: NotificationPayload) => void;
  "notification:consultation": (data: NotificationPayload) => void;
  "notification:order": (data: NotificationPayload) => void;
  "admin:joined": () => void;
  error: (error: string) => void;
}

interface ClientToServerEvents {
  "admin:join": () => void;
  "admin:leave": () => void;
  "notification:mark_read": (notificationId: string) => void;
}

class SocketManager {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private isConnecting = false;

  public connect(
    token: string
  ): Promise<Socket<ServerToClientEvents, ClientToServerEvents>> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      if (this.isConnecting) {
        // Wait for current connection attempt
        const checkConnection = () => {
          if (this.socket?.connected) {
            resolve(this.socket);
          } else if (!this.isConnecting) {
            reject(new Error("Connection failed"));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      this.isConnecting = true;

      // Fix for production URL
      let serverUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8080";

      // Handle malformed URLs
      if (serverUrl.includes("https://https") || serverUrl === "https") {
        serverUrl = "https://api-starbuck-cups.lequangtridat.com";
      }

      console.log("🔧 Socket serverUrl:", serverUrl, "from env:", process.env.NEXT_PUBLIC_API_URL);

      this.socket = io(serverUrl, {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
        timeout: 10000,
        retries: 3,
      });

      this.socket.on("connect", () => {
        console.log("🔌 Socket.IO connected");
        this.isConnecting = false;

        // Join admin room
        this.socket?.emit("admin:join");

        resolve(this.socket!);
      });

      this.socket.on("connect_error", (error) => {
        console.error("🔌 Socket.IO connection error:", error);
        this.isConnecting = false;
        reject(error);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("🔌 Socket.IO disconnected:", reason);
        this.isConnecting = false;
      });

      // Set up error handling
      this.socket.on("connect_error", (error: Error) => {
        console.error("🔌 Socket.IO connection error:", error);
        this.isConnecting = false;
        reject(error);
      });
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.emit("admin:leave");
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }

  public getSocket(): Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null {
    return this.socket;
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public markNotificationAsRead(notificationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("notification:mark_read", notificationId);
    }
  }

  public joinAdminRoom(): void {
    if (this.socket?.connected) {
      console.log("🏠 Emitting admin:join event");
      this.socket.emit("admin:join");
    }
  }

  public leaveAdminRoom(): void {
    if (this.socket?.connected) {
      console.log("🚪 Emitting admin:leave event");
      this.socket.emit("admin:leave");
    }
  }
}

// Export singleton instance
export const socketManager = new SocketManager();
