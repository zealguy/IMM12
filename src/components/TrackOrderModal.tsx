/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, Truck, CheckCircle2, Clock, MapPin, Phone, Calendar, ShoppingBag, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { Order } from '../types';
import { handleImageError } from '../utils/imageFallback';

interface TrackOrderModalProps {
  order: Order;
  currency: 'GHS' | 'USD';
  onClose: () => void;
}

export default function TrackOrderModal({ order, currency, onClose }: TrackOrderModalProps) {
  // Map statuses: 'Pending' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled'
  // to our 3 core progressive status milestones: Pending, Dispatched, Delivered
  const status = order.status.toLowerCase();
  
  let currentStep = 0; // 0 = None, 1 = Pending, 2 = Dispatched, 3 = Delivered
  let statusColor = 'text-blue-500';
  let progressWidth = '0%';

  if (status === 'cancelled') {
    currentStep = -1; // Special canceled state
  } else if (status === 'pending' || status === 'processing') {
    currentStep = 1;
    progressWidth = '15%';
  } else if (status === 'shipped' || status === 'out for delivery') {
    currentStep = 2;
    progressWidth = '55%';
  } else if (status === 'delivered') {
    currentStep = 3;
    progressWidth = '100%';
  }

  // Calculate dynamic milestone timestamps based on order.createdAt
  const orderDate = new Date(order.createdAt);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Pending Milestone: Placed right away
  const placedDateStr = `${formatDate(orderDate)} at ${formatTime(orderDate)}`;
  
  // Dispatched Milestone
  const dispatchDate = new Date(orderDate);
  if (order.deliveryOption === 'Same Day' || order.deliveryOption === 'Expedited Motorcycle Courier') {
    dispatchDate.setHours(dispatchDate.getHours() + 2);
  } else if (order.deliveryOption === 'In-Store Pickup') {
    dispatchDate.setHours(dispatchDate.getHours() + 1);
  } else {
    // Standard Accra Dispatch or other
    dispatchDate.setDate(dispatchDate.getDate() + 1);
    dispatchDate.setHours(10, 30, 0);
  }
  const dispatchDateStr = `${formatDate(dispatchDate)} at ${formatTime(dispatchDate)}`;

  // Delivered/Collected Milestone
  const deliveryDate = new Date(orderDate);
  if (order.deliveryOption === 'Same Day') {
    deliveryDate.setHours(deliveryDate.getHours() + 6);
  } else if (order.deliveryOption === 'Expedited Motorcycle Courier') {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    deliveryDate.setHours(12, 0, 0);
  } else if (order.deliveryOption === 'In-Store Pickup') {
    deliveryDate.setHours(deliveryDate.getHours() + 2);
  } else {
    // Standard Accra Dispatch or other: +3 days
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    deliveryDate.setHours(15, 0, 0);
  }
  const deliveryDateStr = `${formatDate(deliveryDate)} at ${formatTime(deliveryDate)}`;

  // Est Delivery display text
  let estDeliveryDisplay = '';
  if (order.deliveryOption === 'Same Day') {
    estDeliveryDisplay = `Estimated Delivery: Today by ${formatTime(deliveryDate)}`;
  } else if (order.deliveryOption === 'Expedited Motorcycle Courier') {
    estDeliveryDisplay = `Estimated Delivery: Tomorrow by ${formatTime(deliveryDate)} (Expedited Cycle)`;
  } else if (order.deliveryOption === 'In-Store Pickup') {
    estDeliveryDisplay = `Estimated Collection: Ready for pick up today by ${formatTime(deliveryDate)}`;
  } else if (order.deliveryOption === 'Standard Accra Dispatch') {
    estDeliveryDisplay = `Estimated Delivery: ${formatDate(deliveryDate)} by ${formatTime(deliveryDate)} (Standard)`;
  } else {
    estDeliveryDisplay = `Estimated Collection: Ready for Pickup within 24 hours`;
  }

  if (status === 'delivered') {
    estDeliveryDisplay = order.deliveryOption === 'In-Store Pickup'
      ? `Collected on ${formatDate(deliveryDate)} at ${formatTime(deliveryDate)}`
      : `Delivered on ${formatDate(deliveryDate)} at ${formatTime(deliveryDate)}`;
  } else if (status === 'cancelled') {
    estDeliveryDisplay = `This order was cancelled`;
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-850 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner header with blue gradient */}
        <div className="p-6 bg-gradient-to-r from-[#0066FF] to-blue-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            id="track-modal-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-2 text-[10px] font-mono tracking-wider bg-white/15 px-2.5 py-1 rounded-full w-max uppercase mb-3">
            <Truck className="w-3.5 h-3.5 animate-bounce" />
            <span>Real-time Order Tracker</span>
          </div>
          
          <h2 className="text-xl font-black tracking-tight mb-1">
            Tracking Code: <span className="font-mono text-emerald-300">{order.trackingNumber}</span>
          </h2>
          <p className="text-xs text-blue-100 font-medium">
            {estDeliveryDisplay}
          </p>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* CANCELLATION NOTICE */}
          {status === 'cancelled' && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-start space-x-3 text-xs">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-sm block">Order Cancelled</span>
                <p className="mt-1 leading-relaxed">
                  This transaction was flagged or cancelled. Refund procedures will initiate automatically if payments were completed via Mobile Money or Card.
                </p>
              </div>
            </div>
          )}

          {/* PROGRESS BAR COMPONENT */}
          {status !== 'cancelled' && (
            <div className="p-5 border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/25 rounded-2xl space-y-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
                Milestone Status: <span className="text-[#0066FF]">{order.status}</span>
              </span>

              {/* Progress track */}
              <div className="relative pt-2 pb-1">
                {/* Background line */}
                <div className="absolute top-[18px] left-[10%] right-[10%] h-[4px] bg-gray-200 dark:bg-gray-800 rounded-full z-0">
                  {/* Dynamic fill line */}
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#0066FF] to-emerald-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: progressWidth }}
                    transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.2 }}
                  />
                </div>

                {/* Steps layout */}
                <div className="relative flex justify-between items-center z-10">
                  {[
                    { label: 'Pending', desc: 'Order Confirmed', icon: Clock, stepNum: 1 },
                    { label: 'Dispatched', desc: 'Out for Delivery', icon: Truck, stepNum: 2 },
                    { label: 'Delivered', desc: 'Signed & Received', icon: CheckCircle2, stepNum: 3 }
                  ].map((step, sIdx) => {
                    const StepIcon = step.icon;
                    const isCompleted = currentStep >= step.stepNum;
                    const isActive = currentStep === step.stepNum;

                    return (
                      <div key={sIdx} className="flex flex-col items-center text-center w-1/3">
                        <div className="relative w-9 h-9 flex items-center justify-center">
                          {isActive && (
                            <motion.div 
                              layoutId="activeStepHaloTracker"
                              className="absolute -inset-1.5 rounded-full bg-blue-500/15 dark:bg-blue-400/10 border border-[#0066FF] z-0"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
                            />
                          )}

                          <div 
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 z-10 relative ${
                              isCompleted 
                                ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-md shadow-[#0066FF]/20' 
                                : 'bg-white dark:bg-[#121212] border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            <StepIcon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                          </div>
                        </div>

                        <div className="mt-2.5 space-y-0.5">
                          <span className={`text-xs font-bold block ${
                            isActive ? 'text-[#0066FF]' : isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {step.label}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 block max-w-[100px] mx-auto leading-tight">
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

          {/* DETAILED TRACKING TIMELINE / MILESTONES */}
          {status !== 'cancelled' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider font-mono">
                Detailed Journey Milestones
              </h3>
              
              <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-4 pl-6 space-y-6">
                {/* Milestone 3: Delivered */}
                <div className={`relative ${currentStep >= 3 ? 'opacity-100' : 'opacity-40'}`}>
                  <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-[#0B0B0B] ${
                    currentStep >= 3 ? 'border-[#0066FF] bg-[#0066FF]' : 'border-gray-200 dark:border-gray-800'
                  }`} />
                  <div className="text-xs">
                    <span className="font-extrabold text-gray-900 dark:text-white block">Delivered & Completed</span>
                    <p className="text-gray-500 mt-1">Package successfully received and signed at client delivery address.</p>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono block mt-1">{deliveryDateStr}</span>
                  </div>
                </div>

                {/* Milestone 2: Dispatched */}
                <div className={`relative ${currentStep >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                  <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-[#0B0B0B] ${
                    currentStep >= 2 ? 'border-[#0066FF] bg-[#0066FF]' : 'border-gray-200 dark:border-gray-800'
                  }`} />
                  <div className="text-xs">
                    <span className="font-extrabold text-gray-900 dark:text-white block">Dispatched via Local Courier</span>
                    <p className="text-gray-500 mt-1">
                      Assigned to Accra logistics courier agent. Outbound transit to {order.address}, {order.city}.
                    </p>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono block mt-1">{dispatchDateStr}</span>
                  </div>
                </div>

                {/* Milestone 1: Placed */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-[#0066FF] bg-[#0066FF]" />
                  <div className="text-xs">
                    <span className="font-extrabold text-gray-900 dark:text-white block">Order Placed & Confirmed</span>
                    <p className="text-gray-500 mt-1">
                      Transaction verified. Invoice generated. Payment method: {order.paymentMethod} {order.paymentProvider ? `(${order.paymentProvider})` : ''}.
                    </p>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono block mt-1">{placedDateStr}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RECIPIENT & SHIPPING DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-5">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/15 border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
                Recipient Details
              </span>
              <div className="space-y-1 text-gray-700 dark:text-gray-300">
                <span className="font-bold text-gray-900 dark:text-white block">{order.customerName}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {order.customerPhone}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {order.address}, {order.city}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/15 border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
                Shipping Logistics
              </span>
              <div className="space-y-1 text-gray-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Class:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{order.deliveryOption} Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping Cost:</span>
                  <span className="font-semibold text-emerald-500">
                    {currency === 'GHS' ? `₵ ${order.deliveryCostGHS}` : `$ ${Math.round(order.deliveryCostGHS / 14.5)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Authorized Agent:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">Alhassan Logistics</span>
                </div>
              </div>
            </div>
          </div>

          {/* ITEMIZED PRODUCTS LIST */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-5 space-y-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
              Consolidated Package Items ({order.items.length})
            </span>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-900 bg-white dark:bg-[#121212] rounded-xl text-xs hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-black/40 overflow-hidden flex items-center justify-center border border-gray-100 dark:border-gray-800/80">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="max-w-full max-h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                      />
                    </div>
                    <div>
                      <span className="font-extrabold text-gray-900 dark:text-white block line-clamp-1">{item.product.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                        Quantity: {item.quantity} {item.selectedColor ? `• Color: ${item.selectedColor}` : ''}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-[#0066FF]">
                    {currency === 'GHS' 
                      ? `₵ ${(item.product.priceGHS * item.quantity).toLocaleString()}` 
                      : `$ ${(item.product.priceUSD * item.quantity).toLocaleString()}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-150 dark:border-gray-805 bg-gray-50/50 dark:bg-[#121212]/50 flex items-center justify-between text-[11px] text-gray-400 font-mono px-6">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Insured Shipment</span>
          <span>Immortal Accra Center</span>
        </div>
      </motion.div>
    </div>
  );
}
