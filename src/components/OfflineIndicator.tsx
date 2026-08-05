import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, HardDrive, Database, CheckCircle2, AlertTriangle, Trash2, Image as ImageIcon, Zap } from 'lucide-react';
import { offlineStore, StorageStats } from '../lib/offlineStore';
import { isLowBandwidthConnection } from '../utils/imageCache';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const loadStats = async () => {
    const s = await offlineStore.getStats();
    setStats(s);
  };

  useEffect(() => {
    loadStats();

    const handleOnline = async () => {
      setIsOnline(true);
      setSyncStatusMsg('Network reconnected! Syncing offline queue...');
      setIsSyncing(true);
      try {
        const res = await offlineStore.flushOfflineQueue();
        if (res.total > 0) {
          setSyncStatusMsg(`Synced ${res.succeeded}/${res.total} offline actions successfully!`);
        } else {
          setSyncStatusMsg('All offline queue items up to date.');
        }
      } catch {
        setSyncStatusMsg('Error syncing offline queue.');
      } finally {
        setIsSyncing(false);
        loadStats();
        setTimeout(() => setSyncStatusMsg(null), 5000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatusMsg('Operating in Offline Mode (IndexedDB active)');
      loadStats();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Refresh stats periodically
    const timer = setInterval(loadStats, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Flushing offline mutation queue...');
    try {
      const res = await offlineStore.flushOfflineQueue();
      setSyncStatusMsg(`Manual Sync Complete: ${res.succeeded} succeeded, ${res.failed} failed.`);
      await loadStats();
    } catch (e: any) {
      setSyncStatusMsg(`Sync error: ${e.message || 'Network unreachable'}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatusMsg(null), 4000);
    }
  };

  const handleClearQueue = async () => {
    if (confirm('Are you sure you want to clear all pending offline actions?')) {
      await offlineStore.clearMutationQueue();
      await loadStats();
      setSyncStatusMsg('Offline action queue cleared.');
      setTimeout(() => setSyncStatusMsg(null), 3000);
    }
  };

  const pendingCount = stats?.queuedMutationsCount || 0;

  return (
    <div id="offline-indicator-wrapper" className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Sync Status Floating Message Toast */}
      {syncStatusMsg && (
        <div id="sync-status-toast" className="mb-2 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700 flex items-center space-x-2 animate-fade-in">
          <Database className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {/* Main Pill Badge */}
      <div 
        id="offline-indicator-pill"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-semibold shadow-xl backdrop-blur-md cursor-pointer transition-all border ${
          !isOnline 
            ? 'bg-amber-500/90 hover:bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/40' 
            : pendingCount > 0
            ? 'bg-blue-600/90 hover:bg-blue-600 text-white border-blue-400'
            : 'bg-slate-900/80 hover:bg-slate-900 text-slate-200 border-slate-700'
        }`}
      >
        <div className="relative flex items-center justify-center">
          {!isOnline ? (
            <WifiOff className="w-4 h-4 text-slate-950" />
          ) : (
            <Wifi className="w-4 h-4 text-emerald-400" />
          )}
          {!isOnline && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          )}
        </div>

        <span className="truncate max-w-[150px]">
          {!isOnline ? 'Offline (IndexedDB Cache)' : 'Online Sync'}
        </span>

        {pendingCount > 0 && (
          <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
            {pendingCount} queued
          </span>
        )}
      </div>

      {/* Expanded Offline Storage & Sync Controls Panel */}
      {isExpanded && (
        <div id="offline-controls-popover" className="mt-2 w-80 bg-slate-900 text-slate-100 rounded-2xl p-4 shadow-2xl border border-slate-700 text-xs space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-sm text-white">Offline Enterprise Cache</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
              {isOnline ? 'Network Active' : 'Offline Mode'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-300 bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400">IndexedDB Status</div>
              <div className="font-semibold text-emerald-400 flex items-center space-x-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Image Cache</div>
              <div className="font-semibold text-emerald-400 flex items-center space-x-1 mt-0.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Blur & IDB Active</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Mobile Network</div>
              <div className="font-semibold text-blue-400 mt-0.5">
                {isLowBandwidthConnection() ? '2G/3G Data Saver' : 'High Speed'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Storage Usage</div>
              <div className="font-semibold text-white mt-0.5">
                {stats?.usageBytes ? `${(stats.usageBytes / (1024 * 1024)).toFixed(2)} MB` : 'Estimating...'}
              </div>
            </div>
          </div>

          {pendingCount > 0 && (
            <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-2.5 text-amber-200 text-[11px] flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">{pendingCount} offline mutation(s) pending.</span> They will automatically flush when connection returns.
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-1">
            <button
              id="btn-manual-sync-queue"
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Queue Now'}</span>
            </button>

            {pendingCount > 0 && (
              <button
                id="btn-clear-offline-queue"
                onClick={handleClearQueue}
                title="Clear pending queue"
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 p-2 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
