/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RefreshCw, Search, ShieldCheck, AlertTriangle, ArrowRight, Smartphone, Upload, TrendingUp, Info } from 'lucide-react';
import { TradeInRequest } from '../types';

interface TradeInSystemProps {
  onSubmitTradeIn: (tradeInData: any) => Promise<TradeInRequest>;
  onTrackTradeIn: (trackingCode: string) => Promise<TradeInRequest | null>;
  currency: 'GHS' | 'USD';
}

export default function TradeInSystem({ onSubmitTradeIn, onTrackTradeIn, currency }: TradeInSystemProps) {
  const [activeTab, setUiTab] = useState<'request' | 'track'>('request');

  // Request form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deviceType, setDeviceType] = useState('Smartphone');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState<'Like New' | 'Good' | 'Fair' | 'Broken'>('Good');
  const [notes, setNotes] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Success state
  const [tradeInSuccess, setTradeInSuccess] = useState<TradeInRequest | null>(null);

  // Track state
  const [trackingCode, setTrackingCode] = useState('');
  const [trackedTrade, setTrackedTrade] = useState<TradeInRequest | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  // Instant pre-valuation estimate helper
  const calculateInstantEstimate = () => {
    if (!brand || !model) return 0;
    let baseGHS = 1500;
    const bLower = brand.toLowerCase();
    
    if (bLower.includes('apple') || bLower.includes('iphone')) {
      baseGHS = 4500;
      if (model.includes('15')) baseGHS = 8000;
      else if (model.includes('14')) baseGHS = 6000;
      else if (model.includes('13')) baseGHS = 4500;
    } else if (bLower.includes('samsung')) {
      baseGHS = 3500;
      if (model.includes('24')) baseGHS = 7500;
      else if (model.includes('23')) baseGHS = 5500;
    } else if (bLower.includes('pixel') || bLower.includes('google')) {
      baseGHS = 2500;
    }

    if (condition === 'Like New') return baseGHS;
    if (condition === 'Good') return Math.round(baseGHS * 0.8);
    if (condition === 'Fair') return Math.round(baseGHS * 0.5);
    return Math.round(baseGHS * 0.2); // Broken
  };

  const currentEstimateGHS = calculateInstantEstimate();
  const currentEstimateUSD = Math.round(currentEstimateGHS / 14.5);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !brand || !model) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const tradeInData = {
        customerName,
        customerPhone,
        customerEmail,
        deviceType,
        brand,
        model,
        condition,
        notes,
        image: uploadedImage || ''
      };

      const result = await onSubmitTradeIn(tradeInData);
      setTradeInSuccess(result);
      
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setBrand('');
      setModel('');
      setNotes('');
      setUploadedImage(null);
    } catch (err) {
      console.error(err);
      alert('Failed to submit trade-in request.');
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) {
      setTrackingError('Please enter your tracking code.');
      return;
    }

    setIsTrackingLoading(true);
    setTrackingError(null);
    setTrackedTrade(null);

    try {
      const trade = await onTrackTradeIn(trackingCode);
      if (trade) {
        setTrackedTrade(trade);
      } else {
        setTrackingError('No trade-in record found. Check code (e.g., IM-TRD-XXXXXX) and try again.');
      }
    } catch (err) {
      console.error(err);
      setTrackingError('An error occurred during query.');
    } finally {
      setIsTrackingLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#0066FF]/10 text-[#0066FF] mb-3">
          <RefreshCw className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">Premium Device Swap & Trade-In</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
          Turn your old smartphones, laptops, and tablets into instant credit towards a brand new premium flagship. Check our competitive real-time appraisal valuation now!
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8 max-w-md mx-auto">
        <button
          onClick={() => { setUiTab('request'); setTradeInSuccess(null); }}
          className={`w-1/2 py-3 text-center font-medium text-sm transition-all border-b-2 ${
            activeTab === 'request'
              ? 'border-[#0066FF] text-[#0066FF]'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          id="tab-trade-in-request"
        >
          Request Valuation
        </button>
        <button
          onClick={() => { setUiTab('track'); setTrackingError(null); }}
          className={`w-1/2 py-3 text-center font-medium text-sm transition-all border-b-2 ${
            activeTab === 'track'
              ? 'border-[#0066FF] text-[#0066FF]'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          id="tab-trade-in-track"
        >
          Track Appraisal Status
        </button>
      </div>

      {activeTab === 'request' && (
        <div className="space-y-6">
          {tradeInSuccess ? (
            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-center space-y-4" id="trade-in-success-panel">
              <div className="text-3xl">📱✨</div>
              <h3 className="text-xl font-bold text-green-500 font-sans">Trade-In Appraisal Submitted!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Our Accra team has received your trade-in details. Bring your physical device to our workshop for final verification and instant payment or store credit!
              </p>

              <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl p-4 inline-block">
                <span className="block text-[10px] text-gray-400 font-mono">APPRAISAL TRANSACTION NUMBER</span>
                <span className="text-xl font-extrabold text-[#0066FF] tracking-wider block mt-1">
                  {tradeInSuccess.trackingNumber}
                </span>
                <span className="block text-xs text-amber-500 font-bold mt-1">
                  Pre-valuation Estimate: {currency === 'GHS' ? `₵ ${tradeInSuccess.valuationEstimateGHS.toLocaleString()}` : `$ ${tradeInSuccess.valuationEstimateUSD.toLocaleString()}`}
                </span>
              </div>

              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={() => {
                    setTrackingCode(tradeInSuccess.trackingNumber);
                    setTrackedTrade(tradeInSuccess);
                    setUiTab('track');
                  }}
                  className="px-4 py-2 bg-[#0066FF] text-white rounded-lg text-xs font-semibold hover:bg-[#0055DD]"
                >
                  Track Appraisal Progress
                </button>
                <button
                  onClick={() => setTradeInSuccess(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold"
                >
                  Appraise Another Device
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Appraisal Form */}
              <form onSubmit={handleFormSubmit} className="md:col-span-7 bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-md font-bold flex items-center space-x-1 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <Smartphone className="w-5 h-5 text-[#0066FF]" />
                  <span>Device Evaluation Checklist</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Sena Anku"
                      className="mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                      id="trade-in-input-name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="020 XXX XXXX"
                      className="mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                      id="trade-in-input-phone"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="sena.anku@gmail.com"
                    className="mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                    id="trade-in-input-email"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Device Category</label>
                    <select
                      value={deviceType}
                      onChange={(e) => setDeviceType(e.target.value)}
                      className="mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-700 dark:text-white"
                      id="trade-in-select-category"
                    >
                      <option value="Smartphone">Smartphone</option>
                      <option value="Laptop">Laptop / MacBook</option>
                      <option value="Tablet">iPad / Tablet</option>
                      <option value="Smartwatch">Smart Watch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Condition *</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as any)}
                      className="mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-700 dark:text-white font-semibold"
                      id="trade-in-select-condition"
                    >
                      <option value="Like New">Like New (Flawless box/body)</option>
                      <option value="Good">Good (Minor cosmetic scratches)</option>
                      <option value="Fair">Fair (Noticeable dents/wear)</option>
                      <option value="Broken">Broken (Cracked screen/faulty)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Brand *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apple"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                      id="trade-in-input-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Model *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. iPhone 14 Pro Max"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                      id="trade-in-input-model"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Structural Remarks / Battery Health</label>
                  <textarea
                    rows={2}
                    placeholder="Provide details like battery health %, network carrier lock, or general wear details."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                    id="trade-in-input-notes"
                  />
                </div>

                {/* Drag and Drop visual picker */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono mb-1">Upload Device Photos</label>
                  <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-3 text-center cursor-pointer hover:border-[#0066FF] transition-all relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      id="trade-in-file-picker"
                    />
                    {uploadedImage ? (
                      <span className="text-xs text-green-500 font-bold flex items-center justify-center">✓ Device Photo loaded</span>
                    ) : (
                      <span className="text-xs text-gray-400 block font-mono">Click to attach photo of device body</span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  id="trade-in-submit-btn"
                  className="w-full py-3 bg-[#0066FF] hover:bg-[#0055DD] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#0066FF]/20"
                >
                  Submit Trade-In Valuation Request
                </button>
              </form>

              {/* Appraisal estimate preview */}
              <div className="md:col-span-5 flex flex-col justify-between bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-xl">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-amber-500 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>REAL-TIME VALUATION APPRAISAL</span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Estimated Swap Credit</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Based on global refurbished price dynamics in GHS & USD exchange rates:</p>

                  <div className="mt-6 border border-gray-200 dark:border-gray-800 p-4 rounded-xl bg-white dark:bg-[#0B0B0B] text-center">
                    {brand && model ? (
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-mono block">ESTIMATED APPRASIAL</span>
                        <span className="text-3xl font-black text-[#0066FF] block mt-1">
                          {currency === 'GHS' ? `₵ ${currentEstimateGHS.toLocaleString()}` : `$ ${currentEstimateUSD.toLocaleString()}`}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mt-2">
                          For {brand} {model} ({condition})
                        </span>
                      </div>
                    ) : (
                      <div className="py-6">
                        <Smartphone className="w-10 h-10 mx-auto text-gray-300 animate-bounce" />
                        <span className="text-xs text-gray-400 block mt-3 font-mono">Enter device brand & model to fetch quote</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-start space-x-2 text-xs text-gray-500">
                      <Info className="w-4 h-4 text-[#0066FF] shrink-0 mt-0.5" />
                      <span>This is a pre-valuation guide. The final offer is confirmed after visual diagnostic checks at our Accra station.</span>
                    </div>
                    <div className="flex items-start space-x-2 text-xs text-gray-500">
                      <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>Trade-in values remain locked for 7 days after submission.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 text-[10px] text-gray-400 font-mono text-center">
                  IMMORTAL REFURBISHED GRID ENGINE V3.1
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'track' && (
        <div className="space-y-6">
          <form onSubmit={handleTrackSubmit} className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-md font-bold mb-4">Track Existing Appraisal</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                placeholder="Enter Trade-In Appraisal Code (e.g. IM-TRD-183928)"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="flex-1 p-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl text-sm"
                id="trade-in-tracking-field"
              />
              <button
                type="submit"
                id="trade-in-query-btn"
                className="py-3 px-6 rounded-xl font-bold bg-[#0066FF] hover:bg-[#0055DD] text-white"
              >
                Query Trade-In
              </button>
            </div>
            {trackingError && <p className="text-xs text-red-500 mt-2 font-mono">{trackingError}</p>}
          </form>

          {trackedTrade && (
            <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-xl space-y-4" id="trade-in-tracked-panel">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block">CODE</span>
                  <span className="text-sm font-bold font-mono">{trackedTrade.trackingNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block">DEVICE</span>
                  <span className="text-sm font-bold text-[#0066FF]">{trackedTrade.brand} {trackedTrade.model}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block">STATUS</span>
                  <span className="inline-block px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">{trackedTrade.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 dark:bg-[#121212]/30 p-4 rounded-xl border border-gray-100 dark:border-gray-900">
                <div>
                  <span className="block text-xs text-gray-400 uppercase font-mono">Appraisal Condition</span>
                  <span className="text-xs font-bold block text-gray-800 dark:text-gray-200">{trackedTrade.condition}</span>

                  <span className="block text-xs text-gray-400 uppercase font-mono mt-3">Initial Valuation Estimate</span>
                  <span className="text-lg font-bold text-[#0066FF] block">
                    {currency === 'GHS' ? `₵ ${trackedTrade.valuationEstimateGHS.toLocaleString()}` : `$ ${trackedTrade.valuationEstimateUSD.toLocaleString()}`}
                  </span>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 md:pl-4">
                  <span className="block text-xs text-gray-400 uppercase font-mono">Final Verified Offer</span>
                  {trackedTrade.finalOfferGHS ? (
                    <div>
                      <span className="text-2xl font-extrabold text-green-500 block mt-1">
                        {currency === 'GHS' ? `₵ ${trackedTrade.finalOfferGHS.toLocaleString()}` : `$ ${trackedTrade.finalOfferUSD?.toLocaleString()}`}
                      </span>
                      <span className="text-[10px] text-green-500 font-bold block mt-1">✓ Approved and ready for payout drop-off!</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-sm text-gray-400 font-medium block mt-1">Pending physical station inspection</span>
                      <p className="text-[10px] text-gray-400 mt-1">Please drop off the device at our Accra branch for certified grading.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
