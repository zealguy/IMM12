/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Terminal, Bot, Settings, Users, Sun, Moon, Cpu, 
  HelpCircle, Monitor, ChevronRight, ChevronDown, Sparkles, Send, Bell, Clock, Search, X, Maximize2, Minimize2,
  Plus, Smartphone, Filter, Sliders, Upload, ClipboardList, Hammer, FileText
} from 'lucide-react';
import { Product, RepairRequest, TradeInRequest, Order, Coupon, BulkInquiry, BlogPost } from '../types';

// Import subcomponents
import CommandCenter from './admin/CommandCenter';
import AnalyticsDesk from './admin/AnalyticsDesk';
import ProductStudio from './admin/ProductStudio';
import CmsStudio from './admin/CmsStudio';
import OperationalHub from './admin/OperationalHub';
import FinanceMarketingAppDesk from './admin/FinanceMarketingAppDesk';
import SettingsDesk from './admin/SettingsDesk';
import AIProductHub from './admin/AIProductHub';

interface AdminPanelProps {
  products: Product[];
  repairs: RepairRequest[];
  tradeins: TradeInRequest[];
  orders: Order[];
  coupons: Coupon[];
  currency: 'GHS' | 'USD';
  bulkInquiries?: BulkInquiry[];
  blogs?: BlogPost[];
  onUpdateStock: (productId: string, newStock: number) => Promise<Product>;
  onUpdateRepair: (repairId: string, status: any, notes: string, quoteGHS: number) => Promise<RepairRequest>;
  onUpdateTradeIn: (tradeInId: string, status: any, notes: string, finalOfferGHS: number) => Promise<TradeInRequest>;
  onUpdateOrder: (orderId: string, status: any) => Promise<Order>;
  onCreateCoupon: (couponData: Coupon) => Promise<Coupon>;
  onUpdateBulkInquiry?: (inquiryId: string, status: string) => Promise<BulkInquiry>;
  onCreateProduct: (productData: Product) => Promise<Product>;
  onEditProduct: (productId: string, productData: Partial<Product>) => Promise<Product>;
  onDeleteProduct: (productId: string) => Promise<any>;
  onCreateBlog?: (blogData: any) => Promise<any>;
  onDeleteBlog?: (blogId: string) => Promise<any>;
  onClose: () => void;
}

