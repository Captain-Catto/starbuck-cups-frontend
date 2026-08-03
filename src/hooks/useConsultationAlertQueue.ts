import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { markNotificationAsRead } from "@/store/slices/notificationSlice";
import { socketManager } from "@/lib/socket";
import { clientApi } from "@/lib/client-api";
import { isConsultationData } from "@/types/notification.types";
import type { NotificationData } from "@/types/notification.types";

let audioCtx: AudioContext | null = null;

// Two-tone beep via Web Audio API — no external asset needed, and it repeats
// while unacknowledged so it can't be missed like a silent badge or a toast
// that auto-dismisses in a few seconds.
function playAlertBeep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});

    const now = audioCtx.currentTime;
    [0, 0.18].forEach((offset) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.35, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.16);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.17);
    });
  } catch {
    // Autoplay can be blocked before any user interaction — the visual
    // modal still appears regardless.
  }
}

/**
 * Queues unread "consultation" notifications as blocking alerts so a new
 * customer inquiry can't be missed the way a shaking bell icon or an
 * auto-dismissing toast can be. Sourced from the Redux notifications list
 * (populated by useSocket's single socket listener) rather than attaching a
 * second raw socket listener, since useSocket calls removeAllListeners() on
 * (re)connect and would silently drop a second listener.
 */
export function useConsultationAlertQueue() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const notifications = useAppSelector((s) => s.notifications.notifications);
  const [queue, setQueue] = useState<NotificationData[]>([]);
  const seenIds = useRef<Set<string>>(new Set());
  const repeatTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fresh = notifications.filter(
      (n) => n.type === "consultation" && n.read !== true && !seenIds.current.has(n.id)
    );
    if (fresh.length === 0) return;

    fresh.forEach((n) => seenIds.current.add(n.id));
    setQueue((prev) => [...prev, ...fresh]);
    playAlertBeep();
  }, [notifications]);

  // Keep beeping every 15s while an alert is waiting, so it stays audible
  // even if the admin stepped away right when it first arrived.
  useEffect(() => {
    if (queue.length === 0) {
      if (repeatTimer.current) {
        clearInterval(repeatTimer.current);
        repeatTimer.current = null;
      }
      return;
    }
    repeatTimer.current = setInterval(playAlertBeep, 15000);
    return () => {
      if (repeatTimer.current) clearInterval(repeatTimer.current);
    };
  }, [queue.length]);

  // Flash the browser tab title while an alert is waiting — the sound can be
  // missed if the admin is on another tab/app, but a flashing title is
  // visible the moment they glance at the taskbar/tab bar.
  const originalTitle = useRef<string | null>(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (originalTitle.current === null) originalTitle.current = document.title;

    if (queue.length === 0) {
      document.title = originalTitle.current;
      return;
    }

    const alertTitle =
      queue.length > 1 ? `🔴 (${queue.length}) Tin tư vấn mới!` : "🔴 Tin tư vấn mới!";
    let showingAlert = false;
    const flashTimer = setInterval(() => {
      showingAlert = !showingAlert;
      document.title = showingAlert ? alertTitle : originalTitle.current!;
    }, 1000);

    return () => {
      clearInterval(flashTimer);
      document.title = originalTitle.current!;
    };
  }, [queue.length]);

  const acknowledge = useCallback(
    async (id: string) => {
      setQueue((prev) => prev.filter((n) => n.id !== id));
      dispatch(markNotificationAsRead(id));
      try {
        await clientApi.markNotificationAsRead(id);
        if (socketManager.isConnected()) {
          socketManager.markNotificationAsRead(id);
        }
      } catch {
        // Read state is already reflected locally; a failed sync here isn't
        // worth blocking the admin over.
      }
    },
    [dispatch]
  );

  const viewDetails = useCallback(
    (id: string) => {
      acknowledge(id);
      router.push("/admin/consultations");
    },
    [acknowledge, router]
  );

  return {
    current: queue[0] ?? null,
    consultationData: queue[0] && isConsultationData(queue[0].data) ? queue[0].data : null,
    remainingCount: queue.length - 1,
    acknowledge,
    viewDetails,
  };
}
