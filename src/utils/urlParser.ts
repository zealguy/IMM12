/**
 * Utility functions for parsing, validating, and sanitizing AliExpress URLs on autopilot.
 */

// Core regex patterns for matching AliExpress components
export const ALI_PRODUCT_PATTERNS = [
  /\/item\/(\d+)\.html/i,
  /\/item\/-\/(\d+)\.html/i,
  /\/item\/[^\/]+\/(\d+)\.html/i
];

export const ALI_CATEGORY_PATTERNS = [
  /\/category\/(\d+)/i,
  /\/category\/[^\/]+\/(\d+)\.html/i,
  /\/store\/(\d+)/i,
  /\/store\/group\/[^\/]+\/(\d+)\.html/i,
  /\/wholesale/i,
  /\/w\/wholesale-[\w-]+\.html/i
];

/**
 * Extracts a unique AliExpress product/item ID from diverse URL patterns:
 * - /item/10050059912345.html -> "10050059912345"
 * - /item/-/10050059912345.html -> "10050059912345"
 * - ?id=10050059912345 -> "10050059912345"
 * - ?productId=10050059912345 -> "10050059912345"
 * - /item/32847293422.html -> "32847293422"
 */
export function extractAliExpressProductId(url: string): string | null {
  try {
    const trimmed = url.trim();
    if (!trimmed) return null;

    // Normalize URL for parsing
    let normalized = trimmed;
    if (!/^https?:\/\//i.test(trimmed)) {
      normalized = `https://${trimmed}`;
    }

    const urlObj = new URL(normalized);

    // 1. Check query parameters first
    const paramsToCheck = ['id', 'productId', 'product_id', 'itemId', 'item_id'];
    for (const param of paramsToCheck) {
      const val = urlObj.searchParams.get(param);
      if (val && /^\d+$/.test(val)) {
        return val;
      }
    }

    // 2. Check path patterns: /item/12345.html or /item/-/12345.html
    const pathname = urlObj.pathname;
    
    for (const regex of ALI_PRODUCT_PATTERNS) {
      const match = pathname.match(regex);
      if (match && match[1]) {
        return match[1];
      }
    }

    // 3. Fallback: Search for any sequence of 9-16 digits in the pathname or search string
    const digitMatch = pathname.match(/\/(\d{9,16})/);
    if (digitMatch && digitMatch[1]) {
      return digitMatch[1];
    }

    return null;
  } catch (e) {
    // If it's a raw numeric string, return it directly if it matches an ID length pattern
    const trimmed = url.trim();
    if (/^\d{9,16}$/.test(trimmed)) {
      return trimmed;
    }
    return null;
  }
}

/**
 * Extracts store or category ID from diverse AliExpress URLs.
 */
