import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { offlineStore } from '../lib/offlineStore';
import { 
  Product, 
  RepairRequest, 
  TradeInRequest, 
  Order, 
  BlogPost, 
  Coupon, 
  BulkInquiry 
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_BLOGS, INITIAL_COUPONS } from '../data/initialProducts';

import firebaseConfig from '../../firebase-applet-config.json';

export interface ProductDiagnosticLog {
  timestamp: string;
  productId: string;
  rawItem: any;
  issuesFound: string[];
  wasFallbackApplied: boolean;
  sanitizedProduct: Product;
}

export const DEFAULT_STORAGE_BUCKET = firebaseConfig.storageBucket || 'gen-lang-client-0770901147.firebasestorage.app';

export const DEFAULT_SAFE_PRODUCT: Product = {
  id: 'safe-fallback-product',
  name: 'Standard Catalog Product',
  description: 'Verified safe fallback product structure.',
  priceGHS: 0,
  priceUSD: 0,
  category: 'General',
  brand: 'Immortal',
  image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600&auto=format&fit=crop',
  images: ['https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600&auto=format&fit=crop'],
  rating: 4.5,
  reviewsCount: 0,
  specs: {},
  colors: [],
  isNew: false,
  stock: 0,
  status: 'Published',
  isFeatured: false
};

/**
 * Sanitizes and normalizes an image URL/path.
 * Forces relative paths or gs:// URIs into fully-qualified Firebase Storage URLs.
 * Strips temporary blob:, base64 data:, file://, local temp paths, or malformed strings.
 */
export function sanitizeStorageImageUrl(rawUrl: any): { url: string | null; isStripped: boolean; issue?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { url: null, isStripped: true, issue: 'Non-string or empty image reference' };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { url: null, isStripped: true, issue: 'Empty image string' };
  }

  const lower = trimmed.toLowerCase();

  // Accept valid base64 image Data URLs (e.g. uploaded computer photos)
  if (lower.startsWith('data:image/')) {
    return { url: trimmed, isStripped: false };
  }

  // Strip temporary/local/non-persistent browser references
  if (
    lower.startsWith('blob:') ||
    lower.startsWith('file:') ||
    lower.includes('fakepath') ||
    lower.startsWith('/tmp/') ||
    lower.startsWith('c:\\') ||
    lower.startsWith('localhost:') ||
    lower.includes('127.0.0.1')
  ) {
    return { url: null, isStripped: true, issue: `Stripped temporary/non-persistent path: '${trimmed.substring(0, 35)}...'` };
  }

  // Refactor gs:// bucket paths into fully qualified Firebase Storage HTTPS URLs
  if (lower.startsWith('gs://')) {
    try {
      const gsPath = trimmed.replace(/^gs:\/\//i, '');
      const slashIndex = gsPath.indexOf('/');
      if (slashIndex > 0) {
        const bucket = gsPath.substring(0, slashIndex);
        const objectPath = gsPath.substring(slashIndex + 1);
        const qualifiedUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(objectPath)}?alt=media`;
        return { url: qualifiedUrl, isStripped: false };
      }
    } catch {
      return { url: null, isStripped: true, issue: `Malformed gs:// path: '${trimmed}'` };
    }
  }

  // Convert relative storage paths (e.g., "products/camera.jpg" or "/products/camera.jpg") into fully qualified Firebase Storage URLs
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    const cleanPath = trimmed.replace(/^\/+/, '');
    if (cleanPath.includes('/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(cleanPath)) {
      const qualifiedUrl = `https://firebasestorage.googleapis.com/v0/b/${DEFAULT_STORAGE_BUCKET}/o/${encodeURIComponent(cleanPath)}?alt=media`;
      return { url: qualifiedUrl, isStripped: false };
    } else {
      return { url: null, isStripped: true, issue: `Stripped unresolvable relative path: '${trimmed}'` };
    }
  }

  // Validate HTTP/HTTPS URLs
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { url: null, isStripped: true, issue: `Invalid protocol: '${parsed.protocol}'` };
    }
    return { url: parsed.toString(), isStripped: false };
  } catch {
    return { url: null, isStripped: true, issue: `Malformed URL syntax: '${trimmed}'` };
  }
}

