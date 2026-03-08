"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchEffectSettings,
  updateEffectSettings,
  EffectSettings,
  RedEnvelopeSettings,
  SnowSettings,
} from "@/store/effectSettingsSlice";
import { toast } from "sonner";
import { Save, RefreshCw } from "lucide-react";
import axios from "axios";
import { getApiUrl } from "@/lib/api-config";

interface ProductWatermarkSettings {
  enabled: boolean;
  text: string;
  opacity: number;
  backgroundOpacity: number;
  fontSize: number;
  margin: number;
}

const WATERMARK_SETTINGS_API_URL = getApiUrl("settings/watermark-settings");

const DEFAULT_WATERMARK_SETTINGS: ProductWatermarkSettings = {
  enabled: true,
  text: "hasron.vn",
  opacity: 0.92,
  backgroundOpacity: 0.4,
  fontSize: 20,
  margin: 12,
};

const getAdminAuthHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    enabled,
    activeEffects,
    intensity,
    redEnvelopeSettings,
    snowSettings,
    excludedPaths,
    isLoading,
  } = useSelector((state: RootState) => state.effectSettings);

  const [localSettings, setLocalSettings] = useState<EffectSettings>({
    enabled: false,
    activeEffects: [],
    intensity: "medium",
    redEnvelopeSettings: undefined,
    snowSettings: undefined,
    excludedPaths: [],
  });
  const [watermarkSettings, setWatermarkSettings] =
    useState<ProductWatermarkSettings>(DEFAULT_WATERMARK_SETTINGS);
  const [isWatermarkLoading, setIsWatermarkLoading] = useState(true);

  const fetchWatermarkSettings = async () => {
    try {
      setIsWatermarkLoading(true);
      const response = await axios.get(WATERMARK_SETTINGS_API_URL);
      if (response.data?.success && response.data?.data) {
        setWatermarkSettings({
          ...DEFAULT_WATERMARK_SETTINGS,
          ...response.data.data,
        });
      } else {
        setWatermarkSettings(DEFAULT_WATERMARK_SETTINGS);
      }
    } catch (error) {
      console.error("Failed to fetch watermark settings:", error);
      setWatermarkSettings(DEFAULT_WATERMARK_SETTINGS);
    } finally {
      setIsWatermarkLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchEffectSettings());
    fetchWatermarkSettings();
  }, [dispatch]);

  useEffect(() => {
    setLocalSettings({
      enabled,
      activeEffects,
      intensity,
      redEnvelopeSettings,
      snowSettings,
      excludedPaths,
    });
  }, [enabled, activeEffects, intensity, redEnvelopeSettings, snowSettings, excludedPaths]);

  const handleSave = async () => {
    try {
      await Promise.all([
        dispatch(updateEffectSettings(localSettings)).unwrap(),
        axios.put(WATERMARK_SETTINGS_API_URL, watermarkSettings, {
          headers: {
            ...getAdminAuthHeaders(),
          },
          withCredentials: true,
        }),
      ]);
      toast.success("Cập nhật cài đặt thành công!");
    } catch (error) {
      toast.error("Lỗi khi cập nhật cài đặt");
      console.error(error);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      dispatch(fetchEffectSettings()),
      fetchWatermarkSettings(),
    ]);
    toast.success("Đã tải lại cấu hình");
  };

  const updateWatermarkField = (
    key: keyof ProductWatermarkSettings,
    value: string | number | boolean
  ) => {
    setWatermarkSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateRedEnvelope = (key: keyof RedEnvelopeSettings, value: number) => {
    setLocalSettings((prev: EffectSettings) => ({
      ...prev,
      redEnvelopeSettings: {
        ...prev.redEnvelopeSettings!,
        [key]: value,
      },
    }));
  };

  const updateSnow = (key: keyof SnowSettings, value: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      snowSettings: {
        ...prev.snowSettings!,
        [key]: value,
      },
    }));
  };

  const toggleEffect = (effect: "snow" | "redEnvelope") => {
    setLocalSettings((prev) => {
      const current = prev.activeEffects || [];
      const isActive = current.includes(effect);
      return {
        ...prev,
        activeEffects: isActive
          ? current.filter((e) => e !== effect)
          : [...current, effect],
      };
    });
  };

  const addExcludedPath = (path: string) => {
    if (!path.trim()) return;
    setLocalSettings((prev) => ({
      ...prev,
      excludedPaths: [...(prev.excludedPaths || []), path.trim()],
    }));
  };

  const removeExcludedPath = (index: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      excludedPaths: (prev.excludedPaths || []).filter((_, i) => i !== index),
    }));
  };

  if ((isLoading && !localSettings.redEnvelopeSettings) || isWatermarkLoading) {
    return <div className="p-8">Đang tải cài đặt...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cấu hình Hiệu ứng</h1>
          <p className="text-gray-500 mt-1">Điều chỉnh hiệu ứng Lì xì và Tuyết rơi theo thời gian thực</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
          >
            <RefreshCw size={18} />
            Tải lại
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors shadow-md font-medium"
          >
            <Save size={20} />
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Main Switch */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-lg font-semibold text-gray-900">Bật hiệu ứng toàn trang</span>
          <div className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={localSettings.enabled}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, enabled: e.target.checked })
              }
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Red Envelope Settings */}
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-opacity duration-300 ${localSettings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold flex items-center gap-2 text-red-600">
              🧧 Hiệu ứng Lì Xì
            </h2>
            <input
              type="checkbox"
              className="accent-red-600 w-5 h-5 cursor-pointer"
              checked={localSettings.activeEffects.includes("redEnvelope")}
              onChange={() => toggleEffect("redEnvelope")}
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium text-gray-700">
                <span>Số lượng</span>
                <span className="text-gray-500 font-mono">{localSettings.redEnvelopeSettings?.quantity}</span>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={localSettings.redEnvelopeSettings?.quantity || 25}
                onChange={(e) => updateRedEnvelope("quantity", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium text-gray-700">
                <span>Tốc độ rơi</span>
                <span className="text-gray-500 font-mono">{localSettings.redEnvelopeSettings?.fallSpeed}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={localSettings.redEnvelopeSettings?.fallSpeed || 0.3}
                onChange={(e) => updateRedEnvelope("fallSpeed", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium text-gray-700">
                <span>Tốc độ xoay</span>
                <span className="text-gray-500 font-mono">{localSettings.redEnvelopeSettings?.rotationSpeed}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={localSettings.redEnvelopeSettings?.rotationSpeed || 1.0}
                onChange={(e) => updateRedEnvelope("rotationSpeed", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>
            
            
            
             <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium text-gray-700">
                <span>Sức gió</span>
                <span className="text-gray-500 font-mono">{localSettings.redEnvelopeSettings?.windStrength}</span>
              </label>
              <input
                type="range"
                min="0"
                max="2.0"
                step="0.1"
                value={localSettings.redEnvelopeSettings?.windStrength || 0.3}
                onChange={(e) => updateRedEnvelope("windStrength", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

             <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium text-gray-700">
                <span>Tần suất lấp lánh</span>
                <span className="text-gray-500 font-mono">{localSettings.redEnvelopeSettings?.sparkleFrequency}</span>
              </label>
              <input
                type="range"
                min="0"
                max="0.1"
                step="0.005"
                value={localSettings.redEnvelopeSettings?.sparkleFrequency || 0.02}
                onChange={(e) => updateRedEnvelope("sparkleFrequency", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex justify-between text-sm font-medium text-gray-700">
                  <span>Kích thước tối thiểu</span>
                  <span className="text-gray-500 font-mono">{localSettings.redEnvelopeSettings?.minSize}</span>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="1.5"
                  step="0.1"
                  value={localSettings.redEnvelopeSettings?.minSize || 0.8}
                  onChange={(e) => updateRedEnvelope("minSize", Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
              <div className="space-y-2">
                <label className="flex justify-between text-sm font-medium text-gray-700">
                  <span>Kích thước tối đa</span>
                  <span className="text-gray-500 font-mono">{localSettings.redEnvelopeSettings?.maxSize}</span>
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={localSettings.redEnvelopeSettings?.maxSize || 1.2}
                  onChange={(e) => updateRedEnvelope("maxSize", Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex justify-between text-sm font-medium text-gray-700">
                  <span>Tốc độ lật</span>
                  <span className="text-gray-500 font-mono">{localSettings.redEnvelopeSettings?.flipSpeed}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={localSettings.redEnvelopeSettings?.flipSpeed || 1.0}
                  onChange={(e) => updateRedEnvelope("flipSpeed", Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
              <div className="space-y-2">
                <label className="flex justify-between text-sm font-medium text-gray-700">
                  <span>Tốc độ lắc lư</span>
                  <span className="text-gray-500 font-mono">{localSettings.redEnvelopeSettings?.swaySpeed}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={localSettings.redEnvelopeSettings?.swaySpeed || 1.0}
                  onChange={(e) => updateRedEnvelope("swaySpeed", Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium text-gray-700">
                <span>Màu sắc (Hue Shift)</span>
                <span className="text-gray-500 font-mono">{localSettings.redEnvelopeSettings?.hue}</span>
              </label>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={localSettings.redEnvelopeSettings?.hue || 0}
                onChange={(e) => updateRedEnvelope("hue", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>


          </div>
        </div>

        {/* Snow Settings */}
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-opacity duration-300 ${localSettings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold flex items-center gap-2 text-blue-500">
              ❄️ Hiệu ứng Tuyết
            </h2>
            <input
              type="checkbox"
              className="accent-blue-500 w-5 h-5 cursor-pointer"
              checked={localSettings.activeEffects.includes("snow")}
              onChange={() => toggleEffect("snow")}
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium text-gray-700">
                <span>Mật độ</span>
                <span className="text-gray-500 font-mono">{localSettings.snowSettings?.density}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={localSettings.snowSettings?.density || 1.0}
                onChange={(e) => updateSnow("density", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium text-gray-700">
                <span>Tốc độ</span>
                <span className="text-gray-500 font-mono">{localSettings.snowSettings?.speed}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={localSettings.snowSettings?.speed || 1.0}
                onChange={(e) => updateSnow("speed", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium text-gray-700">
                <span>Kích thước</span>
                <span className="text-gray-500 font-mono">{localSettings.snowSettings?.size}</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={localSettings.snowSettings?.size || 1.0}
                onChange={(e) => updateSnow("size", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
             <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium text-gray-700">
                <span>Sức gió</span>
                <span className="text-gray-500 font-mono">{localSettings.snowSettings?.windStrength}</span>
              </label>
              <input
                type="range"
                min="0"
                max="2.0"
                step="0.1"
                value={localSettings.snowSettings?.windStrength || 0.2}
                onChange={(e) => updateSnow("windStrength", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Watermark Settings */}
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
              type="checkbox"
              className="accent-green-600 w-4 h-4"
              checked={watermarkSettings.enabled}
              onChange={(e) =>
                updateWatermarkField("enabled", e.target.checked)
              }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung watermark
            </label>
            <input
              type="text"
              value={watermarkSettings.text}
              onChange={(e) => updateWatermarkField("text", e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="hasron.vn"
              disabled={!watermarkSettings.enabled}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium text-gray-700">
                <span>Độ đậm chữ</span>
                <span className="text-gray-500 font-mono">
                  {watermarkSettings.opacity.toFixed(2)}
                </span>
              </label>
              <input
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
              />
            </div>

            <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium text-gray-700">
                <span>Độ đậm nền</span>
                <span className="text-gray-500 font-mono">
                  {watermarkSettings.backgroundOpacity.toFixed(2)}
                </span>
              </label>
              <input
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
              />
            </div>

            <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium text-gray-700">
                <span>Cỡ chữ (px)</span>
                <span className="text-gray-500 font-mono">
                  {watermarkSettings.fontSize}
                </span>
              </label>
              <input
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
              />
            </div>

            <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium text-gray-700">
                <span>Lề góc phải dưới (px)</span>
                <span className="text-gray-500 font-mono">
                  {watermarkSettings.margin}
                </span>
              </label>
              <input
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
              />
            </div>
          </div>
        </div>
      </div>

      {/* Excluded Paths */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">🚫 Đường dẫn bị loại trừ</h2>
        <p className="text-sm text-gray-500 mb-4">
          Nhập đường dẫn (URL path) mà bạn không muốn hiển thị hiệu ứng. Ví dụ: /checkout, /cart
        </p>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            id="newPathInput"
            placeholder="/path/to/exclude"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                addExcludedPath(target.value);
                target.value = '';
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.getElementById('newPathInput') as HTMLInputElement;
              addExcludedPath(input.value);
              input.value = '';
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Thêm
          </button>
        </div>

        <div className="space-y-2">
          {localSettings.excludedPaths?.map((path, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-mono text-sm">{path}</span>
              <button
                onClick={() => removeExcludedPath(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                Xóa
              </button>
            </div>
          ))}
          {!localSettings.excludedPaths?.length && (
            <p className="text-sm text-gray-400 italic">Chưa có đường dẫn nào bị loại trừ</p>
          )}
        </div>
      </div>
    </div>
  );
}
