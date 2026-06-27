import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { convertDriveUrl } from "@/utils/googleDriveHelper";

// Persistent cache directory (avoid putting in .next because deployments often delete it).
const DEFAULT_CACHE_DIR = path.join(process.cwd(), ".image-cache", "images");

// Get cache directory based on environment
function getCacheDir(): string {
  if (process.env.IMAGE_CACHE_DIR) {
    return process.env.IMAGE_CACHE_DIR;
  }
  // In serverless environments (Vercel, AWS Lambda), use /tmp
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join("/tmp", "image-cache");
  }
  // In local/VPS, use persistent folder in project root
  return DEFAULT_CACHE_DIR;
}

const CACHE_DIR = getCacheDir();
const DEFAULT_IMAGE_WIDTH = 1200;
const MAX_IMAGE_WIDTH = 1920;
const MIN_IMAGE_QUALITY = 40;
const MAX_IMAGE_QUALITY = 90;
const DEFAULT_IMAGE_QUALITY = 70;
const MAX_SOURCE_IMAGE_BYTES = 15 * 1024 * 1024;
const IMAGE_FETCH_TIMEOUT_MS = 8000;
const SUPPORTED_FORMATS = new Set(["webp", "avif", "jpeg", "png"]);
const ALLOWED_IMAGE_HOSTS = new Set([
  "example.com",
  "flagcdn.com",
  "hasron-starbucks-shop.s3.ap-southeast-1.amazonaws.com",
  "starbucks-shop.s3.ap-southeast-1.amazonaws.com",
  "drive.google.com",
  "docs.google.com",
  "lh3.googleusercontent.com",
]);

const FALLBACK_SVG = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f3f4f6"/>
  <rect width="100%" height="100%" fill="none" stroke="#e5e7eb" stroke-width="4"/>
  <text x="50%" y="45%" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="bold" fill="#374151" text-anchor="middle">Starbucks Cup</text>
  <text x="50%" y="55%" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#6b7280" text-anchor="middle">Image Unavailable (403/404)</text>
</svg>
`;

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    // Create directory recursively to ensure all parent dirs exist
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

// Generate cache key from URL and params
function getCacheKey(
  url: string,
  width: number,
  quality: number,
  format: string
): string {
  const hash = crypto
    .createHash("md5")
    .update(`${url}-${width}-${quality}-${format}`)
    .digest("hex");
  return `${hash}.${format}`;
}

// Fetch image from URL
async function fetchImage(url: string): Promise<Buffer> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);

  const response = await fetch(url, {
    cache: "no-store",
    signal: controller.signal,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
    },
  }).finally(() => clearTimeout(timeoutId));

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && !contentType.startsWith("image/")) {
    throw new Error(`Unsupported image content type: ${contentType}`);
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error("Source image is too large");
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error("Source image is too large");
  }

  return Buffer.from(arrayBuffer);
}

function parseIntegerParam(
  value: string | null,
  fallback: number,
  min: number,
  max: number
) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function parseImageUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:") {
      return null;
    }

    if (!ALLOWED_IMAGE_HOSTS.has(parsedUrl.hostname)) {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let url = searchParams.get("url");
    const width = parseIntegerParam(
      searchParams.get("w"),
      DEFAULT_IMAGE_WIDTH,
      64,
      MAX_IMAGE_WIDTH
    );
    const quality = parseIntegerParam(
      searchParams.get("q"),
      DEFAULT_IMAGE_QUALITY,
      MIN_IMAGE_QUALITY,
      MAX_IMAGE_QUALITY
    );
    const format = searchParams.get("f") || "webp";

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    // Convert Google Drive URLs to direct googleusercontent URLs
    url = convertDriveUrl(url);
    const parsedUrl = parseImageUrl(url);

    if (!parsedUrl) {
      return NextResponse.json(
        { error: "Unsupported image URL" },
        { status: 400 }
      );
    }

    url = parsedUrl;

    // Validate format
    if (!SUPPORTED_FORMATS.has(format)) {
      return NextResponse.json(
        { error: "Invalid format. Supported: webp, avif, jpeg, png" },
        { status: 400 }
      );
    }

    // Ensure cache directory exists
    await ensureCacheDir();

    // Check cache first
    const cacheKey = getCacheKey(url, width, quality, format);
    const cachePath = path.join(CACHE_DIR, cacheKey);

    try {
      // react-doctor-disable-next-line react-doctor/server-hoist-static-io -- The path is computed dynamically based on the incoming request params, so this file read cannot be hoisted to module scope.
      const cachedImage = await fs.readFile(cachePath);
      const cachedBody = cachedImage as unknown as BodyInit;
      return new NextResponse(cachedBody, {
        headers: {
          "Content-Type": `image/${format}`,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // Cache miss, continue to optimization
    }

    // Fetch original image with fallback protection
    let imageBuffer: Buffer;
    let isFallback = false;
    try {
      imageBuffer = await fetchImage(url);
    } catch (fetchError) {
      console.warn(`Failed to fetch original image (${url}), using fallback SVG placeholder:`, fetchError);
      imageBuffer = Buffer.from(FALLBACK_SVG);
      isFallback = true;
    }

    // Process image with sharp
    let sharpInstance = sharp(imageBuffer);

    // Get metadata to check if resize is needed
    const metadata = await sharpInstance.metadata();

    // Only resize if image is larger than requested width
    if (metadata.width && metadata.width > width) {
      sharpInstance = sharpInstance.resize(width, null, {
        withoutEnlargement: true,
        fit: "inside",
      });
    }

    // Convert to requested format with optimized settings
    switch (format) {
      case "webp":
        sharpInstance = sharpInstance.webp({
          quality,
          effort: 4,
          smartSubsample: true,
        });
        break;
      case "avif":
        sharpInstance = sharpInstance.avif({
          quality,
          effort: 4,
        });
        break;
      case "jpeg":
        sharpInstance = sharpInstance.jpeg({
          quality,
          mozjpeg: true,
        });
        break;
      case "png":
        sharpInstance = sharpInstance.png({
          quality,
          compressionLevel: 9, // Max compression
        });
        break;
    }

    const optimizedImage = await sharpInstance.toBuffer();

    // Save to cache if not using the placeholder fallback
    if (!isFallback) {
      await fs.writeFile(cachePath, optimizedImage);
    }

    // Return optimized image
    const optimizedBody = optimizedImage as unknown as BodyInit;
    return new NextResponse(optimizedBody, {
      headers: {
        "Content-Type": `image/${format}`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Failed to optimize image:", error);
    return NextResponse.json(
      { error: "Failed to optimize image" },
      { status: 500 }
    );
  }
}
