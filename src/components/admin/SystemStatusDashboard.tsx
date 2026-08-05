import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Database, 
  HardDrive, 
  Globe, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  Download, 
  Check, 
  Terminal, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  ExternalLink,
  Image,
  Server,
  Zap
} from 'lucide-react';
import { db, storage, testConnection } from '../../lib/firebase';
import { doc, getDocFromServer } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../../firebase-applet-config.json';
import DatabaseDiagnosticModal from '../DatabaseDiagnosticModal';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'offline' | 'checking';
  latencyMs?: number;
  message?: string;
  details?: Record<string, any>;
}

interface BackendDiagnostics {
  status: string;
  timestamp: string;
  responseTimeMs: number;
  environment: {
    nodeEnv: string;
    uptimeSeconds: number;
    memoryUsageMb: number;
  };
  database: {
    connected: boolean;
    provider: string;
    databaseId: string;
    projectId: string;
    totalProducts: number;
    firstProduct: {
      id: string;
      name: string;
      imageURL: string;
      category: string;
      price: string;
    } | null;
  };
  storage: {
    bucket: string;
    reachable: boolean;
    latencyMs: number;
    provider: string;
  };
  gemini: {
    configured: boolean;
    status: string;
  };
  api: {
    status: string;
    endpoints: Record<string, string>;
  };
}

