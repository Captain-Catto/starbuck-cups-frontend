import { useEffect, useRef } from "react";
import { socketManager } from "@/lib/socket";
import { NotificationPayload } from "@/types/notification.types";

interface UseConsultationSocketProps {
  onConsultationUpdate?: () => void;
  enabled?: boolean;
}

export function useConsultationSocket({
  onConsultationUpdate,
  enabled = true,
}: UseConsultationSocketProps = {}) {
  const listenersRegistered = useRef(false);

  useEffect(() => {
    if (!enabled || !onConsultationUpdate || listenersRegistered.current) {
      return;
    }

    const socket = socketManager.getSocket();
    if (!socket) {
      return;
    }

    // Listen for new consultation notifications
    const handleNewNotification = (notification: NotificationPayload) => {
      if (notification.type === "consultation") {

        // Trigger refresh of pending count
        onConsultationUpdate();
      }
    };

    // Register event listener
    socket.on("notification:new", handleNewNotification);

    listenersRegistered.current = true;

    // Cleanup function
    return () => {
      if (socket) {
        socket.off("notification:new", handleNewNotification);
      }
      listenersRegistered.current = false;

    };
  }, [onConsultationUpdate, enabled]);

  return {
    // Can add more return values if needed
  };
}