/**
 * Diagnostic logs function that specifically validates the structure of each product object 
 * returned from Firestore/API before it hits the application state.
 * Implements fallback to a 'safe' structure if a product is missing critical fields.
 */
export function validateAndDiagnoseProduct(item: any): { product: Product; log: ProductDiagnosticLog } {
  const timestamp = new Date().toISOString();
  const issues: string[] = [];

  if (!item || typeof item !== 'object') {
    const fallbackId = `safe-fallback-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const safeProduct: Product = {
      ...DEFAULT_SAFE_PRODUCT,
      id: fallbackId,
      name: 'Safe Fallback Product (Invalid Record)'
    };
    const logEntry: ProductDiagnosticLog = {
      timestamp,
      productId: fallbackId,
      rawItem: item,
      issuesFound: ['Raw record is null or not an object'],
      wasFallbackApplied: true,
      sanitizedProduct: safeProduct
    };
    console.warn(`[ProductValidationDiagnostic] Invalid product object encountered, applying safe fallback:`, logEntry);
    return { product: safeProduct, log: logEntry };
  }

  // 1. Validate ID
  let id = String(item.id || item._id || '').trim();
  if (!id) {
    id = `safe-id-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    issues.push(`Missing critical field 'id' -> assigned fallback ID: ${id}`);
  }

  // 2. Validate Name
  let name = typeof item.name === 'string' ? item.name.trim() : '';
  if (!name) {
    name = `Electronics Item #${id.slice(-6)}`;
    issues.push(`Missing critical field 'name' -> fallback to: '${name}'`);
  }

  // 3. Validate Price GHS
  let priceGHS = typeof item.priceGHS === 'number' ? item.priceGHS : parseFloat(item.priceGHS);
  if (isNaN(priceGHS) || priceGHS < 0) {
    priceGHS = 0;
    issues.push(`Missing or invalid critical field 'priceGHS' (${item.priceGHS}) -> fallback to 0`);
  }

  // 4. Validate Price USD
  let priceUSD = typeof item.priceUSD === 'number' ? item.priceUSD : parseFloat(item.priceUSD);
  if (isNaN(priceUSD) || priceUSD < 0) {
    priceUSD = priceGHS > 0 ? Math.round((priceGHS / 12) * 100) / 100 : 0;
    issues.push(`Missing or invalid 'priceUSD' (${item.priceUSD}) -> derived as ${priceUSD}`);
  }

  // 5. Validate Category
  let category = typeof item.category === 'string' && item.category.trim() ? item.category.trim() : '';
  if (!category) {
    category = 'General';
    issues.push(`Missing critical field 'category' -> fallback to 'General'`);
  }

  // 6. Validate Brand
  let brand = typeof item.brand === 'string' && item.brand.trim() ? item.brand.trim() : '';
  if (!brand) {
    brand = 'Immortal';
    issues.push(`Missing field 'brand' -> fallback to 'Immortal'`);
  }

  // 7. Validate & Sanitize Main Image (force fully-qualified Firebase Storage URL & strip temporary paths)
  const DEFAULT_IMAGE = DEFAULT_SAFE_PRODUCT.image;
  let mainImage = typeof item.image === 'string' ? item.image : '';
  const mainImageSanitized = sanitizeStorageImageUrl(mainImage);

  if (mainImageSanitized.isStripped || !mainImageSanitized.url) {
    issues.push(`Main image invalid or temporary path (${mainImageSanitized.issue || 'invalid URL'}) -> stripped and fallback applied`);
    mainImage = DEFAULT_IMAGE;
  } else {
    if (mainImageSanitized.url !== mainImage) {
      issues.push(`Refactored main image reference into fully-qualified Firebase Storage URL`);
    }
    mainImage = mainImageSanitized.url;
  }

  // 8. Validate & Sanitize Image Gallery
  let imagesArray: string[] = [];
  if (Array.isArray(item.images)) {
    for (const rawImg of item.images) {
      const res = sanitizeStorageImageUrl(rawImg);
      if (res.url && !res.isStripped) {
        imagesArray.push(res.url);
      } else {
        issues.push(`Gallery image stripped: ${res.issue || 'invalid/temporary path'}`);
      }
    }
  }

  if (imagesArray.length === 0) {
    imagesArray = [mainImage];
    if (!Array.isArray(item.images) || item.images.length === 0) {
      issues.push(`Missing or empty 'images' array -> fallback to single-item array with main image`);
    }
  }

  // 9. Validate Rating
  let rating = typeof item.rating === 'number' ? item.rating : parseFloat(item.rating);
  if (isNaN(rating) || rating < 0 || rating > 5) {
    rating = 4.5;
    issues.push(`Invalid 'rating' (${item.rating}) -> fallback to 4.5`);
  }

  // 10. Validate Reviews Count
  let reviewsCount = typeof item.reviewsCount === 'number' ? item.reviewsCount : parseInt(item.reviewsCount, 10);
  if (isNaN(reviewsCount) || reviewsCount < 0) {
    reviewsCount = 0;
    issues.push(`Invalid 'reviewsCount' (${item.reviewsCount}) -> fallback to 0`);
  }

  // 11. Validate Specs Object
  let specs: Record<string, string> = {};
  if (item.specs && typeof item.specs === 'object' && !Array.isArray(item.specs)) {
    for (const [k, v] of Object.entries(item.specs)) {
      if (typeof k === 'string' && k.trim()) {
        specs[k.trim()] = String(v ?? '');
      }
    }
  } else if (item.specs) {
    issues.push(`Invalid 'specs' object format -> fallback to empty record`);
  }

  // 12. Validate Colors
  let colors: string[] = [];
  if (Array.isArray(item.colors)) {
    colors = item.colors.map((c: any) => String(c).trim()).filter(Boolean);
  }

  // 13. Validate Stock
  let stock = typeof item.stock === 'number' ? item.stock : parseInt(item.stock, 10);
  if (isNaN(stock) || stock < 0) {
    stock = 0;
    issues.push(`Invalid or missing 'stock' count -> fallback to 0`);
  }

  // 14. Validate Status
  const validStatus = ['Draft', 'Published', 'Scheduled', 'Archived'];
  const status = validStatus.includes(item.status) ? item.status : 'Published';
  if (item.status && !validStatus.includes(item.status)) {
    issues.push(`Unknown product status '${item.status}' -> normalized to 'Published'`);
  }

  const safeProduct: Product = {
    id,
    name,
    description: typeof item.description === 'string' ? item.description : '',
    priceGHS,
    priceUSD,
    category,
    brand,
    image: mainImage,
    images: imagesArray,
    rating,
    reviewsCount,
    specs,
    colors,
    isNew: Boolean(item.isNew),
    stock,
    isBestSeller: Boolean(item.isBestSeller),
    isNewArrival: Boolean(item.isNewArrival),
    video: typeof item.video === 'string' && item.video.trim() ? item.video.trim() : undefined,
    status,
    isFeatured: Boolean(item.isFeatured)
  };

  const wasFallbackApplied = issues.length > 0;
  const logEntry: ProductDiagnosticLog = {
    timestamp,
    productId: id,
    rawItem: item,
    issuesFound: issues,
    wasFallbackApplied,
    sanitizedProduct: safeProduct
  };

  if (wasFallbackApplied) {
    console.info(`[ProductValidationDiagnostic] Validated product '${id}' with ${issues.length} field fallback(s):`, issues);
  }

  return { product: safeProduct, log: logEntry };
}

