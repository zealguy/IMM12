/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Download, Eye, Calendar, Filter, FileText, 
  CheckCircle, ArrowUpRight, BarChart3, RefreshCw, Smartphone, PieChart, ShieldCheck
} from 'lucide-react';

interface AnalyticsDeskProps {
  currency: 'GHS' | 'USD';
}

export default function AnalyticsDesk({ currency }: AnalyticsDeskProps) {
  // Filter states
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '12m' | 'all'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  // Export Modal states
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'xlsx'>('pdf');
  const [exportFileName, setExportFileName] = useState('immortal_electronics_q2_report');
  const [exportSuccess, setExportSuccess] = useState(false);

  const categories = ['All', 'Smartphones', 'Computing', 'Accessories', 'Gaming', 'Smart Home'];
  const brands = ['All', 'Apple', 'Samsung', 'Google Pixel', 'Sony', 'Anker', 'TP-Link'];
  const locations = ['All', 'Accra Central', 'East Legon Branch', 'Kumasi Airport', 'Tema Harbour', 'Tamale City'];

  // Static chart data (responsive scale coordinates for SVGs)
  const chartPoints30d = "0,80 15,65 30,75 45,45 60,50 75,30 90,42 105,25 120,28 135,12 150,22 165,5 180,10 195,1";
  const chartPoints7d = "0,80 30,55 60,65 90,35 120,40 150,15 180,10";

  // Trigger simulated compile and export of business intelligence documents
  const handleTriggerExport = () => {
    setIsExporting(true);
    setExportSuccess(false);
    setExportProgress(0);

    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setExportSuccess(true);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Studio Filter Bar */}
      <div className="bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-lg p-1">
            <button
              onClick={() => setDateRange('7d')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${dateRange === '7d' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${dateRange === '30d' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange('12m')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${dateRange === '12m' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              12 Months
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={13} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-1.5 bg-gray-50 dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-800 text-xs rounded-lg font-semibold"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="p-1.5 bg-gray-50 dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-800 text-xs rounded-lg font-semibold"
            >
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="hidden sm:inline-block p-1.5 bg-gray-50 dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-800 text-xs rounded-lg font-semibold"
            >
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsExporting(true)}
          className="flex items-center justify-center gap-1.5 bg-[#0066FF] hover:bg-[#0055DD] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition"
        >
          <Download size={14} />
          <span>Export BI Reports</span>
        </button>
      </div>

      {/* Main Charts Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Large Sales & Diagnostics Revenue Line Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase font-mono text-gray-400">FINANCIAL PERFORMANCE TREND</span>
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">Gross Revenue & Diagnostics Volumes</h4>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>E-Commerce Sales</span>
              </span>
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span>Repairs Intake</span>
              </span>
            </div>
          </div>

          {/* SVG Vector Chart Container */}
          <div className="h-64 relative pt-4">
            <svg viewBox="0 0 200 85" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="repairs-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="#60A5FA" stopOpacity="0"/>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="200" y2="20" stroke="rgba(156,163,175,0.08)" strokeDasharray="2" />
              <line x1="0" y1="40" x2="200" y2="40" stroke="rgba(156,163,175,0.08)" strokeDasharray="2" />
              <line x1="0" y1="60" x2="200" y2="60" stroke="rgba(156,163,175,0.08)" strokeDasharray="2" />
              <line x1="0" y1="80" x2="200" y2="80" stroke="rgba(156,163,175,0.15)" />

              {/* Sales Curve */}
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={dateRange === '7d' ? chartPoints7d : chartPoints30d}
              />
              <polygon
                fill="url(#revenue-grad)"
                points={dateRange === '7d' ? `0,80 ${chartPoints7d} 180,80` : `0,80 ${chartPoints30d} 195,80`}
              />

              {/* Repairs Curve (simulated shift) */}
              <polyline
                fill="none"
                stroke="#60A5FA"
                strokeWidth="1.8"
                strokeDasharray="1 1"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={dateRange === '7d' ? "0,70 30,45 60,50 90,25 120,38 150,10 180,12" : "0,75 15,55 30,68 45,35 60,42 75,25 90,38 105,15 120,20 135,5 150,18 165,2 180,8 195,0"}
              />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] font-mono text-gray-400 px-1 pt-1.5">
              <span>{dateRange === '7d' ? '6 Days ago' : 'Week 1'}</span>
              <span>{dateRange === '7d' ? '4 Days ago' : 'Week 2'}</span>
              <span>{dateRange === '7d' ? '2 Days ago' : 'Week 3'}</span>
              <span>{dateRange === '7d' ? 'Today' : 'Today'}</span>
            </div>
          </div>
        </div>

        {/* Geographic Heatmap Distribution */}
        <div className="lg:col-span-4 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase font-mono text-gray-400">GEOGRAPHIC HEATMAP</span>
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">Metropolitan Hub Demands</h4>
          </div>

          <div className="space-y-3.5 pt-2">
            <div>
              <div className="flex justify-between items-center text-xs font-mono font-bold mb-1">
                <span>Accra (Central Hub)</span>
                <span className="text-[#0066FF]">GHS 324,500</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-black/35 h-2 rounded-full overflow-hidden">
                <div className="bg-[#0066FF] h-full rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-mono font-bold mb-1">
                <span>Kumasi Metropolis</span>
                <span className="text-amber-500">GHS 142,000</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-black/35 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '48%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-mono font-bold mb-1">
                <span>Tema Industrial Port</span>
                <span className="text-purple-500">GHS 85,300</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-black/35 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '32%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-mono font-bold mb-1">
                <span>Tamale (North Node)</span>
                <span className="text-cyan-500">GHS 34,200</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-black/35 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '12%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Category Share distribution */}
        <div className="bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-black uppercase font-mono text-gray-400">Inventory Category mix</h4>
          <div className="grid grid-cols-2 gap-4 pt-1 items-center">
            {/* Custom Pie Chart representation using pure SVG segment overlays */}
            <div className="relative w-32 h-32 mx-auto">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e1e1e1" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0066FF" strokeWidth="4.2" strokeDasharray="45 55" strokeDashoffset="100" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="4.2" strokeDasharray="25 75" strokeDashoffset="55" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8B5CF6" strokeWidth="4.2" strokeDasharray="18 82" strokeDashoffset="30" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#06B6D4" strokeWidth="4.2" strokeDasharray="12 88" strokeDashoffset="12" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-gray-900 dark:text-white">GHS</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase font-mono">Ledger Shares</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#0066FF] rounded-md" />
                <span className="text-gray-400">Smartphones</span>
                <span className="font-extrabold ml-auto">45%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-md" />
                <span className="text-gray-400">Computing</span>
                <span className="font-extrabold ml-auto">25%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-purple-500 rounded-md" />
                <span className="text-gray-400">Accessories</span>
                <span className="font-extrabold ml-auto">18%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-cyan-500 rounded-md" />
                <span className="text-gray-400">Gaming</span>
                <span className="font-extrabold ml-auto">12%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Funnel conversion Metrics */}
        <div className="bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-black uppercase font-mono text-gray-400">Customer procurement funnel</h4>
          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center text-xs font-bold font-mono">
              <span className="text-gray-400">1. CATALOG LANDINGS</span>
              <span className="text-emerald-500">100.0% (14.2k)</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-black/25 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#0066FF] h-full" style={{ width: '100%' }} />
            </div>

            <div className="flex justify-between items-center text-xs font-bold font-mono">
              <span className="text-gray-400">2. DEVICE APPRAISALS & COMPARE</span>
              <span className="text-emerald-500">42.5% (6.0k)</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-black/25 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full" style={{ width: '42.5%' }} />
            </div>

            <div className="flex justify-between items-center text-xs font-bold font-mono">
              <span className="text-gray-400">3. DIAGNOSTICS & BOOKINGS</span>
              <span className="text-amber-500">18.4% (2.6k)</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-black/25 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full" style={{ width: '18.4%' }} />
            </div>

            <div className="flex justify-between items-center text-xs font-bold font-mono">
              <span className="text-gray-400">4. COMPLETED TRANSACTIONS</span>
              <span className="text-emerald-500">2.84% (403)</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-black/25 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: '8.5%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Export intelligence overlay Modal */}
      <AnimatePresence>
        {isExporting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-black text-gray-950 dark:text-white">Export Business Intelligence</h3>
                  <p className="text-xs text-gray-400">Compile financial audit logs, CRM databases, and operations analytics.</p>
                </div>
                <button 
                  onClick={() => setIsExporting(false)} 
                  className="text-xs text-gray-400 hover:text-white font-mono p-1 border border-gray-150 dark:border-gray-800 rounded bg-gray-100 dark:bg-black/10"
                >
                  ESC
                </button>
              </div>

              {!exportSuccess ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-400">File Reference Name</label>
                    <input
                      type="text"
                      value={exportFileName}
                      onChange={(e) => setExportFileName(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-lg text-xs font-mono font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-400">Compilation Format</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['pdf', 'csv', 'xlsx'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setExportFormat(f as any)}
                          className={`py-2 text-xs font-bold rounded-lg border uppercase font-mono transition ${
                            exportFormat === f 
                              ? 'bg-[#0066FF]/10 border-[#0066FF] text-[#0066FF]' 
                              : 'bg-transparent border-gray-150 dark:border-gray-800 text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                          }`}
                        >
                          .{f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {exportProgress > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[10px] font-mono font-extrabold text-gray-400">
                        <span>COMPILING LEDGERS...</span>
                        <span>{exportProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-black/35 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#0066FF] h-full rounded-full transition-all duration-100" style={{ width: `${exportProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleTriggerExport}
                    disabled={exportProgress > 0}
                    className="w-full py-2.5 bg-[#0066FF] hover:bg-[#0055DD] text-white text-xs font-black rounded-xl transition shadow-lg disabled:opacity-50"
                  >
                    Build Document
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3 text-center"
                >
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/5">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-950 dark:text-white">Document Compiled Successfully</h4>
                    <p className="text-[11px] text-gray-400 font-mono mt-1">
                      {exportFileName.endsWith(`.${exportFormat}`) ? exportFileName : `${exportFileName}.${exportFormat}`} (142.4 KB)
                    </p>
                  </div>
                  <button
                    onClick={() => setIsExporting(false)}
                    className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black rounded-lg transition"
                  >
                    Close & Save
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
