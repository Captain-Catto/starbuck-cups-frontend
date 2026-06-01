import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
export type EffectType = "snow" | "redEnvelope";

export interface RedEnvelopeSettings {
  fallSpeed: number;
  rotationSpeed: number;
  windStrength: number;
  sparkleFrequency: number;
  quantity: number;
  minSize: number;
  maxSize: number;
  flipSpeed: number;
  swaySpeed: number;
  hue: number;
}

// ... 

export interface SnowSettings {
  speed: number;
  density: number;
  size: number;
  windStrength: number;
}

export interface EffectSettings {
  enabled: boolean;
  activeEffects: EffectType[];
  intensity: "low" | "medium" | "high";
  redEnvelopeSettings?: RedEnvelopeSettings;
  snowSettings?: SnowSettings;
  excludedPaths?: string[];
}

interface EffectSettingsState extends EffectSettings {
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_RED_ENVELOPE_SETTINGS: RedEnvelopeSettings = {
  fallSpeed: 0.3,
  rotationSpeed: 1.0,
  windStrength: 0.3,
  sparkleFrequency: 0.02,
  quantity: 25,
  minSize: 0.8,
  maxSize: 1.2,
  flipSpeed: 1.0,
  swaySpeed: 1.0,
  hue: 0,
};

const DEFAULT_SNOW_SETTINGS: SnowSettings = {
  speed: 1.0,
  density: 1.0,
  size: 1.0,
  windStrength: 0.2,
};

const initialState: EffectSettingsState = {
  enabled: false,
  activeEffects: [],
  intensity: "medium",
  redEnvelopeSettings: DEFAULT_RED_ENVELOPE_SETTINGS,
  snowSettings: DEFAULT_SNOW_SETTINGS,
  excludedPaths: [],
  isLoading: false,
  error: null,
};

const EFFECT_SETTINGS_API_URL = "/api/settings/effect-settings";

async function readSettingsResponse(response: Response, fallbackMessage: string) {
  const data = await response.json().catch(() => ({
    success: false,
    message: response.statusText,
  }));

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data.data;
}

// Thunks
export const fetchEffectSettings = createAsyncThunk(
  "effectSettings/fetch",
  async () => {
    try {
      const response = await fetch(EFFECT_SETTINGS_API_URL);
      return readSettingsResponse(response, "Failed to fetch settings");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch settings");
    }
  }
);

export const updateEffectSettings = createAsyncThunk(
  "effectSettings/update",
  async (settings: EffectSettings, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    try {
      const response = await fetch(EFFECT_SETTINGS_API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(settings),
      });
      return readSettingsResponse(response, "Failed to update settings");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update settings");
    }
  }
);

const effectSettingsSlice = createSlice({
  name: "effectSettings",
  initialState,
  reducers: {
    updateFromSocket: (state, action: PayloadAction<EffectSettings>) => {
      // Direct update from socket
      return {
        ...state,
        ...action.payload,
        // Ensure nested objects are merged correctly if partial
        redEnvelopeSettings: {
            ...DEFAULT_RED_ENVELOPE_SETTINGS,
            ...(action.payload.redEnvelopeSettings || {})
        },
        snowSettings: {
            ...DEFAULT_SNOW_SETTINGS,
            ...(action.payload.snowSettings || {})
        }
      };
    },
    setEffectEnabled: (state, action: PayloadAction<boolean>) => {
      state.enabled = action.payload;
    },
    // Add other local setters if needed for optimistic UI updates
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchEffectSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEffectSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        // Merge state
        Object.assign(state, action.payload);
        // Ensure defaults
        if (!state.redEnvelopeSettings) state.redEnvelopeSettings = DEFAULT_RED_ENVELOPE_SETTINGS;
        if (!state.snowSettings) state.snowSettings = DEFAULT_SNOW_SETTINGS;
      })
      .addCase(fetchEffectSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Error fetching settings";
      })
      // Update
      .addCase(updateEffectSettings.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      });
  },
});

export const { updateFromSocket, setEffectEnabled } = effectSettingsSlice.actions;
export default effectSettingsSlice.reducer;
