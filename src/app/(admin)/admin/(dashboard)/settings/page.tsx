"use client";

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
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

// Sub-components import
import { RedEnvelopeSettingsPanel } from "@/components/admin/settings/RedEnvelopeSettingsPanel";
import { SnowSettingsPanel } from "@/components/admin/settings/SnowSettingsPanel";
import {
  WatermarkSettingsPanel,
  ProductWatermarkSettings,
} from "@/components/admin/settings/WatermarkSettingsPanel";
import { ExcludedPathsPanel } from "@/components/admin/settings/ExcludedPathsPanel";

const WATERMARK_SETTINGS_API_URL = "/api/settings/watermark-settings";

const DEFAULT_WATERMARK_SETTINGS: ProductWatermarkSettings = {
  enabled: true,
  text: "hasron.vn",
  opacity: 0.92,
  backgroundOpacity: 0.4,
  fontSize: 20,
  margin: 12,
};

export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const {
    enabled,
    activeEffects,
    intensity,
    redEnvelopeSettings,
    snowSettings,
    excludedPaths,
    isLoading,
  } = useSelector((state: RootState) => state.effectSettings);

  const [watermarkSettings, setWatermarkSettings] =
    useState<ProductWatermarkSettings>(DEFAULT_WATERMARK_SETTINGS);
  const [isWatermarkLoading, setIsWatermarkLoading] = useState(true);

  const fetchWatermarkSettings = async () => {
    try {
      setIsWatermarkLoading(true);
      const response = await fetch(WATERMARK_SETTINGS_API_URL);
      const data = await response.json().catch(() => null);
      if (response.ok && data?.success && data?.data) {
        setWatermarkSettings({
          ...DEFAULT_WATERMARK_SETTINGS,
          ...data.data,
        });
      } else {
        setWatermarkSettings(DEFAULT_WATERMARK_SETTINGS);
      }
    } catch {
      setWatermarkSettings(DEFAULT_WATERMARK_SETTINGS);
    } finally {
      setIsWatermarkLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchEffectSettings());
    fetchWatermarkSettings();
  }, [dispatch]);

  const effectSettings: EffectSettings = {
    enabled,
    activeEffects,
    intensity,
    redEnvelopeSettings,
    snowSettings,
    excludedPaths,
  };

  const effectSettingsKey = JSON.stringify(effectSettings);

  const handleRefresh = async () => {
    await Promise.all([
      dispatch(fetchEffectSettings()),
      fetchWatermarkSettings(),
    ]);
    toast.success("Đã tải lại cấu hình");
  };

  if ((isLoading && !redEnvelopeSettings) || isWatermarkLoading) {
    return <div className="p-8">Đang tải cài đặt…</div>;
  }

  return (
    <SettingsForm
      key={effectSettingsKey}
      initialSettings={effectSettings}
      token={token}
      watermarkSettings={watermarkSettings}
      setWatermarkSettings={setWatermarkSettings}
      onRefresh={handleRefresh}
    />
  );
}

function SettingsForm({
  initialSettings,
  token,
  watermarkSettings,
  setWatermarkSettings,
  onRefresh,
}: {
  initialSettings: EffectSettings;
  token: string | null;
  watermarkSettings: ProductWatermarkSettings;
  setWatermarkSettings: Dispatch<SetStateAction<ProductWatermarkSettings>>;
  onRefresh: () => Promise<void>;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [localSettings, setLocalSettings] =
    useState<EffectSettings>(initialSettings);

  const handleSave = async () => {
    try {
      await Promise.all([
        dispatch(updateEffectSettings(localSettings)).unwrap(),
        fetch(WATERMARK_SETTINGS_API_URL, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(watermarkSettings),
        }),
      ]);
      toast.success("Cập nhật cài đặt thành công!");
    } catch {
      toast.error("Lỗi khi cập nhật cài đặt");
    }
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cấu hình Hiệu ứng</h1>
          <p className="text-gray-500 mt-1">
            Điều chỉnh hiệu ứng Lì xì và Tuyết rơi theo thời gian thực
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
          >
            <RefreshCw size={18} />
            Tải lại
          </button>
          <button
            type="button"
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
          <span className="text-lg font-semibold text-gray-900">
            Bật hiệu ứng toàn trang
          </span>
          <div className="relative inline-flex items-center cursor-pointer">
            <input
              aria-label="checkbox"
              type="checkbox"
              className="sr-only peer"
              checked={localSettings.enabled}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, enabled: e.target.checked })
              }
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:size-6 after:transition-all peer-checked:bg-green-600"></div>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Red Envelope Settings */}
        <RedEnvelopeSettingsPanel
          enabled={localSettings.enabled}
          activeEffects={localSettings.activeEffects}
          redEnvelopeSettings={localSettings.redEnvelopeSettings}
          toggleEffect={toggleEffect}
          updateRedEnvelope={updateRedEnvelope}
        />

        {/* Snow Settings */}
        <SnowSettingsPanel
          enabled={localSettings.enabled}
          activeEffects={localSettings.activeEffects}
          snowSettings={localSettings.snowSettings}
          toggleEffect={toggleEffect}
          updateSnow={updateSnow}
        />
      </div>

      {/* Product Watermark Settings */}
      <WatermarkSettingsPanel
        watermarkSettings={watermarkSettings}
        updateWatermarkField={updateWatermarkField}
      />

      {/* Excluded Paths */}
      <ExcludedPathsPanel
        excludedPaths={localSettings.excludedPaths}
        addExcludedPath={addExcludedPath}
        removeExcludedPath={removeExcludedPath}
      />
    </div>
  );
}