export default function AdminPanel({
  products, repairs, tradeins, orders, coupons, currency, bulkInquiries, blogs = [],
  onUpdateStock, onUpdateRepair, onUpdateTradeIn, onUpdateOrder, onCreateCoupon, onUpdateBulkInquiry,
  onCreateProduct, onEditProduct, onDeleteProduct, onCreateBlog, onDeleteBlog,
  onClose
}: AdminPanelProps) {
  // Shell configurations
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isProductsMenuExpanded, setIsProductsMenuExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAdminDark, setIsAdminDark] = useState(true);
  const [liveClock, setLiveClock] = useState('');

  // Staff login simulation
  const [staffRole, setStaffRole] = useState<'owner' | 'technician' | 'accountant'>('owner');

  // AI Assistant terminal states
  const [aiTerminalOpen, setAiTerminalOpen] = useState(false);
  const [aiCommandInput, setAiCommandInput] = useState('');
  const [aiTerminalLogs, setAiTerminalLogs] = useState<Array<{ sender: 'user' | 'assistant'; text: string; action?: { label: string; trigger: () => void } }>>([
    { sender: 'assistant', text: 'Hello! I am your executive business assistant. Type a natural language command (e.g. "write a blog about battery health", "show low stock items", "create Black Friday coupon") to automate operations.' }
  ]);

  useEffect(() => {
    // Renders real-time UTC ticks
    const updateTime = () => {
      const d = new Date();
      setLiveClock(d.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // AI Natural Language Command Interpreter
  const handleExecuteAiCommand = () => {
    if (!aiCommandInput.trim()) return;
    const cmd = aiCommandInput.toLowerCase().trim();
    const userMsg = aiCommandInput;
    setAiCommandInput('');

    setAiTerminalLogs(prev => [...prev, { sender: 'user', text: userMsg }]);

    setTimeout(() => {
      // 1. "Show low stock" command
      if (cmd.includes('low stock') || cmd.includes('depleted') || cmd.includes('inventory')) {
        setActiveTab('products-inventory');
        setAiTerminalLogs(prev => [
          ...prev, 
          { sender: 'assistant', text: 'Command Executed: I have switched your navigation window directly to the **Operations & Inventory Forecasting Desk** so you can audit critical stock alert run-rates.' }
        ]);
      }
      // 2. "Write blog post" command
      else if (cmd.includes('blog') || cmd.includes('write') || cmd.includes('article') || cmd.includes('editorial')) {
        setActiveTab('blog');
        setAiTerminalLogs(prev => [
          ...prev,
          { sender: 'assistant', text: 'AI Copywriter Engaged: I have opened your **CMS Editorial Studio** and drafted a outline blueprint. Ready for publishing!' }
        ]);
      }
      // 3. "Create coupon" command
      else if (cmd.includes('coupon') || cmd.includes('promo') || cmd.includes('discount')) {
        setActiveTab('marketing');
        setAiTerminalLogs(prev => [
          ...prev,
          { sender: 'assistant', text: 'AI Configurator Engaged: I have opened the **Finances Promotion Desk** so you can instantly deploy customized percentage off vouchers.' }
        ]);
      }
      // 4. "Increase Samsung price" command (Bulk modifier simulation)
      else if (cmd.includes('samsung') && (cmd.includes('price') || cmd.includes('increase') || cmd.includes('raise'))) {
        setActiveTab('products-brands');
        setAiTerminalLogs(prev => [
          ...prev,
          { 
            sender: 'assistant', 
            text: 'I have detected your request to perform bulk price modifications on Samsung catalog products. I have loaded the adjustment multipliers in your Products Studio. Would you like to execute a 10% catalog raise?'
          }
        ]);
      }
      // 5. Default conversational response
      else {
        setAiTerminalLogs(prev => [
          ...prev,
          { sender: 'assistant', text: 'I have parsed your request, but did not match a direct system macro trigger. Try typing: "show low stock items" or "create promo coupon".' }
        ]);
      }
    }, 800);
  };

  // Callback wrapper for product catalog adjustments
  const handleAddNewProductToDatabase = (newP: Product) => {
    products.unshift(newP);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto text-gray-900 ${isAdminDark ? 'dark' : ''}`}>
      <div 
        className={`relative rounded-2xl bg-white dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-800 shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
          isFullscreen 
            ? 'w-[98vw] h-[95vh]' 
            : 'w-full max-w-6xl h-[85vh]'
        }`}
      >
        {/* UPPER WINDOW OPERATING MENU */}
        <div className="bg-gray-50 dark:bg-[#121212] border-b border-gray-150 dark:border-gray-800 px-5 py-3.5 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-amber-500 rounded-lg text-black">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-xs font-black tracking-wider uppercase font-mono text-gray-950 dark:text-white flex items-center gap-2">
                <span>Immortal Enterprise OS</span>
                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold font-mono tracking-normal">V2.4</span>
              </h2>
              <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5">
                <Clock size={11} />
                <span>{liveClock}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick staff picker */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-gray-400">STAFF:</span>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value as any)}
                className="bg-white dark:bg-black/25 border border-gray-150 dark:border-gray-800 text-[10px] font-bold px-2 py-1 rounded"
              >
                <option value="owner">Benjamin Danso (CEO)</option>
                <option value="technician">Isaac (Chief Tech)</option>
                <option value="accountant">Sandra A. (Finances)</option>
              </select>
            </div>

            {/* Dark/Light toggles */}
            <button
              onClick={() => setIsAdminDark(!isAdminDark)}
              className="p-1.5 bg-white dark:bg-black/25 border border-gray-150 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-lg text-gray-400 transition"
            >
              {isAdminDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 bg-white dark:bg-black/25 border border-gray-150 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-lg text-gray-400 transition"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            {/* Close modal */}
            <button
              onClick={onClose}
              className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-black rounded-lg transition"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* CORE WORKSPACE SPLIT SHELL */}
        <div className="flex-1 flex overflow-hidden">
          {/* NAVIGATION SIDEBAR */}
          <div className="w-56 bg-gray-50/50 dark:bg-[#121212]/50 border-r border-gray-150 dark:border-gray-800 flex flex-col justify-between p-4 select-none">
            <div className="space-y-4 overflow-y-auto pr-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 font-mono">BUSINESS WORKFLOWS</span>
              <div className="space-y-1.5">
                {/* 1. Dashboard */}
                {(() => {
                  const isActive = activeTab === 'dashboard';
                  return (
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                        isActive 
                          ? 'bg-amber-500 text-black shadow-sm font-bold' 
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Monitor size={14} className={isActive ? 'text-black' : 'text-gray-400'} />
                        <span>Dashboard</span>
                      </div>
                      {isActive && <ChevronRight size={12} />}
                    </button>
                  );
                })()}

                {/* 2. Products (Parent) */}
                {(() => {
                  const isLocked = staffRole === 'accountant';
                  const hasActiveChild = activeTab.startsWith('products-');
                  
                  return (
                    <div className="space-y-1">
                      <button
                        disabled={isLocked}
                        onClick={() => {
                          setIsProductsMenuExpanded(!isProductsMenuExpanded);
                          if (!hasActiveChild) {
                            setActiveTab('products-all');
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                          isLocked 
                            ? 'opacity-40 cursor-not-allowed'
                            : hasActiveChild && !isProductsMenuExpanded
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25 font-bold'
                              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Sparkles size={14} />
                          <span>Products</span>
                        </div>
                        {!isLocked && (
                          <div className="flex items-center gap-1">
                            {isProductsMenuExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </div>
                        )}
                      </button>

                      {/* Products Sub-items */}
                      {isProductsMenuExpanded && !isLocked && (
                        <div className="pl-4 ml-2 border-l border-gray-150 dark:border-gray-800 space-y-1">
                          {[
                            { id: 'products-add', label: 'Add Product', icon: Plus },
                            { id: 'products-all', label: 'All Products', icon: Smartphone },
                            { id: 'products-categories', label: 'Categories', icon: Filter },
                            { id: 'products-brands', label: 'Brands', icon: Sliders },
                            { id: 'products-inventory', label: 'Inventory', icon: Clock },
                            { id: 'products-import', label: 'Import Products', icon: Upload }
                          ].map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = activeTab === subItem.id;
                            return (
                              <button
                                key={subItem.id}
                                onClick={() => setActiveTab(subItem.id)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium tracking-tight transition-all ${
                                  isSubActive
                                    ? 'bg-amber-500 text-black font-bold'
                                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <SubIcon size={12} />
                                  <span>{subItem.label}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* AI Product Hub Button */}
                {(() => {
                  const isActive = activeTab === 'ai-product-hub';
                  return (
                    <button
                      onClick={() => setActiveTab('ai-product-hub')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                        isActive 
                          ? 'bg-amber-500 text-black shadow-sm font-bold' 
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Cpu size={14} className={isActive ? 'text-black' : 'text-gray-400'} />
                        <span className="flex items-center gap-1.5">
                          <span>AI Product Hub</span>
                          <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1 py-0.5 rounded font-mono font-bold">AI</span>
                        </span>
                      </div>
                      {isActive && <ChevronRight size={12} />}
                    </button>
                  );
                })()}

                {/* 3. Orders */}
                {(() => {
                  const isActive = activeTab === 'orders';
                  return (
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                        isActive 
                          ? 'bg-amber-500 text-black shadow-sm font-bold' 
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ClipboardList size={14} />
                        <span>Orders</span>
                      </div>
                      {isActive && <ChevronRight size={12} />}
                    </button>
                  );
                })()}

                {/* 4. Customers */}
                {(() => {
                  const isActive = activeTab === 'customers';
                  return (
                    <button
                      onClick={() => setActiveTab('customers')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                        isActive 
                          ? 'bg-amber-500 text-black shadow-sm font-bold' 
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Users size={14} />
                        <span>Customers</span>
                      </div>
                      {isActive && <ChevronRight size={12} />}
                    </button>
                  );
                })()}

                {/* 5. Repairs */}
                {(() => {
                  const isActive = activeTab === 'repairs';
                  return (
                    <button
                      onClick={() => setActiveTab('repairs')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                        isActive 
                          ? 'bg-amber-500 text-black shadow-sm font-bold' 
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Hammer size={14} />
                        <span>Repairs</span>
                      </div>
                      {isActive && <ChevronRight size={12} />}
                    </button>
                  );
                })()}

                {/* 6. Blog */}
                {(() => {
                  const isActive = activeTab === 'blog';
                  const isLocked = staffRole === 'accountant';
                  return (
                    <button
                      disabled={isLocked}
                      onClick={() => setActiveTab('blog')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                        isLocked 
                          ? 'opacity-40 cursor-not-allowed'
                          : isActive 
                            ? 'bg-amber-500 text-black shadow-sm font-bold' 
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText size={14} />
                        <span>Blog</span>
                      </div>
                      {isActive && !isLocked && <ChevronRight size={12} />}
                    </button>
                  );
                })()}

                {/* 7. Reports */}
                {(() => {
                  const isActive = activeTab === 'reports';
                  const isLocked = staffRole === 'technician';
                  return (
                    <button
                      disabled={isLocked}
                      onClick={() => setActiveTab('reports')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                        isLocked 
                          ? 'opacity-40 cursor-not-allowed'
                          : isActive 
                            ? 'bg-amber-500 text-black shadow-sm font-bold' 
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Bot size={14} />
                        <span>Reports</span>
                      </div>
                      {isActive && !isLocked && <ChevronRight size={12} />}
                    </button>
                  );
                })()}

                {/* 8. Marketing */}
                {(() => {
                  const isActive = activeTab === 'marketing';
                  const isLocked = staffRole === 'technician';
                  return (
                    <button
                      disabled={isLocked}
                      onClick={() => setActiveTab('marketing')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                        isLocked 
                          ? 'opacity-40 cursor-not-allowed'
                          : isActive 
                            ? 'bg-amber-500 text-black shadow-sm font-bold' 
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck size={14} />
                        <span>Marketing</span>
                      </div>
                      {isActive && !isLocked && <ChevronRight size={12} />}
                    </button>
                  );
                })()}

                {/* 9. Settings */}
                {(() => {
                  const isActive = activeTab === 'settings';
                  const isLocked = staffRole === 'technician';
                  return (
                    <button
                      disabled={isLocked}
                      onClick={() => setActiveTab('settings')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                        isLocked 
                          ? 'opacity-40 cursor-not-allowed'
                          : isActive 
                            ? 'bg-amber-500 text-black shadow-sm font-bold' 
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Settings size={14} />
                        <span>Settings</span>
                      </div>
                      {isActive && !isLocked && <ChevronRight size={12} />}
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Quick help banner */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
              <span className="text-[9px] font-mono font-black text-amber-500 block uppercase">[SECURITY PASS]</span>
              <p className="text-[10px] text-gray-400 leading-snug">Current user role signature holds permission tokens for active modules.</p>
            </div>
          </div>

          {/* ACTIVE CONTENT SHEET */}
          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-[#0B0B0B] text-gray-900 dark:text-gray-100 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {activeTab === 'dashboard' && (
                  <CommandCenter 
                    orders={orders} 
                    repairs={repairs} 
                    tradeins={tradeins} 
                    currency={currency} 
                  />
                )}
                {activeTab === 'ai-product-hub' && (
                  <AIProductHub 
                    products={products} 
                    currency={currency} 
                    onAddProduct={async (p) => {
                      await onCreateProduct(p);
                    }}
                    onUpdateStock={onUpdateStock}
                  />
                )}
                {activeTab === 'reports' && (
                  <AnalyticsDesk 
                    currency={currency} 
                  />
                )}
                {activeTab.startsWith('products-') && activeTab !== 'products-inventory' && (
                  <ProductStudio 
                    products={products} 
                    currency={currency} 
                    onUpdateStock={onUpdateStock} 
                    onAddProduct={async (p) => {
                      await onCreateProduct(p);
                    }}
                    onEditProduct={onEditProduct}
                    onDeleteProduct={onDeleteProduct}
                    initialIsAddingProduct={activeTab === 'products-add'}
                    initialIsImporterOpen={activeTab === 'products-import'}
                    initialSelectedCategory={activeTab === 'products-categories' ? 'Smartphones' : 'All'}
                    initialShowBulkActions={activeTab === 'products-brands'}
                  />
                )}
                {activeTab === 'blog' && (
                  <CmsStudio 
                    blogs={blogs}
                    onAddBlog={onCreateBlog}
                    onDeleteBlog={onDeleteBlog}
                  />
                )}
                {activeTab === 'products-inventory' && (
                  <OperationalHub 
                    orders={orders} 
                    repairs={repairs} 
                    tradeins={tradeins} 
                    products={products} 
                    currency={currency} 
                    onUpdateOrder={onUpdateOrder}
                    onUpdateRepair={onUpdateRepair}
                    initialTab="inventory"
                  />
                )}
                {activeTab === 'orders' && (
                  <OperationalHub 
                    orders={orders} 
                    repairs={repairs} 
                    tradeins={tradeins} 
                    products={products} 
                    currency={currency} 
                    onUpdateOrder={onUpdateOrder}
                    onUpdateRepair={onUpdateRepair}
                    initialTab="sales"
                  />
                )}
                {activeTab === 'customers' && (
                  <OperationalHub 
                    orders={orders} 
                    repairs={repairs} 
                    tradeins={tradeins} 
                    products={products} 
                    currency={currency} 
                    onUpdateOrder={onUpdateOrder}
                    onUpdateRepair={onUpdateRepair}
                    initialTab="crm"
                  />
                )}
                {activeTab === 'repairs' && (
                  <OperationalHub 
                    orders={orders} 
                    repairs={repairs} 
                    tradeins={tradeins} 
                    products={products} 
                    currency={currency} 
                    onUpdateOrder={onUpdateOrder}
                    onUpdateRepair={onUpdateRepair}
                    initialTab="repairs"
                  />
                )}
                {activeTab === 'marketing' && (
                  <FinanceMarketingAppDesk 
                    coupons={coupons} 
                    currency={currency} 
                    onCreateCoupon={onCreateCoupon} 
                  />
                )}
                {activeTab === 'settings' && (
                  <SettingsDesk 
                    currency={currency}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* FLOATING NATURAL LANGUAGE COMMAND ASSISTANT TERMINAL */}
        <div className="border-t border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121212]/50 p-3 select-none">
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
              <span className="flex items-center gap-1">
                <Bot size={11} className="text-amber-500 animate-bounce" />
                <span>AI COMMAND TERMINAL</span>
              </span>
              <button 
                onClick={() => setAiTerminalOpen(!aiTerminalOpen)}
                className="text-[9px] font-bold text-[#0066FF] hover:underline"
              >
                {aiTerminalOpen ? 'Hide Assistant Dialogue' : 'Show Assistant Dialogue'}
              </button>
            </div>

            {/* Expended dialogue logs */}
            {aiTerminalOpen && (
              <div className="p-3 bg-white dark:bg-black/35 border border-gray-150 dark:border-gray-800 rounded-xl space-y-2 max-h-32 overflow-y-auto text-xs font-sans">
                {aiTerminalLogs.map((log, idx) => (
                  <div key={idx} className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-2 rounded-lg max-w-lg leading-normal ${
                      log.sender === 'user' 
                        ? 'bg-[#0066FF] text-white' 
                        : 'bg-gray-100 dark:bg-black/25 text-gray-700 dark:text-gray-300'
                    }`}>
                      {log.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Input prompt line */}
            <div className="flex gap-2.5 items-center">
              <input
                type="text"
                placeholder="Ask AI executive or run natural language command (e.g. 'show low stock items', 'create coupon')..."
                value={aiCommandInput}
                onChange={(e) => setAiCommandInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteAiCommand()}
                className="flex-1 p-2 bg-white dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-mono placeholder:text-gray-500"
              />
              <button
                onClick={handleExecuteAiCommand}
                className="p-2 bg-amber-500 hover:bg-amber-600 text-black rounded-xl transition"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
