/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Truck, Clock, Shield } from 'lucide-react';
import { handleImageError } from '../utils/imageFallback';

interface HeroProps {
  onShopClick: () => void;
  onRepairClick: () => void;
  onWhatsAppClick: () => void;
  onViewOfferClick?: () => void;
  currency: 'GHS' | 'USD';
}

export default function Hero({ onShopClick, onRepairClick, onWhatsAppClick, onViewOfferClick, currency }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-[#0B0B0B] text-white py-24 sm:py-32">
      {/* Background Graphic / Video Illusion */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-transparent to-[#0B0B0B] z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1200&auto=format&fit=crop"
          alt="Premium Electronics"
          className="w-full h-full object-cover filter brightness-50"
          onError={handleImageError}
        />
        {/* Animated grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-7 lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-[#0066FF]/10 text-[#0066FF] px-3 py-1 rounded-full border border-[#0066FF]/20 text-xs font-mono mb-6 animate-pulse">
              <Shield className="w-3.5 h-3.5" />
              <span>Accra's Certified Flagship Hub & Support Care</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight">
              <span className="block text-white">Your Trusted Destination for</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#00CCFF] to-amber-400">
                Smartphones, Gadgets & Repairs
              </span>
            </h1>
            
            <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-xl mx-auto lg:mx-0">
              Discover the latest flagship iPhones, Galaxies, and premium computing gear with high-speed local warranty. Experience Accra's premier, technician-led diagnostic and motherboard repair service.
            </p>

            <div className="mt-8 sm:max-w-lg sm:mx-auto lg:mx-0 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onShopClick}
                id="hero-cta-shop"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-medium bg-[#0066FF] hover:bg-[#0055DD] text-white shadow-lg shadow-[#0066FF]/30 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Shop Gadgets
              </button>
              
              <button
                onClick={onRepairClick}
                id="hero-cta-repair"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Book a Repair
              </button>

              <button
                onClick={onWhatsAppClick}
                id="hero-cta-whatsapp"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-medium bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg shadow-green-500/20 flex items-center justify-center space-x-2 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <span>💬 WhatsApp Us</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-gray-800 pt-8 max-w-md mx-auto lg:mx-0">
              <div>
                <span className="block text-2xl font-bold text-white">45-Min</span>
                <span className="text-xs text-gray-400">Average Screen Fix</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-[#0066FF]">100%</span>
                <span className="text-xs text-gray-400">Genuine Spares Guarantee</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-amber-400">6 Months</span>
                <span className="text-xs text-gray-400">Local Service Warranty</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image / Floating Card Experience */}
          <div className="mt-12 lg:mt-0 lg:col-span-5 relative z-10 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#0066FF] to-amber-500 opacity-25 blur-xl"></div>
              
              {/* Main Floating Mockup Card */}
              <div className="relative rounded-2xl bg-[#121212]/90 border border-gray-800 p-6 shadow-2xl text-left backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
                  <span className="text-xs font-mono text-gray-400">WEEKLY SPECIAL OFFER</span>
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Limited Stock</span>
                </div>
                
                <img
                  src="/src/assets/images/nubia_silver_side_1784297083308.jpg"
                  alt="nubia Z80 Ultra"
                  className="w-full h-44 object-contain rounded-xl mb-4 bg-white/5 border border-gray-800 p-2"
                  onError={handleImageError}
                />

                <h3 className="text-lg font-bold text-white">nubia Z80 Ultra</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">nubia Z80 Ultra 5G Smartphone Global Version Snapdragon 8 Elite Gen 5 7200mAh 6.85'' 144Hz Oled Display 90W Fast Charg</p>
                
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-mono">Special Price</span>
                    <span className="text-xl font-bold text-[#0066FF]">
                      {currency === 'GHS' ? '₵ 15,500' : '$ 1,050'}
                    </span>
                  </div>
                  <button
                    onClick={onViewOfferClick || onShopClick}
                    className="px-4 py-2 bg-[#0066FF] hover:bg-[#0055DD] text-white rounded-lg text-xs font-medium transition-all duration-200"
                  >
                    View Offer
                  </button>
                </div>
              </div>

              {/* Smaller overlay card */}
              <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center space-x-3 bg-[#0B0B0B] border border-gray-800 p-3 rounded-xl shadow-lg shadow-black/80 backdrop-blur-md">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 font-bold">
                  ✓
                </div>
                <div>
                  <span className="block text-xs font-bold text-white">Accra Same-Day Delivery</span>
                  <span className="block text-[10px] text-gray-400">Accra, Tema & Kumasi limits</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand/Trust badges row */}
        <div className="mt-16 border-t border-gray-800 pt-8 grid grid-cols-2 gap-4 md:grid-cols-4 items-center">
          <div className="flex items-center space-x-2 text-gray-400 text-xs justify-center md:justify-start">
            <Truck className="w-5 h-5 text-[#0066FF]" />
            <span>Fast Nationwide Delivery</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400 text-xs justify-center md:justify-start">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span>Secure GHS Mobile Money & Card Payments</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400 text-xs justify-center md:justify-start">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>Express Walk-in Diagnosis</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400 text-xs justify-center md:justify-start">
            <ShieldCheck className="w-5 h-5 text-[#0066FF]" />
            <span>Certified Technician Sign-off</span>
          </div>
        </div>
      </div>
    </div>
  );
}
