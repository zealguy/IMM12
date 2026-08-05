/**
 * Enterprise IndexedDB Offline Persistence & Synchronization Utility
 * Provides robust offline caching for critical collections (Products, Orders, Repairs, Inquiries, etc.)
 * and maintains an offline mutation queue to sync pending requests when network connectivity recovers.
 */

const DB_NAME = 'ImmortalEnterpriseCacheDB';
const DB_VERSION = 1;

export interface CachedCollection {
  name: string;
  data: any[];
  updatedAt: string;
  count: number;
}

export interface OfflineMutation {
  id?: number;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: any;
  timestamp: string;
  label: string; // Human-readable description, e.g. "Book Repair (iPhone 14 Screen)"
  retries?: number;
}

export interface StorageStats {
  supported: boolean;
  dbName: string;
  collectionsCount: number;
  queuedMutationsCount: number;
  lastSyncTime: string | null;
  usageBytes: number;
  quotaBytes: number;
}

class OfflineStore {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initDB().catch(() => {});
    }
  }

  private resetDB() {
    this.dbPromise = null;
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Collections store
        if (!db.objectStoreNames.contains('collections')) {
          db.createObjectStore('collections', { keyPath: 'name' });
        }

        // 2. Offline mutation queue store
        if (!db.objectStoreNames.contains('offlineQueue')) {
          db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
        }

        // 3. System metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.onversionchange = () => {
          try { db.close(); } catch {}
          this.resetDB();
        };
        db.onclose = () => {
          this.resetDB();
        };
        db.onerror = () => {
          this.resetDB();
        };
        resolve(db);
      };

      request.onerror = (event) => {
        console.error('[IndexedDB] Failed to open database:', (event.target as IDBOpenDBRequest).error);
        this.resetDB();
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  private async getTransaction(storeName: string, mode: IDBTransactionMode): Promise<IDBTransaction> {
    try {
      const db = await this.initDB();
      return db.transaction(storeName, mode);
    } catch (err) {
      // Handle connection closing / closed errors gracefully by resetting connection and retrying
      this.resetDB();
      const db = await this.initDB();
      return db.transaction(storeName, mode);
    }
  }

  /**
   * Save or update an entire dataset collection in IndexedDB
   */
  async saveCollection<T = any>(name: string, data: T[]): Promise<boolean> {
    try {
      const tx = await this.getTransaction('collections', 'readwrite');
      return new Promise((resolve, reject) => {
        const store = tx.objectStore('collections');
        const record: CachedCollection = {
          name,
          data,
          updatedAt: new Date().toISOString(),
          count: Array.isArray(data) ? data.length : 0
        };

        const request = store.put(record);
        request.onsuccess = () => {
          this.setMetadata(`last_sync_${name}`, new Date().toISOString()).catch(() => {});
          resolve(true);
        };
        request.onerror = () => reject(request.error);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn(`[IndexedDB] Failed to cache collection '${name}':`, err);
      return false;
    }
  }

  /**
   * Retrieve a cached collection from IndexedDB
   */
  async getCollection<T = any>(name: string): Promise<{ data: T[]; updatedAt: string } | null> {
    try {
      const tx = await this.getTransaction('collections', 'readonly');
      return new Promise((resolve) => {
        const store = tx.objectStore('collections');
        const request = store.get(name);

        request.onsuccess = () => {
          const result = request.result as CachedCollection | undefined;
          if (result && Array.isArray(result.data)) {
            resolve({ data: result.data as T[], updatedAt: result.updatedAt });
          } else {
            resolve(null);
          }
        };

        request.onerror = () => resolve(null);
        tx.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Queue an API mutation payload when network connectivity is absent
   */
  async queueMutation(mutation: Omit<OfflineMutation, 'id' | 'timestamp'>): Promise<number | null> {
    try {
      const tx = await this.getTransaction('offlineQueue', 'readwrite');
      return new Promise((resolve, reject) => {
        const store = tx.objectStore('offlineQueue');
        const entry: OfflineMutation = {
          ...mutation,
          timestamp: new Date().toISOString(),
          retries: 0
        };

        const request = store.add(entry);
        request.onsuccess = () => {
          console.info(`[IndexedDB Queue] Enqueued offline action '${mutation.label}' for endpoint ${mutation.endpoint}`);
          resolve(request.result as number);
        };
        request.onerror = () => reject(request.error);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.error('[IndexedDB Queue] Failed to queue mutation:', err);
      return null;
    }
  }

  /**
   * Retrieve all pending offline mutations
   */
  async getQueuedMutations(): Promise<OfflineMutation[]> {
    try {
      const tx = await this.getTransaction('offlineQueue', 'readonly');
      return new Promise((resolve) => {
        const store = tx.objectStore('offlineQueue');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
        tx.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Remove a single mutation from the offline queue after successful sync
   */
  async removeQueuedMutation(id: number): Promise<boolean> {
    try {
      const tx = await this.getTransaction('offlineQueue', 'readwrite');
      return new Promise((resolve) => {
        const store = tx.objectStore('offlineQueue');
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
        tx.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  /**
   * Clear all pending offline mutations
   */
  async clearMutationQueue(): Promise<boolean> {
    try {
      const tx = await this.getTransaction('offlineQueue', 'readwrite');
      return new Promise((resolve) => {
        const store = tx.objectStore('offlineQueue');
        const request = store.clear();

        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
        tx.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  /**
   * Process and flush all queued offline mutations back to the server API
   */
  async flushOfflineQueue(): Promise<{ total: number; succeeded: number; failed: number }> {
    const queue = await this.getQueuedMutations();
    if (queue.length === 0) return { total: 0, succeeded: 0, failed: 0 };

    let succeeded = 0;
    let failed = 0;

    console.info(`[IndexedDB Sync] Starting offline queue flush for ${queue.length} items...`);

    for (const item of queue) {
      if (!item.id) continue;
      try {
        const res = await fetch(item.endpoint, {
          method: item.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        });

        if (res.ok) {
          await this.removeQueuedMutation(item.id);
          succeeded++;
          console.info(`[IndexedDB Sync] Successfully synced offline item '${item.label}'`);
        } else {
          failed++;
          console.warn(`[IndexedDB Sync] Server responded with status ${res.status} for '${item.label}'`);
        }
      } catch (err) {
        failed++;
        console.warn(`[IndexedDB Sync] Failed to dispatch offline item '${item.label}':`, err);
      }
    }

    await this.setMetadata('last_full_queue_sync', new Date().toISOString());
    return { total: queue.length, succeeded, failed };
  }

  /**
   * Set general metadata key-value
   */
  async setMetadata(key: string, value: any): Promise<boolean> {
    try {
      const tx = await this.getTransaction('metadata', 'readwrite');
      return new Promise((resolve) => {
        const store = tx.objectStore('metadata');
        const request = store.put({ key, value, updatedAt: new Date().toISOString() });
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
        tx.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  /**
   * Get metadata value
   */
  async getMetadata(key: string): Promise<any> {
    try {
      const tx = await this.getTransaction('metadata', 'readonly');
      return new Promise((resolve) => {
        const store = tx.objectStore('metadata');
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.value ?? null);
        request.onerror = () => resolve(null);
        tx.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Get summary statistics for IndexedDB & Storage quota
   */
  async getStats(): Promise<StorageStats> {
    const supported = typeof window !== 'undefined' && 'indexedDB' in window;
    let usageBytes = 0;
    let quotaBytes = 0;

    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        usageBytes = estimate.usage || 0;
        quotaBytes = estimate.quota || 0;
      } catch {
        // Fallback
      }
    }

    const mutations = await this.getQueuedMutations();
    const lastSyncTime = await this.getMetadata('last_full_queue_sync');

    let collectionsCount = 0;
    try {
      const tx = await this.getTransaction('collections', 'readonly');
      collectionsCount = await new Promise((resolve) => {
        const store = tx.objectStore('collections');
        const req = store.count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => resolve(0);
        tx.onerror = () => resolve(0);
      });
    } catch {
      // ignore
    }

    return {
      supported,
      dbName: DB_NAME,
      collectionsCount,
      queuedMutationsCount: mutations.length,
      lastSyncTime,
      usageBytes,
      quotaBytes
    };
  }
}

export const offlineStore = new OfflineStore();
