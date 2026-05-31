"use client";

import { RedEnvelopeSettings } from "@/store/effectSettingsSlice";

interface RedEnvelopeSettingsPanelProps {
  enabled: boolean;
  activeEffects: string[];
  redEnvelopeSettings?: RedEnvelopeSettings;
  toggleEffect: (effect: "snow" | "redEnvelope") => void;
  updateRedEnvelope: (key: keyof RedEnvelopeSettings, value: number) => void;
}

export function RedEnvelopeSettingsPanel({
  enabled,
  activeEffects,
  redEnvelopeSettings,
  toggleEffect,
  updateRedEnvelope,
}: RedEnvelopeSettingsPanelProps) {
  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-opacity duration-300 ${
        enabled ? "opacity-100" : "opacity-50 pointer-events-none"
      }`}
    >
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold flex items-center gap-2 text-red-600">
          🧧 Hiệu ứng Lì Xì
        </h2>
        <input
          aria-label="checkbox"
          type="checkbox"
          className="accent-red-600 size-5 cursor-pointer"
          checked={activeEffects.includes("redEnvelope")}
          onChange={() => toggleEffect("redEnvelope")}
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label
            className="flex justify-between text-sm font-medium text-gray-700"
            htmlFor="page-range"
          >
            <span>Số lượng</span>
            <span className="text-gray-500 font-mono">
              {redEnvelopeSettings?.quantity}
            </span>
          </label>
          <input
            aria-label="range"
            type="range"
            min="5"
            max="100"
            step="5"
            value={redEnvelopeSettings?.quantity || 25}
            onChange={(e) => updateRedEnvelope("quantity", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            id="page-range"
          />
        </div>

        <div className="space-y-2">
          <label
            className="flex justify-between text-sm font-medium text-gray-700"
            htmlFor="page-range-2"
          >
            <span>Tốc độ rơi</span>
            <span className="text-gray-500 font-mono">
              {redEnvelopeSettings?.fallSpeed}
            </span>
          </label>
          <input
            aria-label="range"
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={redEnvelopeSettings?.fallSpeed || 0.3}
            onChange={(e) => updateRedEnvelope("fallSpeed", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            id="page-range-2"
          />
        </div>

        <div className="space-y-2">
          <label
            className="flex justify-between text-sm font-medium text-gray-700"
            htmlFor="page-range-3"
          >
            <span>Tốc độ xoay</span>
            <span className="text-gray-500 font-mono">
              {redEnvelopeSettings?.rotationSpeed}
            </span>
          </label>
          <input
            aria-label="range"
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={redEnvelopeSettings?.rotationSpeed || 1.0}
            onChange={(e) =>
              updateRedEnvelope("rotationSpeed", Number(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            id="page-range-3"
          />
        </div>

        <div className="space-y-2">
          <label
            className="flex justify-between text-sm font-medium text-gray-700"
            htmlFor="page-range-4"
          >
            <span>Sức gió</span>
            <span className="text-gray-500 font-mono">
              {redEnvelopeSettings?.windStrength}
            </span>
          </label>
          <input
            aria-label="range"
            type="range"
            min="0"
            max="2.0"
            step="0.1"
            value={redEnvelopeSettings?.windStrength || 0.3}
            onChange={(e) =>
              updateRedEnvelope("windStrength", Number(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            id="page-range-4"
          />
        </div>

        <div className="space-y-2">
          <label
            className="flex justify-between text-sm font-medium text-gray-700"
            htmlFor="page-range-5"
          >
            <span>Tần suất lấp lánh</span>
            <span className="text-gray-500 font-mono">
              {redEnvelopeSettings?.sparkleFrequency}
            </span>
          </label>
          <input
            aria-label="range"
            type="range"
            min="0"
            max="0.1"
            step="0.005"
            value={redEnvelopeSettings?.sparkleFrequency || 0.02}
            onChange={(e) =>
              updateRedEnvelope("sparkleFrequency", Number(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            id="page-range-5"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              className="flex justify-between text-sm font-medium text-gray-700"
              htmlFor="page-range-6"
            >
              <span>Kích thước tối thiểu</span>
              <span className="text-gray-500 font-mono">
                {redEnvelopeSettings?.minSize}
              </span>
            </label>
            <input
              aria-label="range"
              type="range"
              min="0.2"
              max="1.5"
              step="0.1"
              value={redEnvelopeSettings?.minSize || 0.8}
              onChange={(e) => updateRedEnvelope("minSize", Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              id="page-range-6"
            />
          </div>
          <div className="space-y-2">
            <label
              className="flex justify-between text-sm font-medium text-gray-700"
              htmlFor="page-range-7"
            >
              <span>Kích thước tối đa</span>
              <span className="text-gray-500 font-mono">
                {redEnvelopeSettings?.maxSize}
              </span>
            </label>
            <input
              aria-label="range"
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={redEnvelopeSettings?.maxSize || 1.2}
              onChange={(e) => updateRedEnvelope("maxSize", Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              id="page-range-7"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              className="flex justify-between text-sm font-medium text-gray-700"
              htmlFor="page-range-8"
            >
              <span>Tốc độ lật</span>
              <span className="text-gray-500 font-mono">
                {redEnvelopeSettings?.flipSpeed}
              </span>
            </label>
            <input
              aria-label="range"
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={redEnvelopeSettings?.flipSpeed || 1.0}
              onChange={(e) =>
                updateRedEnvelope("flipSpeed", Number(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              id="page-range-8"
            />
          </div>
          <div className="space-y-2">
            <label
              className="flex justify-between text-sm font-medium text-gray-700"
              htmlFor="page-range-9"
            >
              <span>Tốc độ lắc lư</span>
              <span className="text-gray-500 font-mono">
                {redEnvelopeSettings?.swaySpeed}
              </span>
            </label>
            <input
              aria-label="range"
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={redEnvelopeSettings?.swaySpeed || 1.0}
              onChange={(e) =>
                updateRedEnvelope("swaySpeed", Number(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              id="page-range-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="flex justify-between text-sm font-medium text-gray-700"
            htmlFor="page-range-10"
          >
            <span>Màu sắc (Hue Shift)</span>
            <span className="text-gray-500 font-mono">
              {redEnvelopeSettings?.hue}
            </span>
          </label>
          <input
            aria-label="range"
            type="range"
            min="0"
            max="360"
            step="5"
            value={redEnvelopeSettings?.hue || 0}
            onChange={(e) => updateRedEnvelope("hue", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            id="page-range-10"
          />
        </div>
      </div>
    </div>
  );
}
