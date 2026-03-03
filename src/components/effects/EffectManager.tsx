"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { RootState, AppDispatch } from "@/store"; // Need to ensure store export
import {
  fetchEffectSettings,
  updateFromSocket,
  EffectSettings,
} from "@/store/effectSettingsSlice"; // Need to create this slice
import { useSettingsSocket } from "@/components/providers/SettingsSocketProvider";
import dynamic from "next/dynamic";

// Dynamically import effects
const SnowEffect = dynamic(() => import("./SnowEffect"), {
  ssr: false,
});

const RedEnvelopeEffect = dynamic(() => import("./RedEnvelopeEffect"), {
  ssr: false,
});

export default function EffectManager() {
  const dispatch = useDispatch<AppDispatch>(); // Ensure AppDispatch type exists
  const pathname = usePathname();
  
  // Select from store - assumed structure
  const {
    enabled,
    activeEffects,
    intensity,
    redEnvelopeSettings,
    snowSettings,
    excludedPaths,
  } = useSelector((state: RootState) => state.effectSettings);

  const { socket } = useSettingsSocket();

  // Fetch settings on mount
  useEffect(() => {
    // Dispatch action to fetch settings via API
    // Need to implement fetchEffectSettings thunk
    dispatch(fetchEffectSettings());
  }, [dispatch]);

  // Listen for socket updates
  useEffect(() => {
    if (!socket) return;

    const handleSettingsUpdate = (newSettings: EffectSettings) => {
      console.log("Received settings update:", newSettings);
      dispatch(updateFromSocket(newSettings));
    };

    socket.on("settings:updated", handleSettingsUpdate);

    return () => {
      socket.off("settings:updated", handleSettingsUpdate);
    };
  }, [socket, dispatch]);

  const isAdminPage = pathname?.startsWith("/admin");
  
  // Check exclusions
  const isExcluded = excludedPaths?.some((path: string) => {
    if (path === pathname) return true;
    if (pathname?.startsWith(path + "/")) return true;
    return false;
  });

  if (isAdminPage || isExcluded || !enabled || !activeEffects || activeEffects.length === 0) {
    return null;
  }

  return (
    <>
      {activeEffects.includes("snow") && (
        <SnowEffect intensity={intensity} snowSettings={snowSettings} />
      )}
      {activeEffects.includes("redEnvelope") && (
        <RedEnvelopeEffect
          intensity={intensity}
          redEnvelopeSettings={redEnvelopeSettings}
        />
      )}
    </>
  );
}
