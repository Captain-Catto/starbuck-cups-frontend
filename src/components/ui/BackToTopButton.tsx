"use client";

import { useSyncExternalStore } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";

const SCROLL_THRESHOLD = 480;

function subscribeToScroll(callback: () => void) {
  let frame = 0;

  const handleScroll = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      callback();
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll);

  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleScroll);
  };
}

const getScrollSnapshot = () =>
  typeof window !== "undefined" && window.scrollY > SCROLL_THRESHOLD;

const getServerScrollSnapshot = () => false;

export function BackToTopButton() {
  const isVisible = useSyncExternalStore(
    subscribeToScroll,
    getScrollSnapshot,
    getServerScrollSnapshot
  );
  const t = useTranslations("common");

  const handleClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t("backToTop")}
      title={t("backToTop")}
      className={`fixed bottom-[6.5rem] right-6 z-30 flex size-12 items-center justify-center rounded-full border border-neutral-800 bg-black text-white shadow-lg transition-all duration-200 hover:bg-white hover:text-black hover:border-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:bottom-[6.75rem] ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </button>
  );
}

export default BackToTopButton;
