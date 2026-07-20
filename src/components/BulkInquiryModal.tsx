/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Building2, User, Mail, Phone, Calendar, ClipboardList, DollarSign, MapPin, CreditCard, Send, Sparkles, CheckCircle, Package } from 'lucide-react';
import { Product } from '../types';

interface BulkInquiryModalProps {
  products: Product[];
  onClose: () => void;
  onSubmitInquiry: (inquiryData: any) => Promise<any>;
}

export default function BulkInquiryModal({
  products,
  onClose,
  onSubmitInquiry,
}: BulkInquiryModalProps) {
  // Form state
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [estimatedQuantity, setEstimatedQuantity] = useState('10-25');
  const [message, setMessage] = useState('');
  const [timeline, setTimeline] = useState('Immediate');
  const [targetBudget, setTargetBudget] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [preferredPayment, setPreferredPayment] = useState('Bank Transfer');

  // Loading & success states
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleProductToggle = (productName: string) => {
    setSelectedProducts(prev => 
      prev.includes(productName)
        ? prev.filter(p => p !== productName)
        : [...prev, productName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!companyName.trim()) return setErrorMsg('Please enter your business or company name.');
    if (!contactName.trim()) return setErrorMsg('Please enter a contact person name.');
    if (!email.trim() || !email.includes('@')) return setErrorMsg('Please enter a valid business email.');
    if (!phone.trim()) return setErrorMsg('Please enter a contact phone number.');
    if (selectedProducts.length === 0) return setErrorMsg('Please select at least one product or category of interest.');
    if (!message.trim()) return setErrorMsg('Please provide some details regarding your bulk purchase request.');

    setIsLoading(true);
    try {
      const payload = {
        companyName,
        contactName,
        email,
        phone,
        productsOfInterest: selectedProducts,
        estimatedQuantity,
        message,
        timeline,
        targetBudget,
        deliveryLocation,
        preferredPayment,
      };

      const result = await onSubmitInquiry(payload);
      if (result && result.id) {
        setSuccessData(result);
      } else {
        setErrorMsg('Submission failed. Please verify your internet connection and try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred while submitting your inquiry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get distinct brands and categories of products to show as options
  const uniqueBrands = Array.from(new Set(products.map(p => p.brand)));
  const uniqueCategories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0B0B0B] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
        id="bulk-inquiry-modal-container"
      >
        {/* Banner */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-[#0066FF]/5 via-amber-500/5 to-[#0066FF]/5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#0066FF] text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                <span>Corporate & Wholesale Desk</span>
                <span className="bg-[#0066FF]/10 text-[#0066FF] text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">B2B Portal</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Unlock custom pricing, priority stock allocations, and direct bulk delivery across Ghana.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            id="close-bulk-modal-btn"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!successData ? (
            <form onSubmit={handleSubmit} className="space-y-6" id="bulk-inquiry-form">
              
              {/* Introduction Callout */}
              <div className="p-4 rounded-xl bg-amber-400/5 border border-amber-400/10 flex gap-3 text-xs text-amber-600 dark:text-amber-400">
                <Sparkles className="w-5 h-5 shrink-0 text-amber-500 animate-pulse" />
                <p className="leading-relaxed">
                  <strong>Bulk discount tiers start at 10+ devices.</strong> Our procurement team will review your requirements and generate a formal corporate quote within 2-4 business hours, complete with options for customized device setups, warranty coverage, and regional logistics.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg" id="bulk-form-error">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Section 1: Business Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-black tracking-wider uppercase font-mono text-gray-400">1. Company & Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Company / Organization Name *
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Zenith Bank Ghana, Hubtel Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                      required
                    />
                  </div>

                  {/* Contact Person */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Procurement / Contact Person Name *
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Kwabena Mensah"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                      required
                    />
                  </div>

                  {/* Corporate Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> Official Business Email *
                    </label>
                    <input 
                      type="email"
                      placeholder="e.g. purchase@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                      required
                    />
                  </div>

                  {/* Contact Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> Business Phone Number (WhatsApp Enabled) *
                    </label>
                    <input 
                      type="tel"
                      placeholder="e.g. +233 24 412 3456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Products & Quantities */}
              <div className="space-y-4">
                <h3 className="text-xs font-black tracking-wider uppercase font-mono text-gray-400">2. Request Specifications</h3>
                
                {/* Product/Category of Interest Checklist */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <ClipboardList className="w-3.5 h-3.5" /> Brands / Categories of Interest (Select all that apply) *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[...uniqueBrands, ...uniqueCategories].filter((v, i, a) => a.indexOf(v) === i).map((item) => {
                      const isSelected = selectedProducts.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleProductToggle(item)}
                          className={`px-3 py-2 rounded-lg border text-left text-xs transition flex items-center justify-between ${
                            isSelected 
                              ? 'border-[#0066FF] bg-[#0066FF]/5 text-[#0066FF] font-bold' 
                              : 'border-gray-200 dark:border-gray-800 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900'
                          }`}
                        >
                          <span>{item}</span>
                          {isSelected && <span className="text-[10px]">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid for Quantity, Budget, and Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Estimated Quantity Range */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" /> Estimated Total Quantity *
                    </label>
                    <select
                      value={estimatedQuantity}
                      onChange={(e) => setEstimatedQuantity(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                    >
                      <option value="10-25">10 to 25 Devices (Standard Bulk Tier)</option>
                      <option value="26-50">26 to 50 Devices (Premium Wholesale Tier)</option>
                      <option value="51-100">51 to 100 Devices (Enterprise Partner Tier)</option>
                      <option value="100+">100+ Devices (Platinum Fleet Tier)</option>
                    </select>
                  </div>

                  {/* Purchase Timeline */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Expected Procurement Timeline *
                    </label>
                    <select
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                    >
                      <option value="Immediate">Immediate (Within 7 Days)</option>
                      <option value="Within 30 Days">Within 30 Days</option>
                      <option value="1 to 3 Months">1 to 3 Months</option>
                      <option value="Just Planning / Budgeting">Just Planning / Budgeting</option>
                    </select>
                  </div>

                  {/* Target Budget */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Estimated Target Budget (Optional)
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. GHS 150,000"
                      value={targetBudget}
                      onChange={(e) => setTargetBudget(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                    />
                  </div>

                  {/* Delivery Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Delivery Location / Delivery City *
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Ridge / Airport, Accra or Kumasi Center"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                      required
                    />
                  </div>

                  {/* Preferred Payment Method */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" /> Preferred Payment Terms / Method *
                    </label>
                    <select
                      value={preferredPayment}
                      onChange={(e) => setPreferredPayment(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                    >
                      <option value="Bank Transfer">Bank Transfer (Direct Corporate Account ACH/RTGS)</option>
                      <option value="Mobile Money">Mobile Money (Wholesale Corporate MoMo Transfer)</option>
                      <option value="Company Check">Company Check / Cleared Check Payment</option>
                      <option value="Letter of Credit">Letter of Credit (Enterprise Only)</option>
                      <option value="Flexible Installments">Flexible Installments / 50-50 terms</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Messages & Specifications */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  Required Device Specifications & Message *
                </label>
                <textarea
                  placeholder="Please describe exactly which devices, specs (e.g., iPhone 15 Pro Max 256GB, 20 units; or Galaxy S24 Ultra 512GB, 10 units), accessories, custom configurations, warranty setups, or delivery instructions you require."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0066FF] leading-relaxed resize-none"
                  required
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  id="submit-bulk-inquiry-btn"
                  className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold flex items-center justify-center space-x-2 transition shadow-md shadow-[#0066FF]/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Processing...</span>
                    </span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Corporate Inquiry</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            /* Success View */
            <div className="py-12 px-4 text-center space-y-6" id="bulk-success-view">
              <div className="inline-flex p-4 bg-green-500/10 text-green-500 rounded-2xl animate-bounce">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Corporate Inquiry Submitted Successfully!</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  Thank you for contacting the B2B Wholesale Desk at Immortal Electronics. A dedicated corporate accounts manager has been assigned to your request.
                </p>
              </div>

              {/* Tracking Ticket Container */}
              <div className="p-5 max-w-md mx-auto rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3.5 text-left text-xs">
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-800 pb-2.5">
                  <span className="text-gray-400 font-mono">INQUIRY REF TICKET</span>
                  <span className="font-mono font-black text-[#0066FF]">{successData.id.replace('inq-', 'IM-B2B-')}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-2">
                  <span className="text-gray-400">Company Name</span>
                  <span className="text-right font-semibold">{successData.companyName}</span>

                  <span className="text-gray-400">Procurement Contact</span>
                  <span className="text-right font-semibold">{successData.contactName}</span>

                  <span className="text-gray-400">Bulk Quantity Tier</span>
                  <span className="text-right font-semibold">{successData.estimatedQuantity} Devices</span>

                  <span className="text-gray-400">Expected Timeline</span>
                  <span className="text-right font-semibold">{successData.timeline}</span>
                </div>
                <div className="pt-2.5 border-t border-gray-200 dark:border-gray-800 text-center text-[11px] text-amber-500 font-medium">
                  ⚡ A digital catalog & custom quotation will be sent to <strong>{successData.email}</strong> shortly.
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-bold text-xs hover:bg-gray-900 dark:hover:bg-gray-100 transition shadow-lg"
                >
                  Return to Store
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
