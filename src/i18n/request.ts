import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

const messagesByLocale = {
  vi: () => import("../../messages/vi.json"),
  en: () => import("../../messages/en.json"),
  zh: () => import("../../messages/zh.json"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await messagesByLocale[locale]()).default,
  };
});
