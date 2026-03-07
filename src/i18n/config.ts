export const locales = ["vi", "en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";
export const localeNames: Record<Locale, string> = {
  vi: "VN",
  en: "EN",
  zh: "ZH",
};
