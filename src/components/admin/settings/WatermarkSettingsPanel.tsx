"use client";

export interface ProductWatermarkSettings {
  enabled: boolean;
  text: string;
  opacity: number;
  backgroundOpacity: number;
  fontSize: number;
  margin: number;
}

interface WatermarkSettingsPanelProps {
  watermarkSettings: ProductWatermarkSettings;
  updateWatermarkField: (
    key: keyof ProductWatermarkSettings,
    value: string | number | boolean
  ) => void;
}

export function WatermarkSettingsPanel({
  watermarkSettings,
  updateWatermarkField,
}: WatermarkSettingsPanelProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            🖼️ Watermark ảnh sản phẩm
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Watermark sẽ được gắn ở góc phải dưới trước khi chuyển ảnh sang AVIF.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            aria-label="checkbox"
            type="checkbox"
            className="accent-green-600 size-4"
            checked={watermarkSettings.enabled}
            onChange={(e) => updateWatermarkField("enabled", e.target.checked)}
          />
          Bật watermark
        </label>
      </div>

      <div
        className={`space-y-5 transition-opacity ${
          watermarkSettings.enabled ? "opacity-100" : "opacity-50"
        }`}
      >
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="page-hasron-vn"
          >
            Nội dung watermark
          </label>
          <input
            aria-label="hasron.vn"
            type="text"
            value={watermarkSettings.text}
            onChange={(e) => updateWatermarkField("text", e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="hasron.vn"
            disabled={!watermarkSettings.enabled}
            id="page-hasron-vn"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label
              className="flex justify-between text-sm font-medium text-gray-700"
              htmlFor="page-range-15"
            >
              <span>Độ đậm chữ</span>
              <span className="text-gray-500 font-mono">
                {watermarkSettings.opacity.toFixed(2)}
              </span>
            </label>
            <input
              aria-label="range"
              type="range"
              min="0.1"
              max="1"
              step="0.01"
              value={watermarkSettings.opacity}
              onChange={(e) =>
                updateWatermarkField("opacity", Number(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              disabled={!watermarkSettings.enabled}
              id="page-range-15"
            />
          </div>

          <div className="space-y-2">
            <label
              className="flex justify-between text-sm font-medium text-gray-700"
              htmlFor="page-range-16"
            >
              <span>Độ đậm nền</span>
              <span className="text-gray-500 font-mono">
                {watermarkSettings.backgroundOpacity.toFixed(2)}
              </span>
            </label>
            <input
              aria-label="range"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={watermarkSettings.backgroundOpacity}
              onChange={(e) =>
                updateWatermarkField(
                  "backgroundOpacity",
                  Number(e.target.value)
                )
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              disabled={!watermarkSettings.enabled}
              id="page-range-16"
            />
          </div>

          <div className="space-y-2">
            <label
              className="flex justify-between text-sm font-medium text-gray-700"
              htmlFor="page-range-17"
            >
              <span>Cỡ chữ (px)</span>
              <span className="text-gray-500 font-mono">
                {watermarkSettings.fontSize}
              </span>
            </label>
            <input
              aria-label="range"
              type="range"
              min="12"
              max="40"
              step="1"
              value={watermarkSettings.fontSize}
              onChange={(e) =>
                updateWatermarkField("fontSize", Number(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              disabled={!watermarkSettings.enabled}
              id="page-range-17"
            />
          </div>

          <div className="space-y-2">
            <label
              className="flex justify-between text-sm font-medium text-gray-700"
              htmlFor="page-range-18"
            >
              <span>Lề góc phải dưới (px)</span>
              <span className="text-gray-500 font-mono">
                {watermarkSettings.margin}
              </span>
            </label>
            <input
              aria-label="range"
              type="range"
              min="4"
              max="30"
              step="1"
              value={watermarkSettings.margin}
              onChange={(e) =>
                updateWatermarkField("margin", Number(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              disabled={!watermarkSettings.enabled}
              id="page-range-18"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
