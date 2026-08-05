/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// In-memory set of preloaded image URLs for instant synchronous rendering
const memoryCache = new Set<string>();

// IndexedDB database name for persistent mobile image caching
const DB_NAME = 'ImmortalImageCacheDB';
const STORE_NAME = 'cached_images';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase | null> | null = null;

function getDB(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  dbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        }
      };
      request.onsuccess = (e: any) => resolve(e.target.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

  return dbPromise;
}

/**
 * Checks if the user is currently on a low-bandwidth or data-saver mobile connection.
 */
export function isLowBandwidthConnection(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (!conn) return false;

  if (conn.saveData) return true;
  if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.effectiveType === '3g') return true;
  if (conn.downlink && conn.downlink < 1.5) return true; // less than 1.5 Mbps

  return false;
}

/**
 * Checks whether an image URL is already in memory cache.
 */
export function isImageMemoryCached(url: string): boolean {
  return memoryCache.has(url);
}

/**
 * Mark URL as cached in memory.
 */
export function markImageMemoryCached(url: string): void {
  if (url) memoryCache.add(url);
}

/**
 * Retrieve cached Data URL or Blob URL from IndexedDB
 */
export async function getCachedImageDataURL(url: string): Promise<string | null> {
  if (!url) return null;
  if (memoryCache.has(url)) return url;

  try {
    const db = await getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(url);

      getReq.onsuccess = () => {
        const result = getReq.result;
        if (result && result.dataUrl) {
          memoryCache.add(url);
          resolve(result.dataUrl);
        } else {
          resolve(null);
        }
      };
      getReq.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Cache an image in IndexedDB as a compressed base64 Data URL for offline / low-bandwidth instant loading.
 */
export async function cacheImageDataURL(url: string, dataUrl: string): Promise<void> {
  if (!url || !dataUrl) return;
  memoryCache.add(url);

  try {
    const db = await getDB();
    if (!db) return;

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({
      url,
      dataUrl,
      timestamp: Date.now()
    });
  } catch (err) {
    console.warn('Image caching to IDB skipped:', err);
  }
}

/**
 * Generates an SVG blurred placeholder URL with smooth gradients matching dark/light mode.
 */
export function generateBlurredSvgPlaceholder(width = 400, height = 400, title = ''): string {
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue1 = (hash * 37) % 360;
  const hue2 = (hue1 + 40) % 360;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="p-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue1}, 25%, 20%)" />
        <stop offset="50%" stop-color="hsl(${hue2}, 30%, 15%)" />
        <stop offset="100%" stop-color="hsl(${hue1}, 20%, 10%)" />
      </linearGradient>
      <filter id="p-blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="24" />
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#p-grad)" />
    <g filter="url(#p-blur)" opacity="0.6">
      <circle cx="${width * 0.35}" cy="${height * 0.35}" r="${Math.min(width, height) * 0.3}" fill="hsl(${hue1}, 70%, 50%)" />
      <circle cx="${width * 0.65}" cy="${height * 0.65}" r="${Math.min(width, height) * 0.35}" fill="hsl(${hue2}, 70%, 50%)" />
    </g>
    <rect x="${width * 0.25}" y="${height * 0.25}" width="${width * 0.5}" height="${height * 0.5}" rx="16" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Preload an image URL into browser cache and memory cache asynchronously.
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('Empty src'));
      return;
    }
    if (memoryCache.has(src)) {
      const img = new Image();
      img.src = src;
      resolve(img);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      memoryCache.add(src);
      resolve(img);
    };
    img.onerror = (err) => reject(err);
  });
}