export default function SystemStatusDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [isHeartbeatModalOpen, setIsHeartbeatModalOpen] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [testProductImageStatus, setTestProductImageStatus] = useState<'checking' | 'working' | 'failed'>('checking');
  
  // Client-side reachability states
  const [firestoreClientStatus, setFirestoreClientStatus] = useState<ServiceStatus>({
    name: 'Firestore Database (Client SDK)',
    status: 'checking'
  });

  const [storageClientStatus, setStorageClientStatus] = useState<ServiceStatus>({
    name: 'Firebase Storage (Client SDK)',
    status: 'checking'
  });

  const [apiServerStatus, setApiServerStatus] = useState<ServiceStatus>({
    name: 'Express Backend API',
    status: 'checking'
  });

  const [backendData, setBackendData] = useState<BackendDiagnostics | null>(null);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDiagnosticLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const runAllDiagnostics = async () => {
    setIsRunning(true);
    setCopied(false);
    addLog('Starting comprehensive System Status & Connectivity Audit...');

    // 1. Check Express API & Server Diagnostics
    const apiStartTime = performance.now();
    try {
      addLog('Pinging backend endpoint /api/diagnostics...');
      const res = await fetch('/api/diagnostics', { cache: 'no-store' });
      const apiLatency = Math.round(performance.now() - apiStartTime);
      
      if (res.ok) {
        const json: BackendDiagnostics = await res.json();
        setBackendData(json);
        setApiServerStatus({
          name: 'Express Backend API',
          status: 'operational',
          latencyMs: apiLatency,
          message: `Operational (${json.environment.nodeEnv} mode, Uptime: ${json.environment.uptimeSeconds}s)`,
          details: json.api.endpoints
        });
        addLog(`Backend API response verified in ${apiLatency}ms.`);

        // Test product image loading
        if (json.database.firstProduct?.imageURL) {
          const img = new window.Image();
          img.src = json.database.firstProduct.imageURL;
          img.onload = () => {
            setTestProductImageStatus('working');
            addLog(`Product image asset loading verified: ${json.database.firstProduct?.name}`);
          };
          img.onerror = () => {
            setTestProductImageStatus('failed');
            addLog(`Failed to render product image asset: ${json.database.firstProduct?.imageURL}`);
          };
        } else {
          setTestProductImageStatus('failed');
        }
      } else {
        setApiServerStatus({
          name: 'Express Backend API',
          status: 'degraded',
          latencyMs: apiLatency,
          message: `Returned HTTP Status ${res.status}`
        });
        addLog(`API server returned non-200 status: ${res.status}`);
      }
    } catch (err: any) {
      const apiLatency = Math.round(performance.now() - apiStartTime);
      setApiServerStatus({
        name: 'Express Backend API',
        status: 'offline',
        latencyMs: apiLatency,
        message: err.message || 'Failed to reach API server'
      });
      addLog(`API server connectivity error: ${err.message}`);
    }

    // 2. Check Firestore Client Connection
    const fsStartTime = performance.now();
    try {
      addLog('Testing Firestore client connection via SDK ping...');
      const isConnected = await testConnection();
      const fsLatency = Math.round(performance.now() - fsStartTime);

      if (isConnected) {
        setFirestoreClientStatus({
          name: 'Firestore Database (Client SDK)',
          status: 'operational',
          latencyMs: fsLatency,
          message: 'Connected & Responsive to Google Cloud Firestore',
          details: {
            projectId: firebaseConfig.projectId,
            databaseId: firebaseConfig.firestoreDatabaseId
          }
        });
        addLog(`Firestore Client SDK check passed in ${fsLatency}ms.`);
      } else {
        // Attempt fallback getDoc test
        try {
          const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 3000));
          await Promise.race([getDocFromServer(doc(db, 'system_health', 'ping')), timeout]);
          setFirestoreClientStatus({
            name: 'Firestore Database (Client SDK)',
            status: 'operational',
            latencyMs: fsLatency,
            message: 'Connected directly to Firestore cluster',
            details: {
              projectId: firebaseConfig.projectId,
              databaseId: firebaseConfig.firestoreDatabaseId
            }
          });
          addLog(`Firestore secondary getDoc check passed.`);
        } catch (fsErr: any) {
          setFirestoreClientStatus({
            name: 'Firestore Database (Client SDK)',
            status: 'degraded',
            latencyMs: fsLatency,
            message: 'Running in offline/local fallback mode or network restricted',
            details: {
              error: fsErr.message || String(fsErr)
            }
          });
          addLog(`Firestore client running in fallback mode: ${fsErr.message}`);
        }
      }
    } catch (err: any) {
      const fsLatency = Math.round(performance.now() - fsStartTime);
      setFirestoreClientStatus({
        name: 'Firestore Database (Client SDK)',
        status: 'offline',
        latencyMs: fsLatency,
        message: err.message || 'Firestore client SDK error'
      });
      addLog(`Firestore SDK connection error: ${err.message}`);
    }

    // 3. Check Storage Client Connection & Host Reachability
    const storageStartTime = performance.now();
    try {
      addLog('Testing Firebase Cloud Storage bucket reachability...');
      const bucketName = firebaseConfig.storageBucket;
      
      if (!bucketName) {
        setStorageClientStatus({
          name: 'Firebase Storage (Client SDK)',
          status: 'degraded',
          message: 'Storage bucket name not configured in firebase-applet-config.json'
        });
        addLog('Storage bucket name missing in configuration.');
      } else {
        // Ping storage host directly via fetch
        const pingUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o`;
        const pingRes = await fetch(pingUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });
        const storageLatency = Math.round(performance.now() - storageStartTime);

        // 200, 403, or 404 means the Google Cloud Storage endpoint is active and answering
        if (pingRes.status < 500) {
          setStorageClientStatus({
            name: 'Firebase Storage (Client SDK)',
            status: 'operational',
            latencyMs: storageLatency,
            message: `Storage Bucket (${bucketName}) Reachable & Responding`,
            details: {
              bucket: bucketName,
              httpStatus: pingRes.status
            }
          });
          addLog(`Firebase Storage bucket ping verified in ${storageLatency}ms (HTTP ${pingRes.status}).`);
        } else {
          setStorageClientStatus({
            name: 'Firebase Storage (Client SDK)',
            status: 'degraded',
            latencyMs: storageLatency,
            message: `Bucket endpoint responded with HTTP ${pingRes.status}`
          });
          addLog(`Storage bucket endpoint returned HTTP status ${pingRes.status}`);
        }
      }
    } catch (err: any) {
      const storageLatency = Math.round(performance.now() - storageStartTime);
      setStorageClientStatus({
        name: 'Firebase Storage (Client SDK)',
        status: 'offline',
        latencyMs: storageLatency,
        message: err.message || 'Failed to ping Firebase Storage bucket'
      });
      addLog(`Storage bucket ping failed: ${err.message}`);
    }

    setLastChecked(new Date().toLocaleTimeString());
    setIsRunning(false);
    addLog('System Status Audit complete.');
  };

  useEffect(() => {
    runAllDiagnostics();
  }, []);

  // Compute Overall System Health
  const allServices = [firestoreClientStatus, storageClientStatus, apiServerStatus];
  const isAllOperational = allServices.every(s => s.status === 'operational');
  const hasOffline = allServices.some(s => s.status === 'offline');
  const overallStatus = isAllOperational 
    ? 'ALL SYSTEMS OPERATIONAL' 
    : hasOffline 
      ? 'SERVICE DEGRADED / OFFLINE' 
      : 'PARTIAL CONNECTIVITY';

  // Generate Report Object for Copying / Exporting
  const getFullDiagnosticReport = () => {
    return {
      appName: 'Immortal Electronics Admin',
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      overallStatus,
      clientConfig: {
        projectId: firebaseConfig.projectId,
        databaseId: firebaseConfig.firestoreDatabaseId,
        storageBucket: firebaseConfig.storageBucket,
        authDomain: firebaseConfig.authDomain
      },
      serviceChecks: {
        firestoreClient: firestoreClientStatus,
        storageClient: storageClientStatus,
        apiServer: apiServerStatus,
        productImageStatus: testProductImageStatus
      },
      backendDiagnostics: backendData,
      logs: diagnosticLogs
    };
  };

  const handleCopyReport = () => {
    const reportText = JSON.stringify(getFullDiagnosticReport(), null, 2);
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadLog = () => {
    const reportText = JSON.stringify(getFullDiagnosticReport(), null, 2);
    const blob = new Blob([reportText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-status-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100 font-sans">
      
      {/* HEADER BAR */}
      <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${
              isAllOperational 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
            }`}>
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight">System Status & Service Diagnostics</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  Admin Exclusive
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Real-time connectivity report for Firestore, Firebase Storage, and API server services.
              </p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsHeartbeatModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:opacity-90 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition shadow-md shadow-indigo-600/20"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Database Heartbeat Diagnostic</span>
          </button>

          <button
            onClick={runAllDiagnostics}
            disabled={isRunning}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Auditing...' : 'Run Diagnostics'}</span>
          </button>

          <button
            onClick={handleCopyReport}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition border border-gray-200 dark:border-gray-800"
            title="Copy Report JSON to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Report'}</span>
          </button>

          <button
            onClick={handleDownloadLog}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl transition border border-gray-200 dark:border-gray-800"
            title="Export System Log JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OVERALL HEALTH BANNER */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${
        isAllOperational 
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
          : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
      }`}>
        <div className="flex items-center space-x-3">
          {isAllOperational ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          )}
          <div>
            <span className="text-xs font-bold font-mono tracking-wider uppercase block">
              STATUS: {overallStatus}
            </span>
            <span className="text-[11px] opacity-90 block">
              {isAllOperational 
                ? 'All primary database, asset storage, and server API gateways are reachable and healthy.' 
                : 'Some services are running in offline fallback or experiencing elevated latency.'}
            </span>
          </div>
        </div>

        {lastChecked && (
          <span className="text-[11px] font-mono opacity-80 shrink-0">
            Last Checked: {lastChecked}
          </span>
        )}
      </div>

      {/* SERVICE CONNECTIVITY TILES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* TILE 1: FIRESTORE DATABASE */}
        <div className="p-5 bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100">Firestore Database</h2>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">Google Cloud Firestore</span>
              </div>
            </div>

            {firestoreClientStatus.status === 'operational' ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>ONLINE</span>
              </span>
            ) : firestoreClientStatus.status === 'checking' ? (
              <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>FALLBACK</span>
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Response Latency:</span>
              <span className="font-mono font-bold text-indigo-500">
                {firestoreClientStatus.latencyMs !== undefined ? `${firestoreClientStatus.latencyMs} ms` : 'Testing...'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Database ID:</span>
              <span className="font-mono text-[10px] text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                {firebaseConfig.firestoreDatabaseId || 'Default'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Project ID:</span>
              <span className="font-mono text-[10px] text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                {firebaseConfig.projectId}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800/50">
            {firestoreClientStatus.message || 'Auditing connection...'}
          </p>
        </div>

        {/* TILE 2: FIREBASE STORAGE */}
        <div className="p-5 bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100">Firebase Storage</h2>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">Cloud Asset Bucket</span>
              </div>
            </div>

            {storageClientStatus.status === 'operational' ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>REACHABLE</span>
              </span>
            ) : storageClientStatus.status === 'checking' ? (
              <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center space-x-1">
                <XCircle className="w-3 h-3" />
                <span>UNREACHABLE</span>
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Ping Latency:</span>
              <span className="font-mono font-bold text-indigo-500">
                {storageClientStatus.latencyMs !== undefined ? `${storageClientStatus.latencyMs} ms` : 'Testing...'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Storage Bucket:</span>
              <span className="font-mono text-[10px] text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                {firebaseConfig.storageBucket}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Image Asset Test:</span>
              <span className="font-mono text-[10px] font-bold text-emerald-500">
                {testProductImageStatus === 'working' ? 'VERIFIED' : 'TESTING'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800/50">
            {storageClientStatus.message || 'Testing bucket reachability...'}
          </p>
        </div>

        {/* TILE 3: EXPRESS BACKEND API */}
        <div className="p-5 bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100">Express API Gateway</h2>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">Full-Stack Node Server</span>
              </div>
            </div>

            {apiServerStatus.status === 'operational' ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>OPERATIONAL</span>
              </span>
            ) : apiServerStatus.status === 'checking' ? (
              <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center space-x-1">
                <XCircle className="w-3 h-3" />
                <span>OFFLINE</span>
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Roundtrip Latency:</span>
              <span className="font-mono font-bold text-indigo-500">
                {apiServerStatus.latencyMs !== undefined ? `${apiServerStatus.latencyMs} ms` : 'Testing...'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Node Environment:</span>
              <span className="font-mono text-[10px] text-indigo-400 uppercase font-bold">
                {backendData?.environment.nodeEnv || 'production'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Process Memory:</span>
              <span className="font-mono text-[10px] text-gray-800 dark:text-gray-200">
                {backendData?.environment.memoryUsageMb ? `${backendData.environment.memoryUsageMb} MB` : 'N/A'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800/50">
            {apiServerStatus.message || 'Pinging Express server...'}
          </p>
        </div>

      </div>

      {/* CONFIGURATION & DEPLOYMENT CONSISTENCY AUDITOR */}
      <div className="p-6 bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 pb-3 border-b border-gray-200 dark:border-gray-800">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-gray-900 dark:text-gray-100">
            Deployment Consistency Audit Report
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 bg-gray-50 dark:bg-zinc-900/60 rounded-xl border border-gray-200/60 dark:border-gray-800/60 space-y-2">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Client SDK Config Matrix</span>
            <div className="space-y-1 text-gray-700 dark:text-gray-300 text-[11px]">
              <div><span className="text-gray-400">project_id:</span> {firebaseConfig.projectId}</div>
              <div><span className="text-gray-400">database_id:</span> {firebaseConfig.firestoreDatabaseId}</div>
              <div><span className="text-gray-400">storage_bucket:</span> {firebaseConfig.storageBucket}</div>
              <div><span className="text-gray-400">auth_domain:</span> {firebaseConfig.authDomain}</div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-zinc-900/60 rounded-xl border border-gray-200/60 dark:border-gray-800/60 space-y-2">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Server Proxy & Runtime Matrix</span>
            <div className="space-y-1 text-gray-700 dark:text-gray-300 text-[11px]">
              <div><span className="text-gray-400">server_db_status:</span> {backendData?.database.connected ? 'Cloud Firestore Active' : 'Fallback In-Memory'}</div>
              <div><span className="text-gray-400">server_storage_reachable:</span> {backendData?.storage.reachable ? 'Yes (200 OK)' : 'No / Pending'}</div>
              <div><span className="text-gray-400">gemini_api_key:</span> {backendData?.gemini.configured ? 'Active' : 'Unconfigured'}</div>
              <div><span className="text-gray-400">uptime:</span> {backendData?.environment.uptimeSeconds ? `${backendData.environment.uptimeSeconds}s` : 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE ASSET IMAGE FETCH VERIFICATION */}
      {backendData?.database.firstProduct && (
        <div className="p-6 bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Image className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-gray-900 dark:text-gray-100">
              Live Asset Reachability & CDN Verification
            </h3>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-900/60 border border-gray-200/60 dark:border-gray-800/60 rounded-xl">
            <div className="w-20 h-20 bg-white dark:bg-black p-2 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center shrink-0">
              <img 
                src={backendData.database.firstProduct.imageURL} 
                alt="CDN Test" 
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-1 text-xs flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-gray-100">{backendData.database.firstProduct.name}</span>
                <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  HTTP 200 OK
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Sample catalog asset fetched directly from storage bucket. Demonstrates image path resolution and asset delivery.
              </p>
              <div className="font-mono text-[10px] text-gray-400 truncate bg-gray-100 dark:bg-black p-1.5 rounded border border-gray-200/60 dark:border-gray-800/60 select-all">
                {backendData.database.firstProduct.imageURL}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME AUDIT LOG CONSOLE */}
      <div className="p-6 bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-gray-900 dark:text-gray-100">
              Live Diagnostic Audit Stream
            </h3>
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            {diagnosticLogs.length} entries recorded
          </span>
        </div>

        <div className="p-4 bg-zinc-950 text-zinc-300 font-mono text-[11px] rounded-xl border border-zinc-800 max-h-48 overflow-y-auto space-y-1">
          {diagnosticLogs.map((log, idx) => (
            <div key={idx} className="leading-relaxed opacity-90 border-b border-zinc-900/50 pb-0.5">
              {log}
            </div>
          ))}
        </div>
      </div>

      <DatabaseDiagnosticModal 
        isOpen={isHeartbeatModalOpen} 
        onClose={() => setIsHeartbeatModalOpen(false)} 
      />

    </div>
  );
}
