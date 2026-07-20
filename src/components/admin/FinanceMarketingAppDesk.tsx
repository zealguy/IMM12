/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, FileSpreadsheet, Megaphone, Store, ShieldCheck, 
  Settings, CheckCircle, RefreshCw, Plus, Send, Sliders, Lock, HelpCircle, AlertCircle
} from 'lucide-react';
import { Coupon } from '../../types';
import { 
  IntegrationApp, INITIAL_INTEGRATIONS, 
  AuditLog, INITIAL_AUDIT_LOGS, 
  WalletTransaction, INITIAL_WALLETS_LEDGER, 
  MarketingCampaign, INITIAL_CAMPAIGNS 
} from './MockData';

interface FinanceMarketingAppDeskProps {
  coupons: Coupon[];
  currency: 'GHS' | 'USD';
  onCreateCoupon: (coupon: Coupon) => Promise<Coupon>;
}

export default function FinanceMarketingAppDesk({ coupons, currency, onCreateCoupon }: FinanceMarketingAppDeskProps) {
  const [deskTab, setDeskTab] = useState<'wallet' | 'accounting' | 'marketing' | 'marketplace' | 'staff'>('wallet');

  // Integrations states
  const [integrations, setIntegrations] = useState<IntegrationApp[]>([...INITIAL_INTEGRATIONS]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [configKeys, setConfigKeys] = useState<Record<string, string>>({});

  // Wallets ledger states
  const [walletLedger, setWalletLedger] = useState<WalletTransaction[]>([...INITIAL_WALLETS_LEDGER]);
  const [activeWallet, setActiveWallet] = useState<'Main' | 'Operations' | 'Marketing' | 'Repair'>('Main');
  const [isPayoutPending, setIsPayoutPending] = useState(false);

  // Marketing campaigns states
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([...INITIAL_CAMPAIGNS]);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [campName, setCampName] = useState('');
  const [campChannel, setCampChannel] = useState<'Email' | 'SMS' | 'WhatsApp'>('WhatsApp');
  const [campAudience, setCampAudience] = useState('All Customers');
  const [campContent, setCampContent] = useState('');

  // Coupon promo code states
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState(10);
  const [newPromoMinSpend, setNewPromoMinSpend] = useState(0);

  // Staff roles states
  const [selectedStaffRole, setSelectedStaffRole] = useState<'owner' | 'admin' | 'technician' | 'accountant' | 'marketing'>('owner');
  const [staffPermissions, setStaffPermissions] = useState<Record<string, boolean>>({
    'billing': true,
    'write-catalog': true,
    'diagnose-hardware': true,
    'adjust-configs': true,
    'audit-logs': true
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([...INITIAL_AUDIT_LOGS]);

  // Action: trigger instant payout settlements
  const handleTriggerPayout = () => {
    setIsPayoutPending(true);
    setTimeout(() => {
      const newTx: WalletTransaction = {
        id: `tx-${Date.now().toString().slice(-4)}`,
        wallet: 'Main',
        type: 'Settlement',
        amountGHS: 25000,
        description: 'Instant Mobile Money merchant checkout settlement cleared to bank.',
        timestamp: new Date().toISOString(),
        status: 'Cleared'
      };
      setWalletLedger([newTx, ...walletLedger]);
      setIsPayoutPending(false);

      const newAudit: AuditLog = {
        id: `audit-${Date.now().toString().slice(-4)}`,
        user: 'Benjamin Danso (CEO)',
        role: 'CEO',
        action: 'Authorized instant settlement payout of GHS 25,000 to operational reserve.',
        timestamp: new Date().toISOString(),
        ipAddress: '102.176.45.12',
        status: 'Success'
      };
      setAuditLogs([newAudit, ...auditLogs]);
    }, 1500);
  };

  // Action: create coupon promo values
  const handleDeployCoupon = async () => {
    if (!newPromoCode) return;
    const newCoup: Coupon = {
      code: newPromoCode.toUpperCase().trim(),
      discountPercent: Number(newPromoDiscount),
      active: true,
      minSpendGHS: newPromoMinSpend > 0 ? Number(newPromoMinSpend) : undefined
    };

    await onCreateCoupon(newCoup);
    setNewPromoCode('');
  };

  // Action: Launch marketing broadcasts
  const handleDeployCampaign = () => {
    if (!campName || !campContent) return;
    const newCamp: MarketingCampaign = {
      id: `camp-${Date.now().toString().slice(-3)}`,
      name: campName,
      channel: campChannel,
      audience: campAudience,
      status: 'Sent',
      sentCount: 250,
      engagementRate: '88.5%',
      content: campContent
    };

    setCampaigns([newCamp, ...campaigns]);
    setIsCreatingCampaign(false);
    setCampName('');
    setCampContent('');
  };

  // Action: config App keys
  const handleConfigureApp = (appId: string) => {
    const app = integrations.find(i => i.id === appId);
    if (app) {
      setSelectedAppId(appId);
      setConfigKeys({ ...app.config });
    }
  };

  const handleSaveAppConfig = () => {
    if (!selectedAppId) return;
    setIntegrations(prev => prev.map(i => {
      if (i.id === selectedAppId) {
        return {
          ...i,
          installed: true,
          status: 'active',
          config: { ...configKeys }
        };
      }
      return i;
    }));
    setSelectedAppId(null);
  };

  // Helper values
  const walletSum = walletLedger
    .filter(t => t.wallet === activeWallet && t.status === 'Cleared')
    .reduce((sum, t) => sum + (t.type === 'Income' || t.type === 'Transfer' ? t.amountGHS : -t.amountGHS), 125000);

  return (
    <div className="space-y-6">
      {/* Sub tabs navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50 dark:bg-black/25 border border-gray-150 dark:border-gray-800 rounded-2xl w-fit">
        <button
          onClick={() => setDeskTab('wallet')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase font-mono tracking-tight transition ${
            deskTab === 'wallet' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          Built-in Wallets
        </button>
        <button
          onClick={() => setDeskTab('accounting')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase font-mono tracking-tight transition ${
            deskTab === 'accounting' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          Finance & Accounting
        </button>
        <button
          onClick={() => setDeskTab('marketing')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase font-mono tracking-tight transition ${
            deskTab === 'marketing' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          Campaign Studio
        </button>
        <button
          onClick={() => setDeskTab('marketplace')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase font-mono tracking-tight transition ${
            deskTab === 'marketplace' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          App Marketplace
        </button>
        <button
          onClick={() => setDeskTab('staff')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase font-mono tracking-tight transition ${
            deskTab === 'staff' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          Security & Staff
        </button>
      </div>

      {/* 1. WALLET WORKSPACE */}
      {deskTab === 'wallet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Wallet selector balances */}
          <div className="lg:col-span-5 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] font-black uppercase font-mono text-gray-400">Corporate Multi-wallet allocations</span>
            
            <div className="space-y-2.5">
              {['Main', 'Operations', 'Marketing', 'Repair'].map(wl => {
                const isActive = activeWallet === wl;
                let capGHS = 145200;
                if (wl === 'Operations') capGHS = 32400;
                else if (wl === 'Marketing') capGHS = 12000;
                else if (wl === 'Repair') capGHS = 8500;

                return (
                  <div
                    key={wl}
                    onClick={() => setActiveWallet(wl as any)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
                      isActive 
                        ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/10' 
                        : 'border-gray-150 dark:border-gray-850 bg-gray-50/50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between text-xs">
                      <span className="font-extrabold">{wl} Allocation Vault</span>
                      <span className="font-mono text-[10px] text-gray-400">STATUS: AUDITED</span>
                    </div>
                    <h4 className="text-lg font-black text-gray-950 dark:text-white mt-2 font-mono">
                      GHS {capGHS.toLocaleString()}
                    </h4>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleTriggerPayout}
              disabled={isPayoutPending}
              className="w-full py-2.5 bg-[#0066FF] hover:bg-[#0055DD] text-white rounded-xl text-xs font-black uppercase transition disabled:opacity-50"
            >
              {isPayoutPending ? 'Processing mobile money settlement...' : 'Trigger Settlement Payout (MoMo)'}
            </button>
          </div>

          {/* Right panel: transaction logs */}
          <div className="lg:col-span-7 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] font-black uppercase font-mono text-gray-400">Audit Settlement Transactions Ledger</span>
            <div className="space-y-3 max-h-[340px] overflow-y-auto">
              {walletLedger.map(tx => (
                <div key={tx.id} className="p-3 border border-gray-100 dark:border-gray-900 rounded-xl bg-gray-50/50 dark:bg-black/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-gray-400 block uppercase">{tx.wallet} • {tx.type}</span>
                    <h5 className="font-extrabold text-gray-900 dark:text-white leading-snug mt-1">{tx.description}</h5>
                    <span className="text-[9px] text-gray-400 font-mono mt-0.5 block">{new Date(tx.timestamp).toLocaleString()}</span>
                  </div>
                  <span className={`font-mono font-black ${
                    tx.type === 'Income' ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {tx.type === 'Income' ? '+' : '-'}GHS {tx.amountGHS.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. FINANCE & ACCOUNTING WORKSPACE */}
      {deskTab === 'accounting' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] font-black uppercase font-mono text-gray-400">Audit sheets: Profit &amp; Loss (GHS)</span>
            
            <div className="border border-gray-100 dark:border-gray-900 rounded-xl overflow-hidden font-mono text-xs">
              <div className="grid grid-cols-3 bg-gray-50 dark:bg-black/20 p-2.5 font-bold uppercase text-[10px] text-gray-400 border-b border-gray-100 dark:border-gray-900">
                <span>Account Category Line</span>
                <span className="text-center">Q1 Financials</span>
                <span className="text-right">Q2 Projected</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-900">
                <div className="grid grid-cols-3 p-2.5 font-bold text-gray-900 dark:text-white">
                  <span>Gross Sales Income</span>
                  <span className="text-center">384,500</span>
                  <span className="text-right text-emerald-500">452,100</span>
                </div>
                <div className="grid grid-cols-3 p-2.5 text-gray-400">
                  <span>Less cost of sales (OEM parts)</span>
                  <span className="text-center">-145,000</span>
                  <span className="text-right">-172,000</span>
                </div>
                <div className="grid grid-cols-3 p-2.5 font-bold text-amber-500 bg-gray-100/10">
                  <span>Gross Profit</span>
                  <span className="text-center">239,500</span>
                  <span className="text-right">280,100</span>
                </div>
                <div className="grid grid-cols-3 p-2.5 text-gray-400">
                  <span>Operating expenses (Salaries/Radio)</span>
                  <span className="text-center">-52,400</span>
                  <span className="text-right">-64,000</span>
                </div>
                <div className="grid grid-cols-3 p-2.5 font-bold text-emerald-500 bg-emerald-500/5">
                  <span>Net Operating Profit</span>
                  <span className="text-center">187,100</span>
                  <span className="text-right">216,100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Promo coupons creator */}
          <div className="lg:col-span-4 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] font-black uppercase font-mono text-gray-400">Promotions Deployment Bench</span>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase font-mono text-gray-400">Coupon Promo Code</label>
                <input
                  type="text"
                  placeholder="E.g., EASTLEGON10"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase font-mono text-gray-400">Discount %</label>
                  <input
                    type="number"
                    value={newPromoDiscount}
                    onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                    className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase font-mono text-gray-400">Min Spend (GHS)</label>
                  <input
                    type="number"
                    value={newPromoMinSpend}
                    onChange={(e) => setNewPromoMinSpend(Number(e.target.value))}
                    className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleDeployCoupon}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs uppercase rounded-lg transition"
              >
                Deploy promo coupon
              </button>

              <div className="border-t border-gray-100 dark:border-gray-850 pt-3 space-y-2">
                <span className="text-[9px] uppercase font-mono font-bold text-gray-400 block">Deployed promo registry ({coupons.length})</span>
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {coupons.map((c, i) => (
                    <div key={i} className="p-2 border border-gray-100 dark:border-gray-900 rounded font-mono text-[10px] flex justify-between">
                      <span className="font-extrabold text-[#0066FF]">{c.code}</span>
                      <span className="font-bold text-amber-500">{c.discountPercent}% OFF</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CAMPAIGN STUDIO */}
      {deskTab === 'marketing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
              <span className="text-[10px] font-black uppercase font-mono text-gray-400">Customer Broadcast Campaigns</span>
              <button
                onClick={() => setIsCreatingCampaign(true)}
                className="px-3 py-1 bg-amber-500 text-black font-black text-[10px] uppercase font-mono rounded"
              >
                Draft Broadcast
              </button>
            </div>

            {isCreatingCampaign && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl space-y-3.5 text-xs bg-gray-50 dark:bg-black/20"
              >
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] font-bold uppercase font-mono text-gray-400">Campaign Name</label>
                    <input
                      type="text"
                      value={campName}
                      onChange={(e) => setCampName(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-800 rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase font-mono text-gray-400">Channel</label>
                    <select
                      value={campChannel}
                      onChange={(e) => setCampChannel(e.target.value as any)}
                      className="w-full p-2 bg-white dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-800 rounded text-xs"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="SMS">SMS</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase font-mono text-gray-400">Audience Segment</label>
                  <input
                    type="text"
                    value={campAudience}
                    onChange={(e) => setCampAudience(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-800 rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase font-mono text-gray-400">Broadcast Message copy</label>
                  <textarea
                    rows={3}
                    value={campContent}
                    onChange={(e) => setCampContent(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-800 rounded"
                  />
                </div>

                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    onClick={() => setIsCreatingCampaign(false)}
                    className="px-3 py-1.5 border border-gray-150 dark:border-gray-800 rounded font-bold uppercase font-mono text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeployCampaign}
                    className="px-4 py-1.5 bg-emerald-500 text-black rounded font-black uppercase font-mono text-[10px]"
                  >
                    Launch Campaign
                  </button>
                </div>
              </motion.div>
            )}

            <div className="space-y-3.5 max-h-60 overflow-y-auto">
              {campaigns.map(camp => (
                <div key={camp.id} className="p-3.5 border border-gray-100 dark:border-gray-900 rounded-xl bg-gray-50/50 dark:bg-black/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#0066FF] font-mono block">{camp.id} • {camp.channel}</span>
                    <h5 className="font-extrabold text-gray-950 dark:text-white mt-1 text-xs">{camp.name}</h5>
                    <p className="text-[10px] text-gray-400 truncate max-w-sm mt-0.5">{camp.content}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold block text-emerald-500 font-mono">ROI: {camp.engagementRate}</span>
                    <span className="text-[9px] text-gray-400 font-mono block mt-0.5">{camp.sentCount} Dispatched</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Ads tracker */}
          <div className="lg:col-span-4 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] font-black uppercase font-mono text-gray-400">Social Ads performance</span>
            
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl flex justify-between items-center">
                <div>
                  <span className="font-bold block text-gray-800 dark:text-gray-200">Google Search Ads</span>
                  <span className="text-[10px] text-gray-400 block">Daily Spend: GHS 150</span>
                </div>
                <div className="text-right font-bold">
                  <span className="text-emerald-400 block">4.2x ROI</span>
                  <span className="text-[9px] text-gray-400 block">2.8% CTR</span>
                </div>
              </div>

              <div className="p-3 bg-purple-500/5 border border-purple-500/15 rounded-xl flex justify-between items-center">
                <div>
                  <span className="font-bold block text-gray-800 dark:text-gray-200">Meta Video Campaigns</span>
                  <span className="text-[10px] text-gray-400 block">Daily Spend: GHS 220</span>
                </div>
                <div className="text-right font-bold">
                  <span className="text-emerald-400 block">3.8x ROI</span>
                  <span className="text-[9px] text-gray-400 block">1.9% CTR</span>
                </div>
              </div>

              <div className="p-3 bg-cyan-500/5 border border-cyan-500/15 rounded-xl flex justify-between items-center">
                <div>
                  <span className="font-bold block text-gray-800 dark:text-gray-200">TikTok Tech Reviews</span>
                  <span className="text-[10px] text-gray-400 block">Daily Spend: GHS 100</span>
                </div>
                <div className="text-right font-bold">
                  <span className="text-emerald-400 block">5.1x ROI</span>
                  <span className="text-[9px] text-gray-400 block">4.5% CTR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. APP MARKETPLACE */}
      {deskTab === 'marketplace' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#121212] p-4 border border-gray-150 dark:border-gray-800 rounded-2xl">
            <span className="text-[10px] font-black uppercase font-mono text-gray-400 block">1-Click Integration Store</span>
            <p className="text-xs text-gray-400 mt-1">Deploy, authenticate, and configure leading global gateways and shipping webhooks seamlessly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map(app => (
              <div key={app.id} className="bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between h-44">
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{app.logo}</span>
                      <div>
                        <h4 className="font-black text-sm text-gray-950 dark:text-white leading-tight">{app.name}</h4>
                        <span className="text-[9px] bg-gray-50 dark:bg-black/35 text-gray-400 px-1.5 py-0.5 rounded font-bold font-mono uppercase tracking-wide mt-1 inline-block">
                          {app.category}
                        </span>
                      </div>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${app.installed ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  </div>
                  <p className="text-xs text-gray-400 leading-snug pt-1.5">{app.description}</p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleConfigureApp(app.id)}
                    className="px-4 py-2 bg-gray-50 dark:bg-black/25 border border-gray-150 dark:border-gray-800 hover:border-gray-300 rounded-xl text-xs font-black uppercase font-mono transition"
                  >
                    {app.installed ? 'Configure key' : 'Activate Integration'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. STAFF ROLES AND SECURITY LOGS */}
      {deskTab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Roles permission matrices */}
          <div className="lg:col-span-5 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] font-black uppercase font-mono text-gray-400">Staff Access Control</span>
            
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase font-mono text-gray-400">Select simulated staff login</label>
                <select
                  value={selectedStaffRole}
                  onChange={(e) => {
                    const r = e.target.value as any;
                    setSelectedStaffRole(r);
                    if (r === 'technician') {
                      setStaffPermissions({
                        'billing': false, 'write-catalog': false, 'diagnose-hardware': true, 'adjust-configs': false, 'audit-logs': false
                      });
                    } else if (r === 'accountant') {
                      setStaffPermissions({
                        'billing': true, 'write-catalog': false, 'diagnose-hardware': false, 'adjust-configs': false, 'audit-logs': true
                      });
                    } else {
                      setStaffPermissions({
                        'billing': true, 'write-catalog': true, 'diagnose-hardware': true, 'adjust-configs': true, 'audit-logs': true
                      });
                    }
                  }}
                  className="w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-lg font-bold"
                >
                  <option value="owner">Benjamin Danso (CEO / Full Admin)</option>
                  <option value="technician">Isaac (Chief Tech workbench)</option>
                  <option value="accountant">Sandra A. (Auditor Ledger)</option>
                </select>
              </div>

              <div className="space-y-2 bg-gray-50 dark:bg-black/15 p-4 border border-gray-100 dark:border-gray-850 rounded-xl">
                <span className="text-[9px] font-mono font-bold uppercase text-gray-400 block mb-2">[ROLE PERMISSION CONSTRAINTS]</span>
                <div className="space-y-2 font-mono text-[11px]">
                  {Object.entries(staffPermissions).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center">
                      <span className="capitalize">{k.replace('-', ' ')}</span>
                      <span className={`font-bold ${v ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {v ? 'AUTHORIZED' : 'ACCESS LOCKED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Audit logs listing */}
          <div className="lg:col-span-7 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] font-black uppercase font-mono text-gray-400">Security Access Audit logs</span>
            <div className="space-y-3 max-h-[340px] overflow-y-auto">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 border border-gray-150 dark:border-gray-900 rounded-xl bg-gray-50/50 dark:bg-black/10 flex justify-between items-start text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-blue-500 uppercase">{log.user} ({log.role})</span>
                    <p className="text-gray-700 dark:text-gray-300 leading-normal font-sans text-xs">{log.action}</p>
                    <span className="text-[9px] text-gray-400 block">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-black/35 px-1.5 py-0.5 rounded font-bold">
                    {log.ipAddress}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* API Key integration config Modal */}
      <AnimatePresence>
        {selectedAppId && (() => {
          const app = integrations.find(i => i.id === selectedAppId);
          if (!app) return null;

          return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl"
              >
                <div>
                  <h3 className="text-base font-black text-gray-950 dark:text-white">Configure {app.name} API Keys</h3>
                  <p className="text-xs text-gray-400">Configure secure server webhooks to synchronize operations.</p>
                </div>

                <div className="space-y-3">
                  {Object.keys(app.config).map((key) => (
                    <div key={key} className="space-y-1 text-xs">
                      <label className="text-[9px] font-bold uppercase font-mono text-gray-400">{key.replace(/([A-Z])/g, ' $1')}</label>
                      <input
                        type="password"
                        placeholder="••••••••••••••••••••"
                        value={configKeys[key] || ''}
                        onChange={(e) => setConfigKeys({ ...configKeys, [key]: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 dark:bg-black/25 border border-gray-150 dark:border-gray-800 rounded font-mono font-bold"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-1.5 pt-2">
                  <button
                    onClick={() => setSelectedAppId(null)}
                    className="px-3 py-1.5 border border-gray-150 dark:border-gray-800 text-xs font-bold font-mono rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAppConfig}
                    className="px-4 py-1.5 bg-amber-500 text-black text-xs font-black uppercase rounded"
                  >
                    Activate Integration
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