export function extractAliExpressCategoryId(url: string): string | null {
  try {
    const trimmed = url.trim();
    if (!trimmed) return null;

    let normalized = trimmed;
    if (!/^https?:\/\//i.test(trimmed)) {
      normalized = `https://${trimmed}`;
    }

    const urlObj = new URL(normalized);
    const pathname = urlObj.pathname;

    for (const regex of ALI_CATEGORY_PATTERNS) {
      const match = pathname.match(regex);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Look for category or store query parameter as fallback
    const paramsToCheck = ['categoryId', 'category_id', 'storeId', 'store_id', 'g'];
    for (const param of paramsToCheck) {
      const val = urlObj.searchParams.get(param);
      if (val && /^\d+$/.test(val)) {
        return val;
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

export interface AliExpressUrlAnalysis {
  isValid: boolean;
  urlType: 'product' | 'category' | 'unknown';
  productId: string | null;
  categoryId: string | null;
  sanitized: string;
  strippedParams: string[];
  errorMessage: string | null;
}

/**
 * Performs a deep analysis of any given AliExpress URL to classify, validate, 
 * and sanitize it using robust regex pattern matching.
 */
export function analyzeAliExpressUrl(rawUrl: string): AliExpressUrlAnalysis {
  try {
    let trimmed = rawUrl.trim();
    if (!trimmed) {
      return {
        isValid: false,
        urlType: 'unknown',
        productId: null,
        categoryId: null,
        sanitized: '',
        strippedParams: [],
        errorMessage: 'Empty URL input'
      };
    }

    // Ensure protocol
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }

    const urlObj = new URL(trimmed);
    const host = urlObj.hostname.toLowerCase();

    // Verify it is an AliExpress domain
    const isAliExpress = host.includes('aliexpress.com') || 
                          host.includes('aliexpress.us') || 
                          host.includes('aliexpress.ru') ||
                          host.includes('aliexpress.fr') ||
                          host.includes('aliexpress.es') ||
                          host.includes('aliexpress.com.br');

    if (!isAliExpress) {
      return {
        isValid: false,
        urlType: 'unknown',
        productId: null,
        categoryId: null,
        sanitized: rawUrl,
        strippedParams: [],
        errorMessage: "This domain is not a supported AliExpress catalog source. Only official 'aliexpress.com' domains are supported."
      };
    }

    // Strip parameters
    const strippedParams: string[] = [];
    const keys = Array.from(urlObj.searchParams.keys());
    
    // Comprehensive tracking/UTM parameters common in AliExpress and affiliate tracking networks
    const trackingParams = [
      'spm', 'ws_ab_test', 'algo_pvid', 'algo_expid', 'btsid', 'pdp_ext_f',
      'sourcetype', 'aff_fcid', 'aff_fsk', 'aff_platform', 'aff_trace_key',
      'smtoken', 'smsign', 'sku_id', 'gps-id', 'scm', 'scm_id', 'scm-sub-cat',
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'origin', 'src', 'tt', 'cv', 'af', 'cn', 'sku_properties', 'vd', 'gclid'
    ];

    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      // Remove tracking params, utm variables, or keys starting with underscores/utm
      if (trackingParams.includes(lowerKey) || lowerKey.startsWith('utm_') || lowerKey.startsWith('_')) {
        strippedParams.push(key);
        urlObj.searchParams.delete(key);
      }
    }

    const pathname = urlObj.pathname;
    let urlType: 'product' | 'category' | 'unknown' = 'unknown';
    let productId: string | null = null;
    let categoryId: string | null = null;

    // Detect if Product Page
    const hasProductMatch = ALI_PRODUCT_PATTERNS.some(regex => regex.test(pathname)) || urlObj.searchParams.has('id') || urlObj.searchParams.has('productId');
    if (hasProductMatch) {
      productId = extractAliExpressProductId(urlObj.toString());
      if (productId) {
        urlType = 'product';
      }
    }

    // Detect if Category/Catalog Page
    if (urlType === 'unknown') {
      const hasCategoryMatch = ALI_CATEGORY_PATTERNS.some(regex => regex.test(pathname)) || pathname.includes('/wholesale') || pathname.includes('/w/wholesale') || pathname.includes('/store/') || urlObj.searchParams.has('categoryId') || urlObj.searchParams.has('storeId');
      if (hasCategoryMatch) {
        categoryId = extractAliExpressCategoryId(urlObj.toString());
        urlType = 'category';
      }
    }

    // If still unknown, check if we can locate a product ID as fallback
    if (urlType === 'unknown') {
      productId = extractAliExpressProductId(urlObj.toString());
      if (productId) {
        urlType = 'product';
      }
    }

    // Reconstruct sanitized URL
    let sanitized = urlObj.toString();
    if (urlType === 'product' && productId && !sanitized.includes(productId)) {
      urlObj.searchParams.set('id', productId);
      sanitized = urlObj.toString();
    }

    // Final Validation Message
    let isValid = urlType !== 'unknown';
    let errorMessage: string | null = null;

    if (!isValid) {
      errorMessage = "URL is not recognized as an AliExpress product or category/collection page. Please enter a valid product link (e.g., /item/1234.html) or category link (e.g., /category/567.html).";
    }

    return {
      isValid,
      urlType,
      productId,
      categoryId,
      sanitized,
      strippedParams,
      errorMessage
    };
  } catch (e) {
    return {
      isValid: false,
      urlType: 'unknown',
      productId: null,
      categoryId: null,
      sanitized: rawUrl,
      strippedParams: [],
      errorMessage: "Invalid URL format. Please provide a valid AliExpress link."
    };
  }
}

/**
 * Legacy compatibility wrapper for direct sanitization
 */
export function sanitizeAliExpressUrl(rawUrl: string): { 
  sanitized: string; 
  strippedParams: string[]; 
  productId: string | null;
  isValid: boolean;
} {
  const analysis = analyzeAliExpressUrl(rawUrl);
  return {
    sanitized: analysis.sanitized,
    strippedParams: analysis.strippedParams,
    productId: analysis.productId,
    isValid: analysis.isValid && analysis.urlType === 'product'
  };
}
