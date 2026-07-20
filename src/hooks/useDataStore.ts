import { useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  RepairRequest, 
  TradeInRequest, 
  Order, 
  BlogPost, 
  Coupon, 
  BulkInquiry 
} from '../types';

// Helper to safely fetch JSON from endpoints with exponential backoff retries for robust initialization
const safeFetchJson = async (url: string, fallback: any, retries = 5, delayMs = 300) => {
  let currentDelay = delayMs;
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) {
        const contentType = r.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const text = await r.text();
          if (!text) return fallback;
          return JSON.parse(text);
        }
        return fallback;
      }
      
      // If server returned non-200 but was reachable (e.g. during server start/restart)
      if (i === retries - 1) {
        console.warn(`Fetch failed for ${url} with status ${r.status}`);
        return fallback;
      }
      console.warn(`[useDataStore] Fetch for ${url} returned status ${r.status}, retrying... (${i + 1}/${retries})`);
    } catch (e) {
      // Network failure or connection refused (e.g. server booting up)
      if (i === retries - 1) {
        console.warn(`Error fetching ${url}:`, e);
        return fallback;
      }
      console.warn(`[useDataStore] Failed to fetch ${url} (${e instanceof Error ? e.message : String(e)}), retrying in ${currentDelay}ms... (${i + 1}/${retries})`);
    }
    await new Promise(resolve => setTimeout(resolve, currentDelay));
    currentDelay *= 2; // Exponential backoff
  }
  return fallback;
};

export function useDataStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [tradeins, setTradeInRequests] = useState<TradeInRequest[]>([]);
  const [bulkInquiries, setBulkInquiries] = useState<BulkInquiry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      console.log('[useDataStore] fetchInitialData triggered: Initiating parallel fetch for products, blogs, coupons, etc.');
      console.log('[DEBUG Frontend] Calling API URL: /api/products');
      const [resProdRaw, resBlogs, resCoupons, resOrders, resRepairs, resTrade, resInq] = await Promise.all([
        safeFetchJson('/api/products', { success: false, products: [] }),
        safeFetchJson('/api/blogs', []),
        safeFetchJson('/api/coupons', []),
        safeFetchJson('/api/orders', []),
        safeFetchJson('/api/repairs', []),
        safeFetchJson('/api/tradeins', []),
        safeFetchJson('/api/bulkinquiries', [])
      ]);

      console.log('[DEBUG Frontend] Raw API response (truncated):', JSON.stringify(resProdRaw).substring(0, 1000));

      let resProd: Product[] = [];
      if (Array.isArray(resProdRaw)) {
        resProd = resProdRaw;
      } else if (resProdRaw && typeof resProdRaw === 'object' && Array.isArray(resProdRaw.products)) {
        resProd = resProdRaw.products;
      } else if (resProdRaw && typeof resProdRaw === 'object' && Array.isArray(resProdRaw.data)) {
        resProd = resProdRaw.data;
      }

      console.log('[DEBUG Frontend] Number of products received:', resProd.length);
      console.log('[DEBUG Frontend] Product data before rendering:', JSON.stringify(resProd.slice(0, 3)));

      setProducts(Array.isArray(resProd) ? resProd : []);
      setBlogs(Array.isArray(resBlogs) ? resBlogs : []);
      setCoupons(Array.isArray(resCoupons) ? resCoupons : []);
      setOrders(Array.isArray(resOrders) ? resOrders : []);
      setRepairs(Array.isArray(resRepairs) ? resRepairs : []);
      setTradeInRequests(Array.isArray(resTrade) ? resTrade : []);
      setBulkInquiries(Array.isArray(resInq) ? resInq : []);
      setIsLoading(false);
    } catch (err) {
      console.warn('[useDataStore] Error hydrating data in useDataStore:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    }
  }, []);

  // Fetch initial data on mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Set up periodic real-time background updates (polling every 6 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchInitialData();
    }, 6000);

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
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
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
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
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

  return {
    products,
    setProducts,
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
