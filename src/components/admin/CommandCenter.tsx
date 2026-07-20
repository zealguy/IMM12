/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, DollarSign, Users, AlertCircle, ShoppingBag, 
  Hammer, Sliders, RefreshCw, Bell, Terminal, CheckCircle, HelpCircle, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { Order, RepairRequest, TradeInRequest } from '../../types';

interface CommandCenterProps {
  orders: Order[];
  repairs: RepairRequest[];
  tradeins: TradeInRequest[];
  currency: 'GHS' | 'USD';
}

interface KPICard {
  id: string;
  label: string;
  value: number;
  isCurrency: boolean;
  formatString?: string;
  changePercent: number;
  trend: 'up' | 'down';
  sparkline: number[];
  icon: React.ComponentType<any>;
  colorClass: string;
}

export default function CommandCenter({ orders, repairs, tradeins, currency }: CommandCenterProps) {
  // Derive metrics from real state
  const totalSalesGHS = orders.reduce((sum, o) => sum + o.totalGHS, 0);
  const totalSalesUSD = orders.reduce((sum, o) => sum + (o.totalUSD || Math.round(o.totalGHS / 14.5)), 0);
  
  const pendingSalesCount = orders.filter(o => o.status === 'Pending').length;
  const activeRepairsCount = repairs.filter(r => r.status !== 'Completed').length;
  const completedRepairsCount = repairs.filter(r => r.status === 'Completed').length;
  const completedRepairsGHS = repairs.filter(r => r.status === 'Completed').reduce((sum, r) => sum + (r.quotationGHS || 0), 0);

  // Sparkline data generators
  const initialSparkline = [30, 45, 35, 50, 40, 60, 55, 70];

  const [kpis, setKpis] = useState<KPICard[]>([
    {
      id: 'total-revenue',
      label: 'Gross Revenue',
      value: currency === 'GHS' ? (totalSalesGHS + completedRepairsGHS) : (totalSalesUSD + Math.round(completedRepairsGHS / 14.5)),
      isCurrency: true,
      changePercent: 12.4,
      trend: 'up',
      sparkline: [...initialSparkline],
      icon: DollarSign,
      colorClass: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      id: 'website-visitors',
      label: 'Live Visitors',
      value: 148,
      isCurrency: false,
      formatString: '',
      changePercent: 8.2,
      trend: 'up',
      sparkline: [120, 130, 115, 140, 135, 148, 142, 148],
      icon: Users,
      colorClass: 'text-blue-500 bg-blue-500/10'
    },
    {
      id: 'conversion-rate',
      label: 'Conversion Rate',
      value: 2.84,
      isCurrency: false,
      formatString: '%',
      changePercent: -1.2,
      trend: 'down',
      sparkline: [3.1, 2.9, 2.8, 3.0, 2.7, 2.85, 2.82, 2.84],
      icon: TrendingUp,
      colorClass: 'text-purple-500 bg-purple-500/10'
    },
    {
      id: 'pending-orders',
      label: 'Pending Orders',
      value: pendingSalesCount,
      isCurrency: false,
      changePercent: -15,
      trend: 'down',
      sparkline: [8, 7, 9, 6, 5, 4, 3, pendingSalesCount],
      icon: ShoppingBag,
      colorClass: 'text-amber-500 bg-amber-500/10'
    },
    {
      id: 'active-repairs',
      label: 'Active Repairs',
      value: activeRepairsCount,
      isCurrency: false,
      changePercent: 5.4,
      trend: 'up',
      sparkline: [10, 12, 11, 14, 13, 12, 14, activeRepairsCount],
      icon: Hammer,
      colorClass: 'text-cyan-500 bg-cyan-500/10'
    },
    {
      id: 'customer-satisfaction',
      label: 'CSAT Score',
      value: 98.4,
      isCurrency: false,
      formatString: '%',
      changePercent: 0.5,
      trend: 'up',
      sparkline: [97.8, 98.0, 98.1, 98.3, 98.2, 98.4, 98.3, 98.4],
      icon: CheckCircle,
      colorClass: 'text-pink-500 bg-pink-500/10'
    }
  ]);

  // Customizable widget display states
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>([
    'total-revenue', 'website-visitors', 'conversion-rate', 'pending-orders', 'active-repairs', 'customer-satisfaction'
  ]);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Live WebSocket Tick log simulation
  const [liveLogs, setLiveLogs] = useState<Array<{ id: string; text: string; time: string; type: 'info' | 'success' | 'warn' }>>([
    { id: '1', text: 'Live WebSocket gateway authorized on port 3000.', time: '01:15', type: 'info' },
    { id: '2', text: `New GHS checkout logged - Invoice IM-ORD-772`, time: '01:12', type: 'success' },
    { id: '3', text: 'Chief Technician Isaac checked in for Morning Diagnostics Shift.', time: '01:05', type: 'info' }
  ]);

  const [flashCardId, setFlashCardId] = useState<string | null>(null);

  useEffect(() => {
    // Dynamic KPI value recalculator if currency/orders change
    setKpis(prev => prev.map(k => {
      if (k.id === 'total-revenue') {
        return {
          ...k,
          value: currency === 'GHS' ? (totalSalesGHS + completedRepairsGHS) : (totalSalesUSD + Math.round(completedRepairsGHS / 14.5))
        };
      }
      if (k.id === 'pending-orders') {
        return { ...k, value: pendingSalesCount };
      }
      if (k.id === 'active-repairs') {
        return { ...k, value: activeRepairsCount };
      }
      return k;
    }));
  }, [orders, repairs, tradeins, currency, totalSalesGHS, completedRepairsGHS]);

  // Simulate real-time stream ticks (WebSocket triggers)
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random KPI to mutate slightly
      const randomKpiIndex = Math.floor(Math.random() * kpis.length);
      const chosenKpi = kpis[randomKpiIndex];

      // Avoid changing static repair counts unless state updates
      if (chosenKpi.id === 'pending-orders' || chosenKpi.id === 'active-repairs' || chosenKpi.id === 'total-revenue') {
        return;
      }

      setKpis(prev => prev.map((k, idx) => {
        if (idx === randomKpiIndex) {
          let delta = 0;
          if (k.id === 'website-visitors') {
            delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
          } else if (k.id === 'conversion-rate') {
            delta = Number((Math.random() * 0.1 - 0.05).toFixed(2));
          } else if (k.id === 'customer-satisfaction') {
            delta = Number((Math.random() * 0.2 - 0.1).toFixed(1));
          }

          const newValue = Number((k.value + delta).toFixed(2));
          const updatedSparkline = [...k.sparkline.slice(1), newValue];

          setFlashCardId(k.id);
          setTimeout(() => setFlashCardId(null), 1000);

          return {
            ...k,
            value: newValue,
            sparkline: updatedSparkline,
            trend: delta >= 0 ? 'up' : 'down'
          };
        }
        return k;
      }));

      // Add fresh system log ticker
      const logTemplates = [
        { text: 'WebSocket Heartbeat synced.', type: 'info' },
        { text: 'Customer in Kumasi added item to comparison checklist.', type: 'info' },
        { text: 'Diagnostic system check: 45 critical points fully operational.', type: 'success' },
        { text: 'Central Accra store traffic peaking at 48 active sessions.', type: 'info' },
        { text: 'Stock notification triggered: Sony WH-1000XM5 low stock < 10.', type: 'warn' }
      ];
      const selectedTemplate = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      setLiveLogs(prev => [
        { id: Date.now().toString(), text: selectedTemplate.text, time: timeStr, type: selectedTemplate.type as any },
        ...prev.slice(0, 7)
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, [kpis]);

  const toggleWidget = (id: string) => {
    setVisibleWidgets(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-[#121212] p-4 border border-gray-150 dark:border-gray-800/80 rounded-2xl">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span>REAL-TIME COMMAND GRID</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Simulating secure enterprise WebSockets, diagnostic triggers, and transactional ledgers.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-tight transition-all ${
              isCustomizing 
                ? 'bg-amber-500 border-amber-600 text-black' 
                : 'bg-white dark:bg-black/30 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <Sliders size={13} />
            <span>{isCustomizing ? 'Lock Layout' : 'Customize Widgets'}</span>
          </button>
        </div>
      </div>

      {/* Widget Layout customizer block */}
      {isCustomizing && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3"
        >
          <div className="text-xs font-bold text-amber-500 uppercase font-mono tracking-wider">Configure Active Widgets</div>
          <p className="text-xs text-gray-400">Select which performance widgets are prioritized in your operations panel.</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {kpis.map(k => {
              const isChecked = visibleWidgets.includes(k.id);
              return (
                <button
                  key={k.id}
                  onClick={() => toggleWidget(k.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                    isChecked 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-500' 
                      : 'bg-gray-100 dark:bg-black/30 border-gray-200 dark:border-gray-800 text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-amber-500' : 'bg-gray-400'}`} />
                  <span>{k.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {kpis
            .filter(k => visibleWidgets.includes(k.id))
            .map(k => {
              const Icon = k.icon;
              const isFlashing = flashCardId === k.id;
              
              // Sparkline rendering
              const maxVal = Math.max(...k.sparkline) || 1;
              const minVal = Math.min(...k.sparkline) || 0;
              const range = maxVal - minVal || 1;
              const points = k.sparkline.map((val, idx) => {
                const x = (idx / (k.sparkline.length - 1)) * 120;
                const y = 35 - ((val - minVal) / range) * 28;
                return `${x},${y}`;
              }).join(' ');

              return (
                <motion.div
                  key={k.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    backgroundColor: isFlashing 
                      ? 'rgba(16, 185, 129, 0.08)' 
                      : 'rgba(255, 255, 255, 1)' 
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`p-5 border rounded-2xl flex flex-col justify-between h-40 transition-all shadow-sm ${
                    isFlashing 
                      ? 'border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-500/5' 
                      : 'border-gray-150 dark:border-gray-800 bg-white dark:bg-[#0B0B0B]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-mono">{k.label}</span>
                      <h4 className="text-xl font-black text-gray-950 dark:text-white tracking-tight">
                        {k.isCurrency && (currency === 'GHS' ? 'GHS ' : '$')}
                        {k.value.toLocaleString(undefined, { minimumFractionDigits: k.isCurrency ? 2 : 0, maximumFractionDigits: 2 })}
                        {k.formatString}
                      </h4>
                    </div>
                    <div className={`p-2 rounded-xl ${k.colorClass}`}>
                      <Icon size={16} />
                    </div>
                  </div>

                  {/* Sparkline & Percentage Trend Row */}
                  <div className="flex justify-between items-end pt-3 mt-auto">
                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
                      {k.trend === 'up' ? (
                        <span className="text-emerald-500 flex items-center gap-0.5">
                          <ArrowUpRight size={13} />
                          +{k.changePercent}%
                        </span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-0.5">
                          <ArrowDownRight size={13} />
                          {k.changePercent}%
                        </span>
                      )}
                      <span className="text-[9px] text-gray-400 uppercase">vs yesterday</span>
                    </div>

                    {/* Miniature Trend Line Sparkline SVG */}
                    <div className="w-28 h-8">
                      <svg viewBox="0 0 120 35" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id={`grad-${k.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={k.trend === 'up' ? '#10B981' : '#EF4444'} stopOpacity="0.25"/>
                            <stop offset="100%" stopColor={k.trend === 'up' ? '#10B981' : '#EF4444'} stopOpacity="0.00"/>
                          </linearGradient>
                        </defs>
                        <polyline
                          fill="none"
                          stroke={k.trend === 'up' ? '#10B981' : '#EF4444'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={points}
                        />
                        <polygon
                          fill={`url(#grad-${k.id})`}
                          points={`0,35 ${points} 120,35`}
                        />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Live System Log Stream & Network Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-black uppercase tracking-wider font-mono text-gray-400 flex items-center gap-2">
              <Terminal size={14} className="text-amber-500" />
              <span>System Ticker Logs</span>
            </h4>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-400 bg-gray-50 dark:bg-black/25 px-2.5 py-1 rounded">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span>WSS: ACTIVE</span>
            </div>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto font-mono text-[11px] leading-relaxed pr-1 custom-scrollbar">
            {liveLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start gap-2.5 p-2 bg-gray-50/50 dark:bg-black/10 border border-gray-100/50 dark:border-gray-900 rounded-lg"
              >
                <span className="text-gray-400 text-[10px] select-none">{log.time}</span>
                <span className={`font-semibold ${
                  log.type === 'success' ? 'text-emerald-500' :
                  log.type === 'warn' ? 'text-amber-500' :
                  'text-blue-400'
                }`}>
                  {log.type === 'success' ? '[CHECK]' : log.type === 'warn' ? '[WARN]' : '[INFO]'}
                </span>
                <p className="text-gray-700 dark:text-gray-300 flex-1">{log.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Network Health Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider font-mono text-gray-400">Security & Gateway</h4>
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-mono">TLS Security</span>
                <span className="font-extrabold text-emerald-500 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">AES_256_GCM</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-mono">Simulated Ping</span>
                <span className="font-extrabold text-emerald-400 font-mono">14ms</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-mono">System Host</span>
                <span className="font-extrabold text-gray-700 dark:text-gray-300 font-mono">0.0.0.0:3000</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-mono">Data Sovereignty</span>
                <span className="font-extrabold text-blue-400 font-mono">Ghana Node</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl space-y-1 mt-4">
            <span className="text-[9px] font-mono uppercase font-black text-blue-500 flex items-center gap-1">
              <HelpCircle size={10} />
              <span>Power-User Guide</span>
            </span>
            <p className="text-[10px] text-gray-400 leading-snug">Toggle different staff roles in the header to preview strict module accessibility overlays.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
