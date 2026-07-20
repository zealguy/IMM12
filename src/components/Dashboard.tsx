/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, ClipboardList, Hammer, RefreshCw, MapPin, CheckCircle2, Receipt, Phone, Mail, FileText, Calendar, Package, Truck, Clock, AlertTriangle, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { Order, RepairRequest, TradeInRequest } from '../types';
import TrackOrderModal from './TrackOrderModal';

interface DashboardProps {
  orders: Order[];
  repairs: RepairRequest[];
  tradeins: TradeInRequest[];
  currency: 'GHS' | 'USD';
  onReorder: (items: any[]) => { addedCount: number; outOfStockCount: number };
  onClose: () => void;
}

export default function Dashboard({ orders, repairs, tradeins, currency, onReorder, onClose }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'repairs' | 'tradeins' | 'profile'>('orders');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedTrackOrder, setSelectedTrackOrder] = useState<Order | null>(null);

  // Reorder notification state
  const [reorderNotification, setReorderNotification] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
    details?: string;
  } | null>(null);

  const handleReorderClick = (order: Order) => {
    const res = onReorder(order.items);
    if (res.addedCount > 0) {
      if (res.outOfStockCount > 0) {
        setReorderNotification({
          type: 'warning',
          message: `Added ${res.addedCount} item(s) to your shopping cart!`,
          details: `${res.outOfStockCount} item(s) from this order were out of stock and skipped.`
        });
      } else {
        setReorderNotification({
          type: 'success',
          message: `Success! Added all ${res.addedCount} item(s) to your shopping cart.`,
          details: 'Your cart drawer has been opened for instant checkout.'
        });
      }
    } else {
      setReorderNotification({
        type: 'error',
        message: `Failed to reorder items from Order #${order.trackingNumber}.`,
        details: 'All items from this past transaction are currently out of stock. We apologize for the inconvenience.'
      });
    }

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setReorderNotification(null);
    }, 5000);
  };

  // Simulated Customer Profile
  const [profileName, setProfileName] = useState('Alhassan Ibrahim');
  const [profilePhone, setProfilePhone] = useState('0244192834');
  const [profileEmail, setProfileEmail] = useState('alhassan@gmail.com');
  const [profileAddress, setProfileAddress] = useState('Circle Ebony, Accra, Ghana');
  const [profileCity, setProfileCity] = useState('Accra');

  const [isSaved, setIsSaved] = useState(false);

  // Filter records specifically for our logged-in customer name
  const customerOrders = orders.filter(
    o => o.customerName.toLowerCase() === profileName.toLowerCase() || o.customerPhone === profilePhone
  );

  const customerRepairs = repairs.filter(
    r => r.customerName.toLowerCase() === profileName.toLowerCase() || r.customerPhone === profilePhone
  );

  const customerTradeins = tradeins.filter(
    t => t.customerName.toLowerCase() === profileName.toLowerCase() || t.customerPhone === profilePhone
  );

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto text-gray-900 dark:text-white">
      <div 
        className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-[#0B0B0B] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-[#121212] dark:to-[#121212]/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#0066FF] text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Accra Customer Account</h2>
              <p className="text-xs text-gray-400 font-mono">Logged in as {profileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="dashboard-close-btn"
            className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold"
          >
            Close Dashboard
          </button>
        </div>

        {/* Inner layout with sidebar and main content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-[#121212]/20 flex md:flex-col gap-2 overflow-x-auto shrink-0">
            <button
              onClick={() => { setActiveTab('orders'); setSelectedInvoiceOrder(null); }}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                activeTab === 'orders'
                  ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              id="cust-dash-orders"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Purchase Orders ({customerOrders.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('repairs'); setSelectedInvoiceOrder(null); }}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                activeTab === 'repairs'
                  ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              id="cust-dash-repairs"
            >
              <Hammer className="w-4 h-4" />
              <span>Active Repairs ({customerRepairs.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('tradeins'); setSelectedInvoiceOrder(null); }}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                activeTab === 'tradeins'
                  ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              id="cust-dash-tradeins"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Swap Trade-Ins ({customerTradeins.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('profile'); setSelectedInvoiceOrder(null); }}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                activeTab === 'profile'
                  ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              id="cust-dash-profile"
            >
              <User className="w-4 h-4" />
              <span>Profile Addresses</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* INVOICE SIMULATOR SCREEN */}
            {selectedInvoiceOrder ? (
              <div className="space-y-6" id="invoice-simulation-view">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <h3 className="text-sm font-extrabold flex items-center space-x-1">
                    <Receipt className="w-4 h-4 text-[#0066FF]" />
                    <span>IMMORTAL TAX INVOICE</span>
                  </h3>
                  <button
                    onClick={() => setSelectedInvoiceOrder(null)}
                    className="text-[10px] text-gray-400 font-mono hover:underline uppercase"
                  >
                    ← Back to List
                  </button>
                </div>

                <div className="p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] rounded-2xl space-y-6 text-xs text-gray-700 dark:text-gray-300 relative">
                  {/* Watermark design */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-center select-none">
                    <span className="text-6xl font-extrabold tracking-widest text-[#0066FF]">IMMORTAL</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-bold text-gray-950 dark:text-white block">IMMORTAL ELECTRONICS LTD.</span>
                      <span className="block mt-1">Circle Ebony</span>
                      <span className="block">Accra, Ghana</span>
                      <span className="block font-medium">CEO: Benjamin Danso</span>
                      <span className="block text-[10px] text-gray-400">Phone: +233 54 371 4108 / +233 59 872 9101</span>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[10px] uppercase font-mono text-gray-400 block">TAX TRANSACTION STATEMENT</span>
                      <span className="block font-bold text-gray-950 dark:text-white">INVOICE #{selectedInvoiceOrder.trackingNumber}</span>
                      <span className="block">Date: {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()}</span>
                      <span className="block">Status: <span className="text-green-500 font-bold uppercase">{selectedInvoiceOrder.paymentStatus}</span></span>
                      <span className="block">Gateway: {selectedInvoiceOrder.paymentProvider || 'Mobile Money'}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 pt-4 grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white uppercase font-mono block text-[10px]">BILLED TO:</span>
                      <span className="block font-medium text-gray-800 dark:text-gray-200 mt-1">{selectedInvoiceOrder.customerName}</span>
                      <span className="block">{selectedInvoiceOrder.customerPhone}</span>
                      <span className="block">{selectedInvoiceOrder.customerEmail}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 dark:text-white uppercase font-mono block text-[10px]">SHIPPING DESTINATION:</span>
                      <span className="block font-medium text-gray-800 dark:text-gray-200 mt-1">{selectedInvoiceOrder.address}</span>
                      <span className="block">{selectedInvoiceOrder.city}, Ghana</span>
                      <span className="block">Option: {selectedInvoiceOrder.deliveryOption}</span>
                    </div>
                  </div>

                  {/* Itemized pricing table */}
                  <table className="w-full text-left mt-6 border-t border-gray-100 dark:border-gray-800">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800 text-[10px] uppercase font-mono text-gray-400">
                        <th className="py-2">Item Details</th>
                        <th className="py-2 text-center">Qty</th>
                        <th className="py-2 text-right">Unit Price</th>
                        <th className="py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoiceOrder.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-900/40">
                          <td className="py-3 font-semibold text-gray-900 dark:text-white">
                            {item.product.name} {item.selectedColor && `(${item.selectedColor})`}
                          </td>
                          <td className="py-3 text-center">{item.quantity}</td>
                          <td className="py-3 text-right">
                            {currency === 'GHS' ? `₵ ${item.product.priceGHS.toLocaleString()}` : `$ ${item.product.priceUSD.toLocaleString()}`}
                          </td>
                          <td className="py-3 text-right font-semibold">
                            {currency === 'GHS' 
                              ? `₵ ${(item.product.priceGHS * item.quantity).toLocaleString()}` 
                              : `$ ${(item.product.priceUSD * item.quantity).toLocaleString()}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end pt-4">
                    <div className="w-64 space-y-1.5 text-right border-t border-gray-100 dark:border-gray-800 pt-3">
                      <div className="flex justify-between text-[11px]">
                        <span>Subtotal:</span>
                        <span>{currency === 'GHS' ? `₵ ${(selectedInvoiceOrder.totalGHS - selectedInvoiceOrder.deliveryCostGHS).toLocaleString()}` : `$ ${(selectedInvoiceOrder.totalUSD - Math.round(selectedInvoiceOrder.deliveryCostGHS / 14.5)).toLocaleString()}`}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Accra Local Delivery:</span>
                        <span>{currency === 'GHS' ? `₵ ${selectedInvoiceOrder.deliveryCostGHS}` : `$ ${Math.round(selectedInvoiceOrder.deliveryCostGHS / 14.5)}`}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-[#0066FF] border-t border-gray-100 dark:border-gray-900 pt-2">
                        <span>Grand Total:</span>
                        <span>{currency === 'GHS' ? `₵ ${selectedInvoiceOrder.totalGHS.toLocaleString()}` : `$ ${selectedInvoiceOrder.totalUSD.toLocaleString()}`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-gray-400 font-mono border-t border-gray-100 dark:border-gray-900 pt-4">
                    Thank you for shopping at Immortal Electronics. Under Ghanaian Consumer Council care.
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-2.5 bg-gray-150 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition-all"
                  >
                    🖨️ Print Tax Invoice
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* PURCHASE ORDERS TAB */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold">Your Purchase Orders</h3>

                    {reorderNotification && (
                      <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-fadeIn ${
                        reorderNotification.type === 'success' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                          : reorderNotification.type === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                      }`}>
                        <ShoppingBag className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold block">{reorderNotification.message}</span>
                          {reorderNotification.details && (
                            <p className="text-[10.5px] opacity-90 leading-normal">{reorderNotification.details}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {customerOrders.length > 0 ? (
                      <div className="space-y-4">
                        {customerOrders.map((order) => {
                          const getStatusStepIndex = (status: string): number => {
                            const s = status.toLowerCase();
                            if (s === 'pending') return 0;
                            if (s === 'approved' || s === 'packed' || s === 'processing') return 1;
                            if (s === 'shipped' || s === 'out for delivery') return 2;
                            if (s === 'delivered') return 3;
                            return 0; // default/fallback
                          };

                          const currentStepIndex = getStatusStepIndex(order.status);
                          const isCancelled = order.status.toLowerCase() === 'cancelled';

                          return (
                            <div 
                              key={order.id} 
                              className="p-5 border border-gray-150 dark:border-gray-800/80 bg-white dark:bg-[#121212] rounded-2xl space-y-5 hover:border-[#0066FF]/40 transition-all duration-300 shadow-sm"
                            >
                              {/* Header row */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">ORDER TRACKING ID</span>
                                  <span className="font-mono text-sm font-extrabold text-gray-900 dark:text-white block">{order.trackingNumber}</span>
                                  <span className="text-[11px] text-gray-400 dark:text-gray-500 block">
                                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">TOTAL VALUE</span>
                                    <span className="font-extrabold text-[#0066FF] text-sm block">
                                      {currency === 'GHS' ? `₵ ${order.totalGHS.toLocaleString()}` : `$ ${order.totalUSD.toLocaleString()}`}
                                    </span>
                                  </div>

                                  <div className="space-y-1">
                                    <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">STATUS</span>
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                      isCancelled
                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                        : order.status.toLowerCase() === 'delivered'
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                        : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                    }`}>
                                      {order.status}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => handleReorderClick(order)}
                                    id={`reorder-btn-${order.id}`}
                                    title="Quick Reorder Past Items"
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] flex items-center gap-1.5 shrink-0 shadow-md shadow-emerald-600/10 hover:scale-105 active:scale-95 transition-all self-end sm:self-auto"
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>Quick Reorder</span>
                                  </button>

                                  <button
                                    onClick={() => setSelectedTrackOrder(order)}
                                    id={`track-order-btn-${order.id}`}
                                    title="Track Order Shipment"
                                    className="px-3 py-1.5 rounded-xl bg-[#0066FF] hover:bg-[#0055DD] text-white font-extrabold text-[11px] flex items-center gap-1.5 shrink-0 shadow-md shadow-[#0066FF]/10 hover:scale-105 active:scale-95 transition-all self-end sm:self-auto"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>Track Order</span>
                                  </button>

                                  <button
                                    onClick={() => setSelectedInvoiceOrder(order)}
                                    id={`view-invoice-${order.id}`}
                                    title="View Receipt Invoice"
                                    className="p-2 rounded-xl border border-gray-250 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors flex items-center justify-center bg-gray-50/50 dark:bg-black/10 shrink-0 self-end sm:self-auto"
                                  >
                                    <Receipt className="w-4 h-4 text-[#0066FF]" />
                                  </button>
                                </div>
                              </div>

                              {/* Divider line */}
                              <div className="border-t border-gray-100 dark:border-gray-800/60" />

                              {/* Order Items List */}
                              <div className="flex flex-wrap gap-2.5 items-center">
                                {order.items.map((item, itemIdx) => (
                                  <div 
                                    key={itemIdx}
                                    className="flex items-center space-x-2 bg-gray-50/60 dark:bg-zinc-900/40 border border-gray-100 dark:border-zinc-800/60 p-1.5 rounded-xl text-[11px]"
                                  >
                                    <img 
                                      src={item.product.image} 
                                      alt={item.product.name} 
                                      className="w-7 h-7 object-contain bg-white dark:bg-zinc-950 rounded-lg p-0.5"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=80&q=80';
                                      }}
                                    />
                                    <div>
                                      <span className="font-bold text-gray-800 dark:text-gray-200 block truncate max-w-[130px]" title={item.product.name}>
                                        {item.product.name}
                                      </span>
                                      <span className="text-[9px] text-gray-400 block font-mono">
                                        Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Real-time visual step-by-step progress bar */}
                              {isCancelled ? (
                                <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl flex items-center space-x-2 text-xs text-red-500">
                                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                  <div>
                                    <span className="font-bold">Transaction Cancelled</span>
                                    <p className="text-[10px] text-red-400">This dispatch route has been closed. Please contact Accra Customer Care for assistance.</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="pt-2 pb-1">
                                  <div className="relative">
                                    {/* Progress Line Track */}
                                    <div className="absolute top-[18px] left-[6%] right-[6%] h-[3px] bg-gray-100 dark:bg-gray-800 rounded-full z-0">
                                      <motion.div 
                                        className="h-full bg-gradient-to-r from-[#0066FF] to-blue-400 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(currentStepIndex / 3) * 100}%` }}
                                        transition={{ 
                                          type: "spring", 
                                          stiffness: 80, 
                                          damping: 15,
                                          delay: 0.1
                                        }}
                                      />
                                    </div>

                                    {/* Steps layout */}
                                    <div className="relative flex justify-between items-center z-10">
                                      {[
                                        { label: 'Pending', desc: 'Order Placed', icon: Clock },
                                        { label: 'Processing', desc: 'Assembling Items', icon: Package },
                                        { label: 'Dispatched', desc: 'Courier en Route', icon: Truck },
                                        { label: 'Delivered', desc: 'Received & Signed', icon: CheckCircle2 }
                                      ].map((step, sIdx) => {
                                        const StepIcon = step.icon;
                                        const isCompleted = sIdx < currentStepIndex;
                                        const isActive = sIdx === currentStepIndex;

                                        return (
                                          <div key={sIdx} className="flex flex-col items-center text-center w-1/4 relative">
                                            {/* Icon Indicator Circle Wrapper */}
                                            <div className="relative w-9 h-9 flex items-center justify-center">
                                              {/* Smoothly animated layout active ring */}
                                              {isActive && (
                                                <motion.div 
                                                  layoutId={`activeStepHalo-${order.id}`}
                                                  className="absolute -inset-1.5 rounded-full bg-blue-500/10 dark:bg-blue-400/10 border-2 border-[#0066FF] z-0"
                                                  initial={{ scale: 0.8, opacity: 0 }}
                                                  animate={{ scale: 1, opacity: 1 }}
                                                  exit={{ scale: 0.8, opacity: 0 }}
                                                  transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                                                />
                                              )}

                                              <div 
                                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 z-10 relative ${
                                                  isCompleted 
                                                    ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-lg shadow-[#0066FF]/20' 
                                                    : isActive 
                                                    ? 'bg-white dark:bg-[#121212] border-transparent text-[#0066FF] scale-105' 
                                                    : 'bg-white dark:bg-[#121212] border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500'
                                                }`}
                                              >
                                                <StepIcon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                              </div>
                                            </div>

                                            {/* Step labels */}
                                            <div className="mt-2.5 space-y-0.5 px-1 relative z-10">
                                              <span className={`text-[11px] font-extrabold tracking-tight block transition-colors duration-300 ${
                                                isActive 
                                                  ? 'text-[#0066FF]' 
                                                  : isCompleted 
                                                  ? 'text-gray-900 dark:text-white' 
                                                  : 'text-gray-400 dark:text-gray-500'
                                              }`}>
                                                {step.label}
                                              </span>
                                              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium block leading-none max-w-[85px] mx-auto truncate sm:overflow-visible sm:whitespace-normal">
                                                {step.desc}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                        <ClipboardList className="w-8 h-8 mx-auto text-gray-400 animate-bounce" />
                        <p className="text-xs text-gray-400 mt-2 font-mono">No purchase orders under profile "{profileName}".</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ACTIVE REPAIRS TAB */}
                {activeTab === 'repairs' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold">Active Repair Tickets</h3>
                    {customerRepairs.length > 0 ? (
                      <div className="space-y-3">
                        {customerRepairs.map((repair) => (
                          <div 
                            key={repair.id} 
                            className="p-4 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] rounded-xl flex items-center justify-between text-xs hover:border-[#0066FF]/40 transition-colors"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-gray-400 block">REPAIR CODE</span>
                              <span className="font-bold text-gray-900 dark:text-white font-mono block">{repair.trackingNumber}</span>
                              <span className="text-gray-500 block font-medium">{repair.brand} {repair.model} ({repair.faultCategory})</span>
                            </div>

                            <div className="text-center">
                              <span className="text-[10px] font-mono text-gray-400 block">SERVICE CHARGE</span>
                              <span className="font-bold text-[#0066FF] block">
                                {currency === 'GHS' ? `₵ ${repair.quotationGHS.toLocaleString()}` : `$ ${repair.quotationUSD.toLocaleString()}`}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] font-mono text-gray-400 block">STATUS</span>
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">{repair.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                        <Hammer className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-xs text-gray-400 mt-2 font-mono">No active repair tickets under profile "{profileName}".</p>
                      </div>
                    )}
                  </div>
                )}

                {/* SWAP TRADE-INS TAB */}
                {activeTab === 'tradeins' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold">Your Swap Appraisals</h3>
                    {customerTradeins.length > 0 ? (
                      <div className="space-y-3">
                        {customerTradeins.map((trade) => (
                          <div 
                            key={trade.id} 
                            className="p-4 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] rounded-xl flex items-center justify-between text-xs hover:border-[#0066FF]/40 transition-colors"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-gray-400 block">APPRAISAL TRANSACTION</span>
                              <span className="font-bold text-gray-900 dark:text-white font-mono block">{trade.trackingNumber}</span>
                              <span className="text-gray-500 block font-medium">{trade.brand} {trade.model} ({trade.condition})</span>
                            </div>

                            <div className="text-center">
                              <span className="text-[10px] font-mono text-gray-400 block">PRE-VALUATION</span>
                              <span className="font-bold text-[#0066FF] block">
                                {currency === 'GHS' ? `₵ ${trade.valuationEstimateGHS.toLocaleString()}` : `$ ${trade.valuationEstimateUSD.toLocaleString()}`}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] font-mono text-gray-400 block">STATUS</span>
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">{trade.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                        <RefreshCw className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-xs text-gray-400 mt-2 font-mono">No trade-in appraisal requests under profile "{profileName}".</p>
                      </div>
                    )}
                  </div>
                )}

                {/* PROFILE ADDRESSES TAB */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <h3 className="text-sm font-extrabold">Delivery Addresses & Profile Settings</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase font-mono">Contact Name</label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="mt-1 w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase font-mono">Ghanaian Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="mt-1 w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase font-mono">Email Address</label>
                        <input
                          type="email"
                          required
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="mt-1 w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase font-mono">Region / City</label>
                        <input
                          type="text"
                          required
                          value={profileCity}
                          onChange={(e) => setProfileCity(e.target.value)}
                          className="mt-1 w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase font-mono">Delivery Address (Street, House No, Area)</label>
                      <input
                        type="text"
                        required
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        className="mt-1 w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#0066FF] hover:bg-[#0055DD] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#0066FF]/20"
                      >
                        Save Profile Addresses
                      </button>

                      {isSaved && (
                        <span className="text-xs text-green-500 font-bold flex items-center animate-bounce">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Profile saved successfully!
                        </span>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Real-time Order Track Modal */}
      {selectedTrackOrder && (
        <TrackOrderModal
          order={selectedTrackOrder}
          currency={currency}
          onClose={() => setSelectedTrackOrder(null)}
        />
      )}
    </div>
  );
}
