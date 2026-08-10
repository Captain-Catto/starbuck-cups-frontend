import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { markNotificationAsRead } from "@/store/slices/notificationSlice";
import { socketManager } from "@/lib/socket";
import { clientApi } from "@/lib/client-api";
import { isConsultationData } from "@/types/notification.types";
import type { NotificationData } from "@/types/notification.types";

let audioCtx: AudioContext | null = null;

// Two-tone beep via Web Audio API — used as a fallback if the real ringtone
// file below is missing or fails to load, so sound never hard-depends on a
// static asset being present.
function playGeneratedBeep() {
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

// Real ringtone file — drop an mp3 at public/sounds/consultation-alert.mp3.
// Falls back to the generated beep if the file is missing (404) or blocked.
const ALERT_SOUND_URL = "/sounds/consultation-alert.mp3";

// A single reused <audio> element. Mobile Safari only trusts *this specific*
// element for gesture-less playback after it's been "unlocked" (played once
// synchronously inside a real tap) — a fresh `new Audio()` per call would not
// carry that trust and would get silently blocked when a socket event fires
// later without a tap.
let sharedAudioEl: HTMLAudioElement | null = null;
function getSharedAudioEl(): HTMLAudioElement {
  if (!sharedAudioEl) {
    sharedAudioEl = new Audio(ALERT_SOUND_URL);
    sharedAudioEl.volume = 0.85;
  }
  return sharedAudioEl;
}

let audioUnlocked = false;
/**
 * Mobile browsers (especially iOS Safari) only allow audio.play() when it
 * runs synchronously inside a real user gesture. A consultation alert is
 * triggered by a socket event, not a tap, so without this it plays silently
 * nowhere. Call once on the admin's first tap anywhere in the app to "prime"
 * both the ringtone element and the Web Audio context for later gesture-less
 * playback in the same page session.
 */
export function unlockConsultationAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  try {
    const el = getSharedAudioEl();
    const prevVolume = el.volume;
    el.volume = 0;
    el.play()
      .then(() => {
        el.pause();
        el.currentTime = 0;
        el.volume = prevVolume;
      })
      .catch(() => {
        el.volume = prevVolume;
      });
  } catch {
    // Ignore — worst case the first real alert falls back silently.
  }

  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    }
  } catch {
    // Ignore
  }
}

function playAlertBeep() {
  try {
    const audio = getSharedAudioEl();
    audio.currentTime = 0;
    let fellBack = false;
    const fallback = () => {
      if (fellBack) return;
      fellBack = true;
      playGeneratedBeep();
    };
    audio.play().catch(fallback);
  } catch {
    playGeneratedBeep();
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

  // Prime audio playback on the admin's first tap/click anywhere in the app —
  // required on mobile (especially iOS Safari) since the alert sound is
  // triggered later by a socket event, not a direct gesture.
  useEffect(() => {
    const events: Array<keyof DocumentEventMap> = ["pointerdown", "touchstart", "keydown"];
    const handleFirstInteraction = () => {
      unlockConsultationAudio();
      events.forEach((evt) => document.removeEventListener(evt, handleFirstInteraction));
    };
    events.forEach((evt) => document.addEventListener(evt, handleFirstInteraction, { once: true }));
    return () => {
      events.forEach((evt) => document.removeEventListener(evt, handleFirstInteraction));
    };
  }, []);

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
