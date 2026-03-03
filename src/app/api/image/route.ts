import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { convertDriveUrl } from "@/utils/googleDriveHelper";

// Tạo cache directory
// Default cache directory
const DEFAULT_CACHE_DIR = path.join(process.cwd(), ".next", "cache", "images");

// Get cache directory based on environment
function getCacheDir(): string {
  // In serverless environments (Vercel, AWS Lambda), use /tmp
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join("/tmp", "image-cache");
  }
  // In local/VPS, use .next/cache/images
  return DEFAULT_CACHE_DIR;
}

const CACHE_DIR = getCacheDir();

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
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let url = searchParams.get("url");
    const width = parseInt(searchParams.get("w") || "1200");
    const quality = parseInt(searchParams.get("q") || "70");
    const format = searchParams.get("f") || "webp";

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    // Convert Google Drive URLs to direct googleusercontent URLs
    url = convertDriveUrl(url);

    // Validate format
    if (!["webp", "avif", "jpeg", "png"].includes(format)) {
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

    // Fetch original image
    const imageBuffer = await fetchImage(url);

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
          effort: 6,
          smartSubsample: true,
        });
        break;
      case "avif":
        sharpInstance = sharpInstance.avif({
          quality,
          effort: 9,
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

    // Save to cache
    await fs.writeFile(cachePath, optimizedImage);

    // Return optimized image
    const optimizedBody = optimizedImage as unknown as BodyInit;
    return new NextResponse(optimizedBody, {
      headers: {
        "Content-Type": `image/${format}`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image optimization error:", error);
    return NextResponse.json(
      {
        error: "Failed to optimize image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
