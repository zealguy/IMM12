import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  Copy, 
  Check, 
  Terminal, 
  Zap, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Trash2,
  Server,
  ArrowRight
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc, getDocFromServer, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

interface StepResult {
  status: 'idle' | 'running' | 'success' | 'failed';
  latencyMs?: number;
  error?: string;
  details?: string;
}

interface DatabaseDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DatabaseDiagnosticModal({ isOpen, onClose }: DatabaseDiagnosticModalProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [autoCleanup, setAutoCleanup] = useState(true);
  const [customPayload, setCustomPayload] = useState('Immortal Heartbeat Check - Accra Node');
  
  // Test steps state
  const [writeStep, setWriteStep] = useState<StepResult>({ status: 'idle' });
  const [readStep, setReadStep] = useState<StepResult>({ status: 'idle' });
  const [deleteStep, setDeleteStep] = useState<StepResult>({ status: 'idle' });
  const [apiProxyStep, setApiProxyStep] = useState<StepResult>({ status: 'idle' });

  const [activeDocId, setActiveDocId] = useState<string>('');
  const [overallStatus, setOverallStatus] = useState<'idle' | 'success' | 'degraded' | 'failed'>('idle');
  const [totalRoundtripMs, setTotalRoundtripMs] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
  };

  const runHeartbeatDiagnostic = async () => {
    setIsTesting(true);
    setOverallStatus('idle');
    setCopied(false);
    setWriteStep({ status: 'running' });
    setReadStep({ status: 'idle' });
    setDeleteStep({ status: 'idle' });
    setApiProxyStep({ status: 'running' });

    const docId = `ping_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setActiveDocId(docId);
    setLogs([]);

    addLog(`Initiating Firestore Heartbeat Diagnostic targeting collection 'test_heartbeat'...`);
    addLog(`Generated Test Doc ID: ${docId}`);

    const overallStart = performance.now();
    let hasFailure = false;
    let hasDegraded = false;

    // Helper timeout wrapper
    function withTimeout<T>(promise: Promise<T>, timeoutMs = 6000): Promise<T> {
      return Promise.race([
        promise,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
        )
      ]);
    }

    // --- STEP 0: Express Backend API Diagnostic Check ---
    try {
      const apiStart = performance.now();
      addLog(`Pinging backend API route /api/diagnostics...`);
      const apiRes = await withTimeout(fetch('/api/diagnostics', { cache: 'no-store' }), 4000);
      const apiLatency = Math.round(performance.now() - apiStart);

      if (apiRes.ok) {
        setApiProxyStep({
          status: 'success',
          latencyMs: apiLatency,
          details: `Express backend API online (${apiLatency}ms)`
        });
        addLog(`Backend API response verified in ${apiLatency}ms.`);
      } else {
        setApiProxyStep({
          status: 'failed',
          latencyMs: apiLatency,
          error: `HTTP Status ${apiRes.status}`
        });
        addLog(`Backend API returned HTTP ${apiRes.status}`);
        hasDegraded = true;
      }
    } catch (err: any) {
      setApiProxyStep({
        status: 'failed',
        error: err.message || 'API connection error'
      });
      addLog(`Backend API proxy ping failed: ${err.message}`);
      hasDegraded = true;
    }

    // --- STEP 1: Write Test Document to Firestore ---
    const testDocRef = doc(db, 'test_heartbeat', docId);
    const writeData = {
      id: docId,
      payload: customPayload,
      timestamp: new Date().toISOString(),
      clientMetadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        environment: 'AI Studio Cloud Run Container',
        databaseId: firebaseConfig.firestoreDatabaseId || '(default)'
      }
    };

    const writeStart = performance.now();
    try {
      addLog(`Executing setDoc() write to 'test_heartbeat/${docId}'...`);
      await withTimeout(setDoc(testDocRef, writeData), 6000);
      const writeLatency = Math.round(performance.now() - writeStart);

      setWriteStep({
        status: 'success',
        latencyMs: writeLatency,
        details: `Successfully wrote test document in ${writeLatency}ms.`
      });
      addLog(`Write operation completed successfully in ${writeLatency}ms.`);
    } catch (err: any) {
      const writeLatency = Math.round(performance.now() - writeStart);
      hasFailure = true;
      setWriteStep({
        status: 'failed',
        latencyMs: writeLatency,
        error: err.message || 'Failed to write document to Firestore'
      });
      addLog(`Write operation failed (${writeLatency}ms): ${err.message}`);
    }

    // --- STEP 2: Read Document Back directly from Firestore Server ---
    if (!hasFailure) {
      setReadStep({ status: 'running' });
      const readStart = performance.now();
      try {
        addLog(`Executing getDocFromServer() read on 'test_heartbeat/${docId}'...`);
        const snapshot = await withTimeout(getDocFromServer(testDocRef), 6000);
        const readLatency = Math.round(performance.now() - readStart);

        if (snapshot.exists()) {
          const fetchedData = snapshot.data();
          const matchesPayload = fetchedData?.payload === customPayload;

          if (matchesPayload) {
            setReadStep({
              status: 'success',
              latencyMs: readLatency,
              details: `Read verified! Payload match confirmed in ${readLatency}ms.`
            });
            addLog(`Read operation verified payload in ${readLatency}ms.`);
          } else {
            hasDegraded = true;
            setReadStep({
              status: 'failed',
              latencyMs: readLatency,
              error: 'Payload mismatch',
              details: `Document exists but data differs from written payload.`
            });
            addLog(`Read operation mismatch: fetched data payload does not match.`);
          }
        } else {
          hasFailure = true;
          setReadStep({
            status: 'failed',
            latencyMs: readLatency,
            error: 'Document not found on Firestore server'
          });
          addLog(`Read operation failed: Document '${docId}' not found on server.`);
        }
      } catch (err: any) {
        const readLatency = Math.round(performance.now() - readStart);
        hasFailure = true;
        setReadStep({
          status: 'failed',
          latencyMs: readLatency,
          error: err.message || 'Failed to read document from Firestore server'
        });
        addLog(`Read operation failed (${readLatency}ms): ${err.message}`);
      }
    } else {
      setReadStep({ status: 'failed', error: 'Skipped due to write failure' });
    }

    // --- STEP 3: Cleanup / Delete Test Document ---
    if (autoCleanup && !hasFailure) {
      setDeleteStep({ status: 'running' });
      const deleteStart = performance.now();
      try {
        addLog(`Executing deleteDoc() cleanup for 'test_heartbeat/${docId}'...`);
        await withTimeout(deleteDoc(testDocRef), 6000);
        const deleteLatency = Math.round(performance.now() - deleteStart);

        setDeleteStep({
          status: 'success',
          latencyMs: deleteLatency,
          details: `Test document removed cleanly in ${deleteLatency}ms.`
        });
        addLog(`Cleanup completed in ${deleteLatency}ms.`);
      } catch (err: any) {
        const deleteLatency = Math.round(performance.now() - deleteStart);
        setDeleteStep({
          status: 'failed',
          latencyMs: deleteLatency,
          error: err.message || 'Cleanup delete failed'
        });
        addLog(`Cleanup failed (${deleteLatency}ms): ${err.message}`);
        hasDegraded = true;
      }
    } else if (!autoCleanup) {
      setDeleteStep({
        status: 'idle',
        details: 'Cleanup skipped per user configuration (Doc preserved in Firestore).'
      });
      addLog(`Cleanup skipped per setting.`);
    } else {
      setDeleteStep({ status: 'idle', details: 'Cleanup skipped due to previous errors.' });
    }

    const totalMs = Math.round(performance.now() - overallStart);
    setTotalRoundtripMs(totalMs);

    if (hasFailure) {
      setOverallStatus('failed');
      addLog(`Heartbeat Diagnostic finished with FAILED status (${totalMs}ms total).`);
    } else if (hasDegraded) {
      setOverallStatus('degraded');
      addLog(`Heartbeat Diagnostic finished with DEGRADED status (${totalMs}ms total).`);
    } else {
      setOverallStatus('success');
      addLog(`Heartbeat Diagnostic ALL CHECKS PASSED (${totalMs}ms total).`);
    }

    setIsTesting(false);
  };

  useEffect(() => {
    if (isOpen) {
      runHeartbeatDiagnostic();
    }
  }, [isOpen]);

  const handleCopyReport = () => {
    const reportData = {
      title: 'Database Connectivity Diagnostic Report',
      timestamp: new Date().toISOString(),
      databaseConfig: {
        projectId: firebaseConfig.projectId,
        databaseId: firebaseConfig.firestoreDatabaseId,
        authDomain: firebaseConfig.authDomain
      },
      overallStatus,
      totalRoundtripMs,
      testDocId: activeDocId,
      stepMetrics: {
        backendApiProxy: apiProxyStep,
        firestoreWrite: writeStep,
        firestoreRead: readStep,
        firestoreDeleteCleanup: deleteStep
      },
      logs
    };

    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-[#09090b] text-gray-100 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-xl border ${
                overallStatus === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : overallStatus === 'failed'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                <Activity className={`w-5 h-5 ${isTesting ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase font-mono tracking-wider text-white">
                  Database Connectivity Diagnostic
                </h2>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Collection: <span className="text-indigo-400 font-bold">test_heartbeat</span> • Firestore Direct Check
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={runHeartbeatDiagnostic}
                disabled={isTesting}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Re-Run Test'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">

            {/* OVERALL HEALTH STATUS CARD */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              overallStatus === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : overallStatus === 'failed'
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              <div className="flex items-center space-x-3">
                {isTesting ? (
                  <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
                ) : overallStatus === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : overallStatus === 'failed' ? (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                )}

                <div>
                  <span className="text-xs font-black font-mono tracking-wider uppercase block">
                    STATUS: {isTesting ? 'TEST IN PROGRESS...' : overallStatus.toUpperCase()}
                  </span>
                  <p className="text-[11px] opacity-90 font-mono mt-0.5">
                    {overallStatus === 'success' && 'Firestore read/write/delete operations verified with full server confirmation.'}
                    {overallStatus === 'failed' && 'Connectivity failure detected. Check Firestore security rules or internet connection.'}
                    {overallStatus === 'degraded' && 'Partial connectivity. Write or read succeeded but experienced elevated latency.'}
                    {isTesting && 'Executing real-time roundtrip transaction to test_heartbeat collection...'}
                  </p>
                </div>
              </div>

              {totalRoundtripMs !== null && !isTesting && (
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Roundtrip Latency</span>
                  <span className="text-sm font-black font-mono text-indigo-400">{totalRoundtripMs} ms</span>
                </div>
              )}
            </div>

            {/* STEP-BY-STEP DIAGNOSTIC PROGRESS */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase font-mono tracking-wider text-zinc-400 block">
                Transaction Step Metrics
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Write Step */}
                <div className="p-3.5 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>1. Firestore Write</span>
                    </span>
                    {writeStep.status === 'running' ? (
                      <RefreshCw className="w-3.5 h-3.5 text-zinc-500 animate-spin" />
                    ) : writeStep.status === 'success' ? (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> {writeStep.latencyMs}ms
                      </span>
                    ) : writeStep.status === 'failed' ? (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center gap-1">
                        <X className="w-3 h-3" /> Failed
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">Idle</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 font-mono leading-tight">
                    {writeStep.details || writeStep.error || 'Writes document payload to test_heartbeat'}
                  </p>
                </div>

                {/* 2. Read Step */}
                <div className="p-3.5 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-indigo-400" />
                      <span>2. Server Read</span>
                    </span>
                    {readStep.status === 'running' ? (
                      <RefreshCw className="w-3.5 h-3.5 text-zinc-500 animate-spin" />
                    ) : readStep.status === 'success' ? (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> {readStep.latencyMs}ms
                      </span>
                    ) : readStep.status === 'failed' ? (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center gap-1">
                        <X className="w-3 h-3" /> Failed
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">Idle</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 font-mono leading-tight">
                    {readStep.details || readStep.error || 'Fetches document back via getDocFromServer()'}
                  </p>
                </div>

                {/* 3. Delete / Cleanup Step */}
                <div className="p-3.5 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>3. Clean-up Delete</span>
                    </span>
                    {deleteStep.status === 'running' ? (
                      <RefreshCw className="w-3.5 h-3.5 text-zinc-500 animate-spin" />
                    ) : deleteStep.status === 'success' ? (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> {deleteStep.latencyMs}ms
                      </span>
                    ) : deleteStep.status === 'failed' ? (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center gap-1">
                        <X className="w-3 h-3" /> Failed
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">Idle</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 font-mono leading-tight">
                    {deleteStep.details || deleteStep.error || 'Removes test document from collection'}
                  </p>
                </div>

                {/* 4. Express API Proxy Step */}
                <div className="p-3.5 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-emerald-400" />
                      <span>4. Express API Ping</span>
                    </span>
                    {apiProxyStep.status === 'running' ? (
                      <RefreshCw className="w-3.5 h-3.5 text-zinc-500 animate-spin" />
                    ) : apiProxyStep.status === 'success' ? (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> {apiProxyStep.latencyMs}ms
                      </span>
                    ) : apiProxyStep.status === 'failed' ? (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center gap-1">
                        <X className="w-3 h-3" /> Failed
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">Idle</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 font-mono leading-tight">
                    {apiProxyStep.details || apiProxyStep.error || 'Pings backend express diagnostics route'}
                  </p>
                </div>
              </div>
            </div>

            {/* DIAGNOSTIC OPTIONS */}
            <div className="p-4 bg-zinc-950/60 border border-zinc-800/60 rounded-xl space-y-3">
              <span className="text-[10px] font-black uppercase font-mono tracking-wider text-zinc-400 block">
                Diagnostic Parameters & Configuration
              </span>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoCleanup"
                    checked={autoCleanup}
                    onChange={(e) => setAutoCleanup(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="autoCleanup" className="text-zinc-300 font-mono cursor-pointer">
                    Auto-Delete Test Record after Read Verification
                  </label>
                </div>

                <div className="text-[11px] font-mono text-zinc-400">
                  Target DB: <span className="text-zinc-200">{firebaseConfig.firestoreDatabaseId || '(default)'}</span>
                </div>
              </div>
            </div>

            {/* LIVE CONSOLE LOGS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Live Heartbeat Transaction Stream</span>
                </span>
                <button
                  onClick={handleCopyReport}
                  className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied Report!' : 'Copy Diagnostic Report'}</span>
                </button>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-[11px] text-zinc-300 max-h-36 overflow-y-auto space-y-1 select-all">
                {logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed opacity-90 border-b border-zinc-900/40 pb-0.5">
                      {log}
                    </div>
                  ))
                ) : (
                  <span className="text-zinc-500">Click 'Re-Run Test' to initiate real-time heartbeat audit stream.</span>
                )}
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>Project: {firebaseConfig.projectId}</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition font-bold"
            >
              Close Diagnostic
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
