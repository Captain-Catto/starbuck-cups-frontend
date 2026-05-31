"use client";

import { SnowSettings } from "@/store/effectSettingsSlice";

interface SnowSettingsPanelProps {
  enabled: boolean;
  activeEffects: string[];
  snowSettings?: SnowSettings;
  toggleEffect: (effect: "snow" | "redEnvelope") => void;
  updateSnow: (key: keyof SnowSettings, value: number) => void;
}

export function SnowSettingsPanel({
  enabled,
  activeEffects,
  snowSettings,
  toggleEffect,
  updateSnow,
}: SnowSettingsPanelProps) {
  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-opacity duration-300 ${
        enabled ? "opacity-100" : "opacity-50 pointer-events-none"
      }`}
    >
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold flex items-center gap-2 text-blue-500">
          ❄️ Hiệu ứng Tuyết
        </h2>
        <input
          aria-label="checkbox"
          type="checkbox"
          className="accent-blue-500 size-5 cursor-pointer"
          checked={activeEffects.includes("snow")}
          onChange={() => toggleEffect("snow")}
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label
            className="flex justify-between text-sm font-medium text-gray-700"
            htmlFor="page-range-11"
          >
            <span>Mật độ</span>
            <span className="text-gray-500 font-mono">
              {snowSettings?.density}
            </span>
          </label>
          <input
            aria-label="range"
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={snowSettings?.density || 1.0}
            onChange={(e) => updateSnow("density", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            id="page-range-11"
          />
        </div>

        <div className="space-y-2">
          <label
            className="flex justify-between text-sm font-medium text-gray-700"
            htmlFor="page-range-12"
          >
            <span>Tốc độ</span>
            <span className="text-gray-500 font-mono">
              {snowSettings?.speed}
            </span>
          </label>
          <input
            aria-label="range"
            type="range"
            min="0.1"
            max="3.0"
            step="0.1"
            value={snowSettings?.speed || 1.0}
            onChange={(e) => updateSnow("speed", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            id="page-range-12"
          />
        </div>

        <div className="space-y-2">
          <label
            className="flex justify-between text-sm font-medium text-gray-700"
            htmlFor="page-range-13"
          >
            <span>Kích thước</span>
            <span className="text-gray-500 font-mono">
              {snowSettings?.size}
            </span>
          </label>
          <input
            aria-label="range"
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={snowSettings?.size || 1.0}
            onChange={(e) => updateSnow("size", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            id="page-range-13"
          />
        </div>

        <div className="space-y-2">
          <label
            className="flex justify-between text-sm font-medium text-gray-700"
            htmlFor="page-range-14"
          >
            <span>Sức gió</span>
            <span className="text-gray-500 font-mono">
              {snowSettings?.windStrength}
            </span>
          </label>
          <input
            aria-label="range"
            type="range"
            min="0"
            max="2.0"
            step="0.1"
            value={snowSettings?.windStrength || 0.2}
            onChange={(e) => updateSnow("windStrength", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            id="page-range-14"
          />
        </div>
      </div>
    </div>
  );
}
