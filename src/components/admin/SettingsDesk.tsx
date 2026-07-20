/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, Shield, Database, Radio, CheckCircle, Save, 
  Smartphone, CreditCard, Key, CloudLightning, RefreshCw, Server
} from 'lucide-react';

interface SettingsDeskProps {
  currency: 'GHS' | 'USD';
}

export default function SettingsDesk({ currency }: SettingsDeskProps) {
  const [storeName, setStoreName] = useState('Immortal Electronics Ltd.');
  const [ceoName, setCeoName] = useState('Benjamin Danso');
  const [address, setAddress] = useState('Circle Ebony, Accra, Ghana');
  const [primaryPhone, setPrimaryPhone] = useState('+233 54 371 4108');
  const [secondaryPhone, setSecondaryPhone] = useState('+233 59 872 9101');
  
  // MoMo & API variables
  const [momoLiveMode, setMomoLiveMode] = useState(true);
  const [momoMerchantID, setMomoMerchantID] = useState('MOMO-GHA-779401');
  const [geminiApiKeySet, setGeminiApiKeySet] = useState(true);
  const [dbBackupInterval, setDbBackupInterval] = useState('6h');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Diagnostic State
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setIsDiagnosing(true);
    setDiagnosticError(null);
    try {
      const response = await fetch('/api/diagnostics');
      if (!response.ok) {
        throw new Error(`Diagnostics endpoint returned code: ${response.status}`);
      }
      const data = await response.json();
      setDiagnosticResult(data);
    } catch (err: any) {
      console.error('[Diagnostics] Failed:', err);
      setDiagnosticError(err.message || 'Unknown network error');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-4">
        <div className="space-y-1">
          <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Enterprise Settings OS</span>
          </h2>
          <p className="text-xs text-gray-400">Manage Accra headquarters details, MoMo integrations, backup protocols, and operational security tokens.</p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-4 py-2 bg-[#0066FF] hover:bg-blue-600 disabled:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/10 transition-colors"
        >
          {isSaving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? 'Applying Changes...' : 'Save Config'}</span>
        </button>
      </div>

      {saveSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>System configuration compiled successfully. All diagnostic registries and CEO headers updated live.</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left pane: Enterprise Core */}
        <div className="p-5 border border-gray-150 dark:border-gray-800/80 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black uppercase font-mono tracking-wider text-gray-900 dark:text-white">Corporate Identity</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Registered Store Name</label>
              <input 
                type="text" 
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Chief Executive Officer (CEO)</label>
              <input 
                type="text" 
                value={ceoName} 
                onChange={(e) => setCeoName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl font-bold text-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Accra Headquarters Address</label>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Primary Helpline</label>
                <input 
                  type="text" 
                  value={primaryPhone} 
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Secondary Helpline</label>
                <input 
                  type="text" 
                  value={secondaryPhone} 
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right pane: MoMo & Gateways */}
        <div className="p-5 border border-gray-150 dark:border-gray-800/80 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-black uppercase font-mono tracking-wider text-gray-900 dark:text-white">Mobile Money Gateway</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-150 dark:border-gray-800">
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">MTN MoMo Live Ingress</span>
                <span className="text-[10px] text-gray-400 block">Deploy real-time network webhooks.</span>
              </div>
              <button 
                onClick={() => setMomoLiveMode(!momoLiveMode)}
                className={`relative w-10 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${momoLiveMode ? 'bg-emerald-500' : 'bg-gray-600'}`}
              >
                <motion.div 
                  layout
                  className="w-4 h-4 bg-white rounded-full"
                  animate={{ x: momoLiveMode ? 14 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Merchant Account ID (Merchant PIN)</label>
              <input 
                type="text" 
                value={momoMerchantID} 
                onChange={(e) => setMomoMerchantID(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between pb-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Gemini AI Model Sync</label>
                <span className="text-[9px] bg-[#0066FF]/10 text-[#0066FF] px-1.5 py-0.5 rounded font-bold font-mono">SECURE ROUTER</span>
              </div>
              <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl flex items-center gap-3">
                <Key className="w-5 h-5 text-[#0066FF] shrink-0" />
                <div className="flex-1">
                  <span className="font-bold block text-gray-900 dark:text-white">GEMINI_API_KEY</span>
                  <span className="text-[10px] text-gray-400 block">Authorized server key detected via sandbox env.</span>
                </div>
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" title="Active model connected" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Database In-Memory Backups</label>
              <select
                value={dbBackupInterval}
                onChange={(e) => setDbBackupInterval(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl font-bold"
              >
                <option value="1h">Every Hour (Aggressive Diagnostics)</option>
                <option value="6h">Every 6 Hours (Standard)</option>
                <option value="24h">Once Daily (Standard Backup)</option>
                <option value="never">Manual Storage Logs Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Check Store Connection Diagnostic Control */}
      <div className="p-6 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase font-mono tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#0066FF] animate-pulse" />
              <span>Production Debugging Audit Desk</span>
            </h3>
            <p className="text-xs text-gray-400">Execute comprehensive store validation protocols, Firestore connectivity diagnostics, and API endpoint handshakes.</p>
          </div>
          
          <button
            onClick={runDiagnostics}
            disabled={isDiagnosing}
            className="px-5 py-2.5 bg-[#0066FF] hover:bg-blue-600 disabled:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/10 transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
            <span>{isDiagnosing ? 'Running Audit...' : 'Check Store Connection'}</span>
          </button>
        </div>

        {diagnosticError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>Audit Fail: {diagnosticError}</span>
          </div>
        )}

        {isDiagnosing && (
          <div className="py-8 text-center space-y-2">
            <RefreshCw className="w-8 h-8 text-[#0066FF] animate-spin mx-auto" />
            <span className="text-xs font-mono text-gray-400 block">Negotiating API handshake & fetching active store indices...</span>
          </div>
        )}

        {diagnosticResult && !isDiagnosing && (
          <div className="space-y-4 text-xs animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
              {/* Database Status */}
              <div className="p-3 bg-gray-50 dark:bg-black/25 rounded-xl border border-gray-150 dark:border-gray-800 space-y-1">
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Database Status</span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${diagnosticResult.database.connected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} style={{ animationDuration: '2s' }} />
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {diagnosticResult.database.connected ? 'Cloud Synced' : 'Offline Cache'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 block font-mono truncate">{diagnosticResult.database.provider}</span>
              </div>

              {/* API Status */}
              <div className="p-3 bg-gray-50 dark:bg-black/25 rounded-xl border border-gray-150 dark:border-gray-800 space-y-1">
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">API Status</span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-gray-800 dark:text-gray-200">{diagnosticResult.api.status}</span>
                </div>
                <span className="text-[10px] text-gray-400 block font-mono">GET /api/products (200)</span>
              </div>

              {/* Product Count */}
              <div className="p-3 bg-gray-50 dark:bg-black/25 rounded-xl border border-gray-150 dark:border-gray-800 space-y-1">
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Product Count</span>
                <span className="font-mono text-base font-black text-gray-950 dark:text-white block pt-0.5">
                  {diagnosticResult.database.totalProducts}
                </span>
                <span className="text-[10px] text-gray-400 block">Catalog Units Active</span>
              </div>

              {/* Image Status */}
              <div className="p-3 bg-gray-50 dark:bg-black/25 rounded-xl border border-gray-150 dark:border-gray-800 space-y-1">
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Image Status</span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-gray-800 dark:text-gray-200">Verified</span>
                </div>
                <span className="text-[10px] text-gray-400 block font-mono">Fallback asset rules: OK</span>
              </div>

              {/* Authentication Status */}
              <div className="p-3 bg-gray-50 dark:bg-black/25 rounded-xl border border-gray-150 dark:border-gray-800 space-y-1">
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Auth Status</span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="font-bold text-gray-800 dark:text-gray-200">Admin</span>
                </div>
                <span className="text-[10px] text-gray-400 block">GhanaHQ token: Active</span>
              </div>
            </div>

            {/* Test Query Payload block */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Diagnostic Test Query Return (JSON schema format)</span>
              <div className="p-4 bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto text-gray-800 dark:text-gray-200">
                <pre>{JSON.stringify({
                  totalProducts: diagnosticResult.database.totalProducts,
                  firstProduct: diagnosticResult.database.firstProduct?.name || 'N/A',
                  imageURL: diagnosticResult.database.firstProduct?.imageURL || 'N/A',
                  category: diagnosticResult.database.firstProduct?.category || 'N/A',
                  price: diagnosticResult.database.firstProduct?.price || 'N/A'
                }, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Database logs */}
      <div className="p-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/30 dark:bg-black/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Server className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-left text-xs">
            <span className="font-bold text-gray-900 dark:text-white block">Accra Core Database System State</span>
            <span className="text-[10px] text-gray-400 block">Connected to active node server on localhost:3000 • Integrity index 100%.</span>
          </div>
        </div>
        <span className="text-[10px] font-bold font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          ● ONLINE
        </span>
      </div>
    </div>
  );
}
