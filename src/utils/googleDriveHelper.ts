/**
 * Google Drive URL conversion utilities
 */

const DRIVE_HOSTNAMES = new Set([
  'drive.google.com',
  'docs.google.com',
]);

/**
 * Convert Google Drive URL to direct googleusercontent URL
 * @param originalUrl - Original Google Drive URL
 * @returns Converted URL for direct access
 */
export function convertDriveUrl(originalUrl: string): string {
  if (!originalUrl) {
    return originalUrl;
  }

  try {
    const url = new URL(originalUrl);

    // Already converted
    if (url.hostname === 'lh3.googleusercontent.com') {
      return originalUrl;
    }

    // Not a Google Drive URL
    if (!DRIVE_HOSTNAMES.has(url.hostname)) {
      return originalUrl;
    }

    // Extract file ID from URL
    let id = url.searchParams.get('id');

    // Try to extract from path (format: /file/d/{id}/view)
    if (!id && url.pathname.includes('/d/')) {
      const parts = url.pathname.split('/');
      const idIndex = parts.findIndex((part) => part === 'd');

      if (idIndex !== -1 && parts[idIndex + 1]) {
        id = parts[idIndex + 1];
      }
    }

    if (!id) {
      console.warn('Could not extract file ID from Google Drive URL:', originalUrl);
      return originalUrl;
    }

    // Convert to direct googleusercontent URL
    return `https://lh3.googleusercontent.com/d/${id}`;
  } catch (error) {
    console.warn('convertDriveUrl failed for url:', originalUrl, error);
    return originalUrl;
  }
}

/**
 * Check if URL is a Google Drive URL
 */
export function isGoogleDriveUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return DRIVE_HOSTNAMES.has(parsedUrl.hostname) || 
           parsedUrl.hostname === 'lh3.googleusercontent.com';
  } catch {
    return false;
  }
}
