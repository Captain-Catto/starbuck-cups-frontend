import type { AbstractIntlMessages } from "next-intl";

// Namespaces consumed by client components under src/app/[locale].
// Server-only namespaces (seo, categoryPage, footer) are excluded to shrink
// the hydration payload. Grep `useTranslations(` before adding/removing entries.
const CLIENT_NAMESPACES = [
  "common",
  "homePage",
  "filters",
  "productDetail",
  "cart",
  "cartForm",
  "cartNotification",
  "error",
  "notFound",
  "floating",
  "searchModal",
  "imageViewer",
  "pagination",
  "contacts",
] as const;

export function pickClientMessages(
  messages: AbstractIntlMessages
): AbstractIntlMessages {
  const picked: AbstractIntlMessages = {};
  for (const ns of CLIENT_NAMESPACES) {
    if (ns in messages) picked[ns] = messages[ns];
  }
  return picked;
}
