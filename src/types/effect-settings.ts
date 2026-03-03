export type EffectType = "snow" | "redEnvelope";

export interface RedEnvelopeSettings {
  fallSpeed: number;
  rotationSpeed: number;
  windStrength: number;
  sparkleFrequency: number;
  quantity: number;
}

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
