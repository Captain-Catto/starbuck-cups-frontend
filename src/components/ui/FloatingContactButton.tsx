"use client";

import { useSyncExternalStore } from "react";
import { MessageCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface FloatingContactButtonProps {
  zaloPhone?: string;
  isOpen: boolean;
  onToggle: () => void;
}

function getMessengerLink() {
  const isMobile =
    typeof window !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  return isMobile
    ? "https://www.facebook.com/hasron.luong"
    : "https://www.facebook.com/messages/e2ee/t/9870524003031490";
}

function handleMessengerClick() {
  window.open(getMessengerLink(), "_blank", "noopener,noreferrer");
}

export function FloatingContactButton({
  zaloPhone = "0896686008",
  isOpen,
  onToggle,
}: FloatingContactButtonProps) {
  const isHydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
  const t = useTranslations("floating");

  if (!isHydrated) return null;

  const getZaloLink = () => `https://zalo.me/${zaloPhone.replace(/^0/, "84")}`;

  const handleZaloClick = () => {
    const link = getZaloLink();
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {/* Messenger Button - Appears when open */}
      <div
        className={`absolute bottom-[8.5rem] right-0 transition-all duration-200 ${
          isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
          <button type="button"
            onClick={handleMessengerClick}
            className="flex items-center justify-center size-14 bg-black hover:bg-neutral-900 rounded-full shadow-lg transition-all duration-300 hover:scale-105 border border-neutral-800 hover:border-neutral-700 cursor-pointer"
            aria-label={t("messenger")}
          >
            {/* Messenger Icon SVG */}
            <svg
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.3 9.6C17.6 9.2 17.5 8.5 17.1 8.2C16.7 7.9 16.0 8.0 15.7 8.4L13.4 11.5L11.2 9.3C11.0 9.1 10.7 9.0 10.4 9.0C10.1 9.0 9.9 9.2 9.7 9.4L6.7 13.4C6.4 13.8 6.5 14.5 6.9 14.8C7.3 15.1 8.0 15.0 8.3 14.6L10.6 11.5L12.8 13.7C13.0 13.9 13.3 14.0 13.6 14.0C13.9 14.0 14.1 13.8 14.3 13.6L17.3 9.6Z"
                fill="white"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 23C10.8 23 10.1 22.9 9 22.5L6.9 23.6C5.6 24.2 4 23.3 4 21.8V19.5C1.8 17.5 1 15.2 1 12C1 5.9 5.9 1 12 1C18.1 1 23 5.9 23 12C23 18.1 18.1 23 12 23ZM6 18.6L5.4 18.0C3.7 16.5 3 14.7 3 12C3 7.0 7.0 3 12 3C17.0 3 21 7.0 21 12C21 17.0 17.0 21 12 21C11.0 21 10.6 20.9 9.6 20.6L8.8 20.3L6 21.8V18.6Z"
                fill="white"
              />
            </svg>
          </button>
        </div>

      {/* Zalo Button - Appears when open */}
      <div
        className={`absolute bottom-[4.5rem] right-0 transition-all duration-200 delay-75 ${
          isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
          <button type="button"
            onClick={handleZaloClick}
            className="flex items-center justify-center size-14 bg-black hover:bg-neutral-900 rounded-full shadow-lg transition-all duration-300 hover:scale-105 border border-neutral-800 hover:border-neutral-700 cursor-pointer"
            aria-label={t("zalo")}
          >
            {/* Zalo Icon SVG */}
            <svg
              className="size-6"
              viewBox="0 0 614.501 613.667"
              xmlns="http://www.w3.org/2000/svg"
              fill="white"
            >
              <path d="M464.7,301.4c-14-0-23.7,11.5-23.9,28.3c-0.3,17.8,9.2,29.2,24,29.2c14.3-0,23.8-11.1,24-28C489,313.5,479.1,301.4,464.7,301.4z" />
              <path d="M291.8,301.4c-14.5-0.3-24.6,11.6-24.6,29c-0,17,9.3,28.3,23.5,28.5c15.1,0.3,24.6-10.9,24.5-28.7C315.2,313.3,305.8,301.7,291.8,301.4z" />
              <path d="M310.5,3.2C143.1,3.2,7.4,138.9,7.4,306.3s135.7,303.1,303.1,303.1c167.4,0,303.1-135.7,303.1-303.1S477.9,3.2,310.5,3.2z M217.9,391.1c-33.4,0.8-66.8,1.4-100.1-0.3c-21.3-1.1-27.7-18.6-14.2-36.6c21.6-28.8,43.9-57.1,65.8-85.6c2.5-3.3,6.2-6,7.2-12.7c-16.6,0-32.8,0-49-0c-19.2-0.1-28.3-5.8-28.1-17.7c0.1-11.8,9.2-17.3,28.4-17.3c25.2-0,50.3-0.1,75.5,0c9.6,0,19.6,0.1,25.3,9.8c6.2,10.6,0.3,19.5-5.6,27.5c-21.3,28.5-43,56.6-64.6,84.9c-2.6,3.4-5.1,6.9-9.5,12.7c23.4,0,44.1-0.1,64.8,0c8.7,0,16.7,1.9,19.9,11.3C237.9,379.3,231.4,390.8,217.9,391.1z    M350.9,330.2c0,13.4-0.1,26.8,0,40.3c0.1,7.6-2.6,13.6-9.5,17.1c-7.3,3.6-14.7,3-20.3-3c-4-4.3-6.2-3.2-10.5-0.4c-18,11.7-39.9,10-56.6-3.9c-29.9-24.8-30-74.8-0.2-99.8c16.2-13.6,39.6-15.5,56.7-4.1c4,2.6,6.2,4.8,10.4-0.1c5.4-6.3,13.1-6.8,20.3-3.4c7.5,3.5,9.9,10.2,9.8,18.3C350.7,304.2,350.9,317.2,350.9,330.2z    M395.6,369.6c-0.1,12.8-6.4,19.8-17.2,19.9c-10.8,0.1-17.6-7-17.6-19.5c-0.2-43.4-0.2-86.7,0-130c0.1-12.3,7.3-19.9,17.9-19.2c11.4,0.8,17,7.4,17,18.8c0,22.1,0,44.2,0,66.3C395.7,327.1,395.8,348.3,395.6,369.6z M464,391.9c-34.4-0.3-59-26.4-58.8-62.3c0.3-35.7,25.3-60.7,60.4-60.4c34.6,0.3,59.4,26.3,59,62C524.2,366.5,498.5,392.2,464,391.9z" />
            </svg>
          </button>
        </div>

      {/* Main Toggle Button */}
      <button type="button"
        onClick={onToggle}
        className={`size-14 bg-black hover:bg-white text-white hover:text-black rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-neutral-800 hover:border-white flex items-center justify-center cursor-pointer ${
          isOpen ? "rotate-90" : ""
        }`}
        aria-label={isOpen ? t("closeContact") : t("openContact")}
      >
        {isOpen ? (
          <X className="size-6 transition-colors duration-200" />
        ) : (
          <MessageCircle className="size-6 transition-colors duration-200" />
        )}
      </button>
    </div>
  );
}