// Helper to validate and sanitize raw product objects into full, safe Product structures
export function sanitizeProduct(item: any): Product | null {
  if (!item || typeof item !== 'object') return null;
  return validateAndDiagnoseProduct(item).product;
}

export function validateAndSanitizeProducts(rawList: any[]): Product[] {
  if (!Array.isArray(rawList)) return [];
  const validProducts: Product[] = [];
  for (const item of rawList) {
    const { product } = validateAndDiagnoseProduct(item);
    validProducts.push(product);
  }
  return validProducts;
}

export function validateAndSanitizeProductsWithLogs(rawList: any[]): { products: Product[]; logs: ProductDiagnosticLog[] } {
  if (!Array.isArray(rawList)) return { products: [], logs: [] };
  const products: Product[] = [];
  const logs: ProductDiagnosticLog[] = [];

  for (const item of rawList) {
    const { product, log } = validateAndDiagnoseProduct(item);
    products.push(product);
    logs.push(log);
  }

  return { products, logs };
}

/**
 * Helper to fetch Firestore data with timeout and exponential backoff retry mechanism.
 * If the initial fetch request (API proxy or direct) fails, times out, or returns an empty result,
 * it automatically attempts secondary fetches with exponential backoff delays.
 */
export async function fetchFirestoreWithRetry<T>(
  endpoint: string,
  collectionName: string,
  fallbackData: T[] = [],
  maxRetries = 3,
  initialBackoffMs = 300,
  timeoutMs = 5000
): Promise<T[]> {
  let currentDelay = initialBackoffMs;

  // 1. Attempt API Endpoint Fetch with retries and exponential backoff
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timer);

      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          const parsed = JSON.parse(text);
          let items: T[] | null = null;

          if (Array.isArray(parsed)) {
            items = parsed;
          } else if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.products)) items = parsed.products;
            else if (Array.isArray(parsed.data)) items = parsed.data;
            else if (Array.isArray(parsed.items)) items = parsed.items;
          }

          if (Array.isArray(items) && items.length > 0) {
            return items;
          }
        }
        console.warn(`[useDataStore Retry] ${endpoint} returned an empty response on attempt ${attempt}/${maxRetries}. Retrying in ${currentDelay}ms...`);
      } else {
        console.warn(`[useDataStore Retry] ${endpoint} returned HTTP status ${response.status} on attempt ${attempt}/${maxRetries}. Retrying in ${currentDelay}ms...`);
      }
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError' || (err.message && err.message.includes('timeout'));
      const reason = isTimeout ? `timed out after ${timeoutMs}ms` : (err.message || 'network error');
      console.warn(`[useDataStore Retry] ${endpoint} fetch failed (${reason}) on attempt ${attempt}/${maxRetries}. Retrying in ${currentDelay}ms...`);
    }

    if (attempt < maxRetries) {
      await new Promise(res => setTimeout(res, currentDelay));
      currentDelay *= 2; // Exponential backoff
    }
  }

  // 2. Secondary Direct Firestore SDK Fetch Attempt with Exponential Backoff
  console.info(`[useDataStore Retry] API endpoint '${endpoint}' returned empty or failed after ${maxRetries} attempts. Attempting secondary direct Firestore fetch for collection '${collectionName}'...`);
  currentDelay = initialBackoffMs;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Direct Firestore read timed out after ${timeoutMs}ms`)), timeoutMs)
      );

      const [querySnap, deletedSnap] = await Promise.all([
        Promise.race([
          getDocs(collection(db, collectionName)),
          timeoutPromise
        ]),
        collectionName === 'products' ? getDocs(collection(db, 'deleted_products')).catch(() => null) : Promise.resolve(null)
      ]);

      if (querySnap && !querySnap.empty) {
        let docsData = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
        if (collectionName === 'products' && deletedSnap && !deletedSnap.empty) {
          const deletedIds = new Set(deletedSnap.docs.map(d => d.id));
          docsData = docsData.filter((p: any) => p && p.id && !deletedIds.has(p.id));
        }
        if (docsData.length > 0) {
          console.info(`[useDataStore Retry] Secondary direct Firestore fetch succeeded for '${collectionName}' with ${docsData.length} records.`);
          return docsData;
        }
      }

      console.warn(`[useDataStore Retry] Direct Firestore collection '${collectionName}' was empty on attempt ${attempt}/${maxRetries}. Retrying in ${currentDelay}ms...`);
    } catch (err: any) {
      const isQuota = err?.message?.toLowerCase().includes('quota') || err?.code?.toLowerCase().includes('resource-exhausted') || err?.message?.toLowerCase().includes('resource_exhausted');
      if (isQuota) {
        console.warn(`[Firestore Quota] Direct Firestore read quota exceeded for '${collectionName}'. Returning fallback data.`);
        break;
      }
      console.warn(`[useDataStore Retry] Direct Firestore fetch for '${collectionName}' failed (${err.message || 'read error'}) on attempt ${attempt}/${maxRetries}. Retrying in ${currentDelay}ms...`);
    }

    if (attempt < maxRetries) {
      await new Promise(res => setTimeout(res, currentDelay));
      currentDelay *= 2; // Exponential backoff
    }
  }

  // 3. Fallback
  console.warn(`[useDataStore Retry] All primary and secondary fetch attempts for '${collectionName}' yielded empty or failed results. Returning default fallback data.`);
  return fallbackData;
}

export function useDataStore() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [productDiagnosticLogs, setProductDiagnosticLogs] = useState<ProductDiagnosticLog[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [tradeins, setTradeInRequests] = useState<TradeInRequest[]>([]);
  const [bulkInquiries, setBulkInquiries] = useState<BulkInquiry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      // 1. Fetch products with retries, exponential backoff, and secondary direct Firestore read
      const resProd = await fetchFirestoreWithRetry<Product>('/api/products', 'products', [], 3, 300, 5000);
      if (resProd && resProd.length > 0) {
        const { products: sanitizedList, logs } = validateAndSanitizeProductsWithLogs(resProd);
        setProductDiagnosticLogs(logs);
        if (sanitizedList.length > 0) {
          setProducts(sanitizedList);
          offlineStore.saveCollection('products', sanitizedList);
        }
      }

      // 2. Fetch other collections in parallel with exponential backoff retries & secondary direct Firestore reads
      const [resBlogs, resCoupons, resOrders, resRepairs, resTrade, resInq] = await Promise.all([
        fetchFirestoreWithRetry<BlogPost>('/api/blogs', 'blogs', INITIAL_BLOGS, 3, 300, 5000),
        fetchFirestoreWithRetry<Coupon>('/api/coupons', 'coupons', INITIAL_COUPONS, 3, 300, 5000),
        fetchFirestoreWithRetry<Order>('/api/orders', 'orders', [], 3, 300, 5000),
        fetchFirestoreWithRetry<RepairRequest>('/api/repairs', 'repairs', [], 3, 300, 5000),
        fetchFirestoreWithRetry<TradeInRequest>('/api/tradeins', 'tradeins', [], 3, 300, 5000),
        fetchFirestoreWithRetry<BulkInquiry>('/api/bulkinquiries', 'bulkinquiries', [], 3, 300, 5000)
      ]);

      if (Array.isArray(resBlogs) && resBlogs.length > 0) {
        setBlogs(resBlogs);
        offlineStore.saveCollection('blogs', resBlogs);
      }
      if (Array.isArray(resCoupons) && resCoupons.length > 0) {
        setCoupons(resCoupons);
        offlineStore.saveCollection('coupons', resCoupons);
      }
      if (Array.isArray(resOrders) && resOrders.length > 0) {
        setOrders(resOrders);
        offlineStore.saveCollection('orders', resOrders);
      }
      if (Array.isArray(resRepairs) && resRepairs.length > 0) {
        setRepairs(resRepairs);
        offlineStore.saveCollection('repairs', resRepairs);
      }
      if (Array.isArray(resTrade) && resTrade.length > 0) {
        setTradeInRequests(resTrade);
        offlineStore.saveCollection('tradeins', resTrade);
      }
      if (Array.isArray(resInq) && resInq.length > 0) {
        setBulkInquiries(resInq);
        offlineStore.saveCollection('bulkinquiries', resInq);
      }
      setIsLoading(false);

      // Flush any queued offline actions if online
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        offlineStore.flushOfflineQueue().catch(() => {});
      }
    } catch (err) {
      console.warn('[useDataStore] Error hydrating background data:', err);
      setProducts(prev => prev.length > 0 ? prev : INITIAL_PRODUCTS);
      setIsLoading(false);
    }
  }, []);

  // Hydrate state immediately from IndexedDB cache on mount
  useEffect(() => {
    let isMounted = true;
    async function loadIndexedDBCache() {
      try {
        const [p, b, c, o, r, t, i] = await Promise.all([
          offlineStore.getCollection<Product>('products'),
          offlineStore.getCollection<BlogPost>('blogs'),
          offlineStore.getCollection<Coupon>('coupons'),
          offlineStore.getCollection<Order>('orders'),
          offlineStore.getCollection<RepairRequest>('repairs'),
          offlineStore.getCollection<TradeInRequest>('tradeins'),
          offlineStore.getCollection<BulkInquiry>('bulkinquiries')
        ]);
        if (!isMounted) return;
        if (p?.data?.length) setProducts(p.data);
        if (b?.data?.length) setBlogs(b.data);
        if (c?.data?.length) setCoupons(c.data);
        if (o?.data?.length) setOrders(o.data);
        if (r?.data?.length) setRepairs(r.data);
        if (t?.data?.length) setTradeInRequests(t.data);
        if (i?.data?.length) setBulkInquiries(i.data);
      } catch (err) {
        console.warn('[IndexedDB Hydration] Error loading local cache:', err);
      }
    }
    loadIndexedDBCache();
    return () => { isMounted = false; };
  }, []);

  // Fetch initial data on mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Set up periodic real-time background updates (polling every 15 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof navigator === 'undefined' || navigator.onLine) {
        fetchInitialData();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchInitialData]);

  // Bulk Inquiry Actions
  const handleBookBulkInquiry = useCallback(async (inquiryData: any) => {
    try {
      const res = await fetch('/api/bulkinquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryData)
      });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error booking bulk inquiry:', err);
      return {};
    }
  }, [fetchInitialData]);

  const handleUpdateBulkInquiry = useCallback(async (inquiryId: string, status: string) => {
    try {
      const res = await fetch(`/api/bulkinquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error updating bulk inquiry:', err);
      return {};
    }
  }, [fetchInitialData]);

  // Repair Actions
  const handleBookRepair = useCallback(async (bookingData: any) => {
    try {
      const res = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error booking repair:', err);
      return {};
    }
  }, [fetchInitialData]);

  const handleTrackRepair = useCallback(async (trackingCode: string) => {
    try {
      const res = await fetch(`/api/repairs/${trackingCode}`);
      if (res.status === 404) return null;
      return res.ok ? await res.json().catch(() => null) : null;
    } catch (err) {
      console.error('Error tracking repair:', err);
      return null;
    }
  }, []);

  // Trade-In Actions
  const handleTradeInSubmit = useCallback(async (tradeInData: any) => {
    try {
      const res = await fetch('/api/tradeins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeInData)
      });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error submitting trade-in:', err);
      return {};
    }
  }, [fetchInitialData]);

  const handleTrackTradeIn = useCallback(async (trackingCode: string) => {
    try {
      const res = await fetch(`/api/tradeins/${trackingCode}`);
      if (res.status === 404) return null;
      return res.ok ? await res.json().catch(() => null) : null;
    } catch (err) {
      console.error('Error tracking trade-in:', err);
      return null;
    }
  }, []);

  // Blog Actions
  const handleBlogComment = useCallback(async (blogId: string, author: string, text: string) => {
    try {
      const res = await fetch(`/api/blogs/${blogId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, text })
      });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error adding blog comment:', err);
      return {};
    }
  }, [fetchInitialData]);

  const handleBlogLike = useCallback(async (blogId: string) => {
    try {
      const res = await fetch(`/api/blogs/${blogId}/like`, { method: 'POST' });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error liking blog:', err);
      return {};
    }
  }, [fetchInitialData]);

  const handleCreateBlog = useCallback(async (blogData: any) => {
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData)
      });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error creating blog:', err);
      return {};
    }
  }, [fetchInitialData]);

  const handleDeleteBlog = useCallback(async (blogId: string) => {
    try {
      const res = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE'
      });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error deleting blog:', err);
      return {};
    }
  }, [fetchInitialData]);

  // Product Admin CRUD Actions
  const handleCreateProduct = useCallback(async (productData: Product) => {
    const { product: sanitizedProduct } = validateAndDiagnoseProduct(productData);
    sanitizedProduct.status = sanitizedProduct.status || 'Published';
    setProducts(prev => {
      const updated = [sanitizedProduct, ...prev.filter(p => p.id !== sanitizedProduct.id)];
      offlineStore.saveCollection('products', updated).catch(() => {});
      return updated;
    });
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedProduct)
      });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error creating product:', err);
      return {};
    }
  }, [fetchInitialData]);

  const handleEditProduct = useCallback(async (productId: string, productData: Partial<Product>) => {
    const sanitizedPatch: Partial<Product> = { ...productData };
    if (sanitizedPatch.image) {
      const res = sanitizeStorageImageUrl(sanitizedPatch.image);
      if (res.url && !res.isStripped) {
        sanitizedPatch.image = res.url;
      } else {
        sanitizedPatch.image = DEFAULT_SAFE_PRODUCT.image;
      }
    }
    if (Array.isArray(sanitizedPatch.images)) {
      const cleanGallery: string[] = [];
      for (const rawImg of sanitizedPatch.images) {
        const res = sanitizeStorageImageUrl(rawImg);
        if (res.url && !res.isStripped) {
          cleanGallery.push(res.url);
        }
      }
      sanitizedPatch.images = cleanGallery.length > 0 ? cleanGallery : [sanitizedPatch.image || DEFAULT_SAFE_PRODUCT.image];
    }

    setProducts(prev => {
      const updated = prev.map(p => p.id === productId ? { ...p, ...sanitizedPatch } : p);
      offlineStore.saveCollection('products', updated).catch(() => {});
      return updated;
    });
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedPatch)
      });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error editing product:', err);
      return {};
    }
  }, [fetchInitialData]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      offlineStore.saveCollection('products', updated).catch(() => {});
      return updated;
    });
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error deleting product:', err);
      return {};
    }
  }, [fetchInitialData]);

  const handleUpdateStock = useCallback(async (productId: string, newStock: number) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === productId ? { ...p, stock: newStock } : p);
      offlineStore.saveCollection('products', updated).catch(() => {});
      return updated;
    });
    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error updating stock:', err);
      return {};
    }
  }, [fetchInitialData]);

  const handleUpdateRepair = useCallback(async (repairId: string, status: any, notes: string, quoteGHS: number) => {
    try {
      const res = await fetch(`/api/repairs/${repairId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes, quotationGHS: quoteGHS })
      });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error updating repair status:', err);
      return {};
    }
  }, [fetchInitialData]);

  const handleUpdateTradeIn = useCallback(async (tradeInId: string, status: any, notes: string, finalOfferGHS: number) => {
    try {
      const res = await fetch(`/api/tradeins/${tradeInId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes, finalOfferGHS })
      });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error updating trade-in status:', err);
      return {};
    }
  }, [fetchInitialData]);

  const handleUpdateOrder = useCallback(async (orderId: string, status: any) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error updating order:', err);
      return {};
    }
  }, [fetchInitialData]);

  const handleCreateCoupon = useCallback(async (couponData: Coupon) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData)
      });
      const result = res.ok ? await res.json().catch(() => ({})) : {};
      await fetchInitialData();
      return result;
    } catch (err) {
      console.error('Error creating coupon:', err);
      return {};
    }
  }, [fetchInitialData]);

  const forceRefreshCatalog = useCallback(async () => {
    setIsLoading(true);
    setProducts([]); // Clear local catalog state/cache to bypass potential deployment stale-ness
    try {
      await fetchInitialData();
    } finally {
      setIsLoading(false);
    }
  }, [fetchInitialData]);

  return {
    products,
    setProducts,
    productDiagnosticLogs,
    blogs,
    setBlogs,
    coupons,
    setCoupons,
    orders,
    setOrders,
    repairs,
    setRepairs,
    tradeins,
    setTradeInRequests,
    bulkInquiries,
    setBulkInquiries,
    isLoading,
    error,
    fetchInitialData,
    forceRefreshCatalog,
    handleBookBulkInquiry,
    handleUpdateBulkInquiry,
    handleBookRepair,
    handleTrackRepair,
    handleTradeInSubmit,
    handleTrackTradeIn,
    handleBlogComment,
    handleBlogLike,
    handleCreateBlog,
    handleDeleteBlog,
    handleCreateProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleUpdateStock,
    handleUpdateRepair,
    handleUpdateTradeIn,
    handleUpdateOrder,
    handleCreateCoupon
  };
}

