/**
 * One-time script: pre-warm the /api/image proxy cache for all product OG images.
 * Run after deploying the proxy-URL OG image change so Messenger gets fast responses.
 *
 * Usage:
 *   node scripts/warmup-og-images.mjs
 *
 * Env vars (or set inline):
 *   SITE_URL       — e.g. https://hasron.vn  (default)
 *   API_URL        — e.g. https://api.hasron.vn/api  (default)
 */

const SITE_URL = process.env.SITE_URL || "https://hasron.vn";
const API_URL = process.env.API_URL || "https://api.hasron.vn/api";
const CONCURRENCY = 5; // parallel fetches at a time

function convertDriveUrl(originalUrl) {
  if (!originalUrl || originalUrl.startsWith("/") || originalUrl.startsWith("data:")) {
    return originalUrl;
  }
  try {
    const url = new URL(originalUrl);
    if (url.hostname === "lh3.googleusercontent.com") return originalUrl;
    if (!["drive.google.com", "docs.google.com"].includes(url.hostname)) return originalUrl;
    let id = url.searchParams.get("id");
    if (!id && url.pathname.includes("/d/")) {
      const parts = url.pathname.split("/");
      const idx = parts.findIndex((p) => p === "d");
      if (idx !== -1 && parts[idx + 1]) id = parts[idx + 1];
    }
    if (!id) return originalUrl;
    return `https://lh3.googleusercontent.com/d/${id}`;
  } catch {
    return originalUrl;
  }
}

async function fetchAllProducts() {
  const res = await fetch(`${API_URL}/products/public?limit=500&locale=vi`);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  const data = await res.json();
  return data.data?.items ?? [];
}

async function warmImage(product) {
  const rawUrl = product.productImages?.[0]?.url;
  if (!rawUrl) return;
  const converted = convertDriveUrl(rawUrl);
  const proxyUrl = `${SITE_URL}/api/image?url=${encodeURIComponent(converted)}&w=1200&q=85&f=jpeg`;
  try {
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(45_000) });
    console.log(`[${res.status}] ${product.slug}`);
  } catch (err) {
    console.error(`[ERR] ${product.slug}: ${err.message}`);
  }
}

async function runInBatches(items, fn, concurrency) {
  for (let i = 0; i < items.length; i += concurrency) {
    await Promise.all(items.slice(i, i + concurrency).map(fn));
  }
}

console.log(`Warming OG image cache for all products (site: ${SITE_URL}) …`);
const products = await fetchAllProducts();
console.log(`Found ${products.length} products.`);
await runInBatches(products, warmImage, CONCURRENCY);
console.log("Done.");
