/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Hammer, Search, ShieldCheck, Cpu, Upload, HelpCircle, Mail, Phone, Calendar, AlertTriangle, Sparkles } from 'lucide-react';
import { RepairRequest, RepairStatus } from '../types';

interface RepairBookingProps {
  onBookRepair: (bookingData: any) => Promise<RepairRequest>;
  onTrackRepair: (trackingCode: string) => Promise<RepairRequest | null>;
  currency: 'GHS' | 'USD';
}

export default function RepairBooking({ onBookRepair, onTrackRepair, currency }: RepairBookingProps) {
  const [activeTab, setActiveTab] = useState<'book' | 'track'>('book');

  // Booking Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deviceType, setDeviceType] = useState<'Smartphone' | 'Laptop' | 'Tablet' | 'Other'>('Smartphone');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [faultCategory, setFaultCategory] = useState<'Screen' | 'Battery' | 'Charging Port' | 'Water Damage' | 'Software' | 'Camera' | 'Motherboard' | 'Speaker' | 'Other'>('Screen');
  const [faultDescription, setFaultDescription] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [sendSMS, setSendSMS] = useState(true);

  // AI Diagnostic Advisor State
  const [aiDiagnostic, setAiDiagnostic] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Booking Results state
  const [bookingSuccess, setBookingSuccess] = useState<RepairRequest | null>(null);

  // Tracking state
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [trackedRepair, setTrackedRepair] = useState<RepairRequest | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  // Image upload simulator
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

  // Request AI Diagnostic consultation on-the-fly
  const handleRequestAIDiagnosis = async () => {
    if (!faultDescription || faultDescription.length < 10) {
      alert('Please describe your device fault in more detail (at least 10 characters) for our AI to diagnose.');
      return;
    }
    setIsAiLoading(true);
    setAiDiagnostic(null);

    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Please diagnose this device repair issue and give a short recommendation:
Device: ${brand} ${model} (${deviceType})
Fault Category: ${faultCategory}
Fault Description: ${faultDescription}`,
          context: { brand, model, deviceType, faultCategory }
        })
      });
      const data = await res.json();
      if (data.response) {
        setAiDiagnostic(data.response);
      } else {
        setAiDiagnostic('Our AI engine is currently on standby. Standard screen or battery replacements generally range between GHS 650 to GHS 1,800 with 45-minute turnaround.');
      }
    } catch (err) {
      console.error(err);
      setAiDiagnostic('Failed to reach AI Diagnostics. Please proceed to book online; our human technicians will conduct a certified walk-in inspection.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !faultDescription) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const bookingData = {
        customerName,
        customerPhone,
        customerEmail,
        deviceType,
        brand,
        model,
        faultCategory,
        faultDescription,
        image: uploadedImage || ''
      };

      const result = await onBookRepair(bookingData);
      setBookingSuccess(result);
      
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setBrand('');
      setModel('');
      setFaultDescription('');
      setUploadedImage(null);
      setAiDiagnostic(null);
    } catch (err) {
      console.error(err);
      alert('Failed to submit repair booking. Please try again.');
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumberInput.trim()) {
      setTrackingError('Please enter a tracking number.');
      return;
    }

    setIsTrackingLoading(true);
    setTrackingError(null);
    setTrackedRepair(null);

    try {
      const repair = await onTrackRepair(trackingNumberInput);
      if (repair) {
        setTrackedRepair(repair);
      } else {
        setTrackingError('No repair record found with that tracking code. Check the spelling (e.g. IM-REP-XXXXXX) or visit our Accra store.');
      }
    } catch (err) {
      console.error(err);
      setTrackingError('An error occurred during tracking query.');
    } finally {
      setIsTrackingLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#0066FF]/10 text-[#0066FF] mb-3">
          <Hammer className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">Accra Certified Repair Station</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
          We service flagship smartphones, laptops, and tablets using genuine grade-A spare parts. Check current repair status or book an appointment online with instant quotes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8 max-w-md mx-auto">
        <button
          onClick={() => { setActiveTab('book'); setBookingSuccess(null); }}
          className={`w-1/2 py-3 text-center font-medium text-sm transition-all border-b-2 ${
            activeTab === 'book'
              ? 'border-[#0066FF] text-[#0066FF]'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          id="tab-book-repair"
        >
          Book Repair Online
        </button>
        <button
          onClick={() => { setActiveTab('track'); setTrackingError(null); }}
          className={`w-1/2 py-3 text-center font-medium text-sm transition-all border-b-2 ${
            activeTab === 'track'
              ? 'border-[#0066FF] text-[#0066FF]'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          id="tab-track-repair"
        >
          Track Device Status
        </button>
      </div>

      {/* Booking Form View */}
      {activeTab === 'book' && (
        <div className="space-y-6">
          {bookingSuccess ? (
            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-center space-y-4" id="repair-success-panel">
              <div className="text-3xl">🎉</div>
              <h3 className="text-xl font-bold text-green-500">Repair Appointment Booked Successfully!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Your device repair request is registered. Please write down or save your Tracking Code. Drop off your device or schedule a pickup.
              </p>
              
              <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl p-4 inline-block">
                <span className="block text-xs text-gray-400 font-mono">TRACKING NUMBER</span>
                <span className="text-xl font-extrabold text-[#0066FF] tracking-wider block mt-1">
                  {bookingSuccess.trackingNumber}
                </span>
                <span className="block text-xs text-amber-500 font-bold mt-1">Estimated Diagnostic Quote: ₵ {bookingSuccess.quotationGHS} ({currency === 'GHS' ? `₵` : `$`}{currency === 'GHS' ? bookingSuccess.quotationGHS : bookingSuccess.quotationUSD})</span>
              </div>

              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={() => {
                    setTrackingNumberInput(bookingSuccess.trackingNumber);
                    setTrackedRepair(bookingSuccess);
                    setActiveTab('track');
                  }}
                  className="px-4 py-2 bg-[#0066FF] text-white rounded-lg text-xs font-semibold hover:bg-[#0055DD]"
                >
                  Track Live Progress
                </button>
                <button
                  onClick={() => setBookingSuccess(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold"
                >
                  Book Another Repair
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800/80 p-6 rounded-2xl shadow-xl">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800/60 pb-1 flex items-center space-x-1.5">
                  <Phone className="w-4 h-4 text-[#0066FF]" />
                  <span>1. Contact Details</span>
                </h3>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase font-mono">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Alhassan Ibrahim"
                    className="mt-1 w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20 text-sm"
                    id="repair-input-name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase font-mono">Ghana Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="024 XXX XXXX"
                    className="mt-1 w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20 text-sm"
                    id="repair-input-phone"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase font-mono">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="alhassan@gmail.com"
                    className="mt-1 w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20 text-sm"
                    id="repair-input-email"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    checked={sendSMS}
                    onChange={(e) => setSendSMS(e.target.checked)}
                    className="accent-[#0066FF] h-4 w-4"
                    id="repair-sms-checkbox"
                  />
                  <label className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer" htmlFor="repair-sms-checkbox">
                    Send automated GHS network status alerts to my phone (via Hubtel/MTN/Telecel)
                  </label>
                </div>
              </div>

              {/* Device & Fault details */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800/60 pb-1 flex items-center space-x-1.5">
                  <Cpu className="w-4 h-4 text-amber-500" />
                  <span>2. Device & Fault Specifications</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase font-mono">Device Type *</label>
                    <select
                      value={deviceType}
                      onChange={(e) => setDeviceType(e.target.value as any)}
                      className="mt-1 w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20 text-sm text-gray-700 dark:text-white"
                      id="repair-select-type"
                    >
                      <option value="Smartphone">Smartphone</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Other">Other Gadget</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase font-mono">Fault Category *</label>
                    <select
                      value={faultCategory}
                      onChange={(e) => setFaultCategory(e.target.value as any)}
                      className="mt-1 w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20 text-sm text-gray-700 dark:text-white"
                      id="repair-select-fault"
                    >
                      <option value="Screen">Screen Replacement</option>
                      <option value="Battery">Battery Replacement</option>
                      <option value="Charging Port">Charging Port Repair</option>
                      <option value="Water Damage">Water Damage Treatment</option>
                      <option value="Software">Software Issues / Unlocks</option>
                      <option value="Camera">Camera Replacement</option>
                      <option value="Motherboard">Motherboard / Micro-soldering</option>
                      <option value="Speaker">Speaker / Microphone Fix</option>
                      <option value="Other">Other Faults</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase font-mono">Brand *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apple, Samsung"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="mt-1 w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20 text-sm"
                      id="repair-input-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase font-mono">Model *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. iPhone 15 Pro Max"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="mt-1 w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20 text-sm"
                      id="repair-input-model"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase font-mono">Describe the Issue *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe what happened (e.g. phone dropped in pool, screen is flashing green lines, charging cable only works at a specific angle)"
                    value={faultDescription}
                    onChange={(e) => setFaultDescription(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20 text-sm"
                    id="repair-input-desc"
                  />
                </div>

                {/* File Upload Container with Drag-and-Drop aesthetics */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase font-mono mb-1">Upload Device Photo (Optional)</label>
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-3 text-center cursor-pointer hover:border-[#0066FF] transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      id="repair-file-picker"
                    />
                    {uploadedImage ? (
                      <div className="flex items-center justify-center space-x-2 text-xs text-green-500 font-semibold">
                        <Upload className="w-4 h-4" />
                        <span>Photo loaded successfully!</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 mx-auto text-gray-400" />
                        <p className="text-xs text-gray-400">Drag or click to attach image of physical fault</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Diagnostic Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleRequestAIDiagnosis}
                    id="ai-diagnostic-trigger"
                    className="w-full py-2 px-3 text-xs rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 animate-spin-slow text-amber-500" />
                    <span>Get Instant AI Diagnostic Consultation</span>
                  </button>
                  
                  {isAiLoading && (
                    <div className="mt-2 text-[10px] font-mono text-gray-400 animate-pulse">
                      Analyzing fault dynamics with Gemini 3.5-Flash...
                    </div>
                  )}

                  {aiDiagnostic && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-gray-700 dark:text-gray-300 relative" id="ai-diagnostic-output">
                      <div className="font-bold text-amber-500 flex items-center mb-1">
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        <span>AI Diagnostic Verdict</span>
                      </div>
                      <p className="leading-relaxed">{aiDiagnostic}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    id="repair-booking-submit"
                    className="w-full py-3 rounded-xl font-bold bg-[#0066FF] hover:bg-[#0055DD] text-white shadow-lg shadow-[#0066FF]/20 active:scale-95 transition-transform"
                  >
                    Confirm Booking Appointment
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tracking Tab View */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          <form onSubmit={handleTrackSubmit} className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-md font-bold mb-4">Query Your Live Repair Order</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter Repair Tracking Code (e.g. IM-REP-482094)"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl text-sm"
                  id="tracking-input-field"
                />
              </div>
              <button
                type="submit"
                disabled={isTrackingLoading}
                id="tracking-query-btn"
                className="py-3 px-6 rounded-xl font-bold bg-[#0066FF] hover:bg-[#0055DD] text-white disabled:bg-gray-200 transition-colors"
              >
                {isTrackingLoading ? 'Querying...' : 'Track Status'}
              </button>
            </div>

            {trackingError && (
              <p className="text-xs text-red-500 mt-2 font-mono flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-500" />
                <span>{trackingError}</span>
              </p>
            )}
          </form>

          {/* Render Tracked Repair details */}
          {trackedRepair && (
            <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-xl space-y-6" id="repair-tracking-result">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-4 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block">REPAIR CODE</span>
                  <span className="text-lg font-bold text-[#0066FF] font-mono">{trackedRepair.trackingNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block">DATE CREATED</span>
                  <span className="text-sm font-semibold">{new Date(trackedRepair.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block">DEVICE</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{trackedRepair.brand} {trackedRepair.model}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block">CURRENT STATUS</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase mt-1 ${
                    trackedRepair.status === 'Completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                    trackedRepair.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                    trackedRepair.status === 'Awaiting Parts' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {trackedRepair.status}
                  </span>
                </div>
              </div>

              {/* Progress Stepper Visualizer */}
              <div className="grid grid-cols-5 text-center text-xs relative pt-4 pb-6">
                <div className="absolute top-7 left-1/10 right-1/10 h-0.5 bg-gray-200 dark:bg-gray-800 z-0"></div>
                {/* Simulated line progress */}
                <div 
                  className="absolute top-7 left-1/10 h-0.5 bg-[#0066FF] z-0 transition-all duration-500"
                  style={{
                    width: 
                      trackedRepair.status === 'Pending' ? '0%' :
                      trackedRepair.status === 'In Progress' ? '33%' :
                      trackedRepair.status === 'Awaiting Parts' ? '50%' :
                      trackedRepair.status === 'Completed' ? '75%' :
                      '100%'
                  }}
                ></div>

                {/* Steps */}
                {[
                  { label: 'Booking', status: 'Pending' },
                  { label: 'Diagnosis', status: 'In Progress' },
                  { label: 'Sourcing Parts', status: 'Awaiting Parts' },
                  { label: 'Repaired', status: 'Completed' },
                  { label: 'Returned', status: 'Returned' }
                ].map((step, idx) => {
                  const stepOrder = ['Pending', 'In Progress', 'Awaiting Parts', 'Completed', 'Returned'];
                  const currentIdx = stepOrder.indexOf(trackedRepair.status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isDone 
                          ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20' 
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                      } ${isCurrent ? 'ring-4 ring-[#0066FF]/20' : ''}`}>
                        {idx + 1}
                      </div>
                      <span className={`block mt-2 font-medium text-[10px] ${isDone ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Details and Quote */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-gray-900">
                <div>
                  <span className="block text-xs text-gray-400 uppercase font-mono">Reported Problem</span>
                  <p className="text-xs mt-1 text-gray-700 dark:text-gray-300 italic">"{trackedRepair.faultDescription}"</p>
                  
                  <span className="block text-xs text-gray-400 uppercase font-mono mt-4">Technician Verdict & Action Logs</span>
                  <p className="text-xs mt-1 text-gray-800 dark:text-gray-200 font-medium">
                    {trackedRepair.technicianNotes || 'Device inspected. Waiting for specialized technician assignment.'}
                  </p>
                </div>

                <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 md:pl-4 pt-4 md:pt-0">
                  <div>
                    <span className="block text-xs text-gray-400 uppercase font-mono">Service Charge Estimation</span>
                    <span className="text-2xl font-extrabold text-[#0066FF] block mt-1">
                      {currency === 'GHS' 
                        ? `₵ ${trackedRepair.quotationGHS.toLocaleString()}` 
                        : `$ ${trackedRepair.quotationUSD.toLocaleString()}`
                      }
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Includes genuine parts and 6 months service warranty.</span>
                  </div>

                  <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center space-x-2 text-[11px] text-green-500">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Diagnostics authorized under standard Ghanaian consumer care guidelines.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
