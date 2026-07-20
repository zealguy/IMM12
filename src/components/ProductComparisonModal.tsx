/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, Check, AlertCircle, ShoppingCart, Star, Cpu, Database, Battery, 
  Layers, ArrowLeftRight, HelpCircle, Sparkles, Trash2, Tag, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { handleImageError } from '../utils/imageFallback';

interface ProductComparisonModalProps {
  comparisonList: Product[];
  currency: 'GHS' | 'USD';
  onClose: () => void;
  onRemoveFromCompare: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductComparisonModal({
  comparisonList,
  currency,
  onClose,
  onRemoveFromCompare,
  onAddToCart,
}: ProductComparisonModalProps) {
  
  // Helper to extract a spec value with multiple possible keys (case-insensitive)
  const getSpecValue = (product: Product, keys: string[]): string => {
    if (!product.specs) return 'N/A';
    for (const k of keys) {
      // Direct match
      if (product.specs[k]) return product.specs[k];
      
      // Case-insensitive / partial match
      const foundKey = Object.keys(product.specs).find(
        key => key.toLowerCase() === k.toLowerCase() || key.toLowerCase().includes(k.toLowerCase())
      );
      if (foundKey && product.specs[foundKey]) {
        return product.specs[foundKey];
      }
    }
    return 'N/A';
  };

  // Extract all unique spec keys across all compared products to show them in a dynamic section
  const getAllUniqueSpecKeys = (): string[] => {
    const keysSet = new Set<string>();
    comparisonList.forEach(p => {
      if (p.specs) {
        Object.keys(p.specs).forEach(k => keysSet.add(k));
      }
    });
    // Remove keys that we are already highlighting in the primary sections
    const highlightedKeys = ['processor', 'ram', 'battery', 'display', 'storage', 'os', 'battery life'];
    return Array.from(keysSet).filter(
      k => !highlightedKeys.some(hk => k.toLowerCase() === hk || k.toLowerCase().includes(hk))
    );
  };

  const uniqueSpecKeys = getAllUniqueSpecKeys();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-6xl bg-[#0E0E0E] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden text-gray-100"
        onClick={(e) => e.stopPropagation()}
        id="product-comparison-modal"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-950/20 via-black to-blue-950/20">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#0066FF]/10 text-[#0066FF]">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wider uppercase font-mono flex items-center gap-2">
                <span>Side-by-Side Comparison Desk</span>
                <span className="bg-[#0066FF] text-white text-[9px] font-bold px-2 py-0.5 rounded font-sans">
                  {comparisonList.length} of 3 Devices
                </span>
              </h3>
              <p className="text-xs text-gray-400">Evaluate hardware architectural specifications and premium flagship configurations.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
            id="close-compare-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        {comparisonList.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto" />
            <h4 className="text-sm font-mono text-gray-400">No devices selected for comparison.</h4>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-[#0066FF] text-white rounded-xl text-xs font-bold font-sans"
            >
              Go to Store Grid
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto p-6 max-h-[80vh] overflow-y-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr>
                  {/* Left row labels column */}
                  <th className="w-1/4 pb-6 text-left font-mono text-xs font-semibold uppercase text-gray-400 tracking-wider">
                    SPECIFICATION INDEX
                  </th>
                  {/* Product Columns */}
                  {comparisonList.map((product) => {
                    const priceFormatted = currency === 'GHS' 
                      ? `₵ ${product.priceGHS.toLocaleString()}` 
                      : `$ ${product.priceUSD.toLocaleString()}`;
                    return (
                      <th key={product.id} className="pb-6 px-4 text-left font-sans align-top relative w-1/4">
                        {/* Remove Button */}
                        <button 
                          onClick={() => onRemoveFromCompare(product)}
                          className="absolute top-0 right-4 p-1 rounded-md text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="space-y-3 pt-2">
                          {/* Image */}
                          <div className="w-32 h-32 mx-auto md:mx-0 p-2 bg-black/40 border border-gray-800/80 rounded-xl flex items-center justify-center overflow-hidden">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="max-h-28 max-w-full object-contain filter brightness-95 dark:brightness-90 hover:scale-105 transition-transform" 
                              onError={handleImageError}
                            />
                          </div>

                          {/* Brand & Name */}
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold block">
                              {product.brand}
                            </span>
                            <h4 className="text-sm font-black tracking-tight text-white line-clamp-1">
                              {product.name}
                            </h4>
                          </div>

                          {/* Price */}
                          <div className="flex items-baseline space-x-1">
                            <span className="text-base font-extrabold text-[#0066FF]">{priceFormatted}</span>
                            <span className="text-[9px] font-mono text-gray-500">
                              {currency === 'GHS' ? `($${product.priceUSD})` : `(₵${product.priceGHS.toLocaleString()})`}
                            </span>
                          </div>

                          {/* Add to Cart CTA */}
                          <button
                            onClick={() => onAddToCart(product)}
                            disabled={product.stock === 0}
                            className="w-full py-2 bg-white/5 hover:bg-[#0066FF]/10 border border-gray-800 hover:border-[#0066FF]/50 text-white hover:text-[#0066FF] text-xs font-black rounded-lg transition-all flex items-center justify-center space-x-2"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                          </button>
                        </div>
                      </th>
                    );
                  })}
                  {/* Fill empty spaces if comparing less than 3 */}
                  {comparisonList.length < 3 && (
                    Array.from({ length: 3 - comparisonList.length }).map((_, i) => (
                      <th key={i} className="pb-6 px-4 text-center text-gray-600 align-middle">
                        <div className="border border-dashed border-gray-800 rounded-xl p-8 h-full flex flex-col justify-center items-center space-y-2 text-xs font-mono">
                          <HelpCircle className="w-8 h-8 text-gray-700" />
                          <span>Slot Available</span>
                          <span className="text-[10px] text-gray-500">Add another gadget to compare</span>
                        </div>
                      </th>
                    ))
                  )}
                </tr>
              </thead>

              <tbody>
                {/* 1. PRIMARY SPECTACULAR HIGHLIGHTS TITLE */}
                <tr className="border-t border-gray-800">
                  <td colSpan={4} className="py-3 font-mono text-[10px] font-extrabold text-[#0066FF] tracking-wider uppercase bg-[#0066FF]/5 pl-2 rounded-l-md">
                    ⚡ Core Architecture Parameters (Highlighted Specs)
                  </td>
                </tr>

                {/* PROCESSOR ROW */}
                <tr className="border-b border-gray-800/50 hover:bg-white/20 transition-all">
                  <td className="py-3.5 align-middle text-xs font-medium text-gray-300 font-mono flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-amber-500" />
                    <span>Processor / SoC</span>
                  </td>
                  {comparisonList.map((product) => {
                    const val = getSpecValue(product, ['Processor', 'SoC', 'Chip', 'Chipset']);
                    return (
                      <td key={product.id} className="py-3.5 px-4 align-middle text-xs font-extrabold text-amber-400">
                        {val}
                      </td>
                    );
                  })}
                  {comparisonList.length < 3 && Array.from({ length: 3 - comparisonList.length }).map((_, i) => <td key={i} className="py-3.5 px-4" />)}
                </tr>

                {/* RAM ROW */}
                <tr className="border-b border-gray-800/50 hover:bg-white/20 transition-all">
                  <td className="py-3.5 align-middle text-xs font-medium text-gray-300 font-mono flex items-center space-x-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    <span>System RAM</span>
                  </td>
                  {comparisonList.map((product) => {
                    const val = getSpecValue(product, ['RAM', 'Memory', 'System Memory']);
                    return (
                      <td key={product.id} className="py-3.5 px-4 align-middle text-xs font-extrabold text-purple-400">
                        {val}
                      </td>
                    );
                  })}
                  {comparisonList.length < 3 && Array.from({ length: 3 - comparisonList.length }).map((_, i) => <td key={i} className="py-3.5 px-4" />)}
                </tr>

                {/* BATTERY ROW */}
                <tr className="border-b border-gray-800/50 hover:bg-white/20 transition-all">
                  <td className="py-3.5 align-middle text-xs font-medium text-gray-300 font-mono flex items-center space-x-2">
                    <Battery className="w-4 h-4 text-emerald-400" />
                    <span>Battery Capacity & Longevity</span>
                  </td>
                  {comparisonList.map((product) => {
                    const val = getSpecValue(product, ['Battery', 'Battery Life', 'Power', 'Capacity']);
                    return (
                      <td key={product.id} className="py-3.5 px-4 align-middle text-xs font-semibold text-emerald-400">
                        {val}
                      </td>
                    );
                  })}
                  {comparisonList.length < 3 && Array.from({ length: 3 - comparisonList.length }).map((_, i) => <td key={i} className="py-3.5 px-4" />)}
                </tr>

                {/* PRICE ROW */}
                <tr className="border-b border-gray-800/50 hover:bg-white/20 transition-all">
                  <td className="py-3.5 align-middle text-xs font-medium text-gray-300 font-mono flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-[#0066FF]" />
                    <span>Standard Store Price</span>
                  </td>
                  {comparisonList.map((product) => {
                    const priceFormatted = currency === 'GHS' 
                      ? `₵ ${product.priceGHS.toLocaleString()}` 
                      : `$ ${product.priceUSD.toLocaleString()}`;
                    return (
                      <td key={product.id} className="py-3.5 px-4 align-middle text-xs font-extrabold text-white">
                        {priceFormatted}
                        <span className="text-[10px] text-gray-500 font-normal block">
                          {currency === 'GHS' ? `($${product.priceUSD})` : `(₵${product.priceGHS.toLocaleString()})`}
                        </span>
                      </td>
                    );
                  })}
                  {comparisonList.length < 3 && Array.from({ length: 3 - comparisonList.length }).map((_, i) => <td key={i} className="py-3.5 px-4" />)}
                </tr>

                {/* 2. GENERAL SPECIFICATIONS CATEGORY */}
                <tr className="border-t border-gray-800 pt-4">
                  <td colSpan={4} className="py-3 font-mono text-[10px] font-extrabold text-amber-500 tracking-wider uppercase bg-amber-500/5 pl-2 rounded-l-md">
                    📐 Dimension & Environment Parameters
                  </td>
                </tr>

                {/* DISPLAY ROW */}
                <tr className="border-b border-gray-800/50 hover:bg-white/20 transition-all">
                  <td className="py-3.5 align-middle text-xs font-medium text-gray-300 font-mono flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>Display Panel Details</span>
                  </td>
                  {comparisonList.map((product) => {
                    const val = getSpecValue(product, ['Display', 'Screen Size', 'Resolution']);
                    return (
                      <td key={product.id} className="py-3.5 px-4 align-middle text-xs text-gray-300">
                        {val}
                      </td>
                    );
                  })}
                  {comparisonList.length < 3 && Array.from({ length: 3 - comparisonList.length }).map((_, i) => <td key={i} className="py-3.5 px-4" />)}
                </tr>

                {/* STORAGE ROW */}
                <tr className="border-b border-gray-800/50 hover:bg-white/20 transition-all">
                  <td className="py-3.5 align-middle text-xs font-medium text-gray-300 font-mono flex items-center space-x-2">
                    <Database className="w-4 h-4 text-indigo-400" />
                    <span>Storage Tier Options</span>
                  </td>
                  {comparisonList.map((product) => {
                    const val = getSpecValue(product, ['Storage', 'Internal Storage', 'Drive Capacity']);
                    return (
                      <td key={product.id} className="py-3.5 px-4 align-middle text-xs text-gray-300">
                        {val}
                      </td>
                    );
                  })}
                  {comparisonList.length < 3 && Array.from({ length: 3 - comparisonList.length }).map((_, i) => <td key={i} className="py-3.5 px-4" />)}
                </tr>

                {/* OS ROW */}
                <tr className="border-b border-gray-800/50 hover:bg-white/20 transition-all">
                  <td className="py-3.5 align-middle text-xs font-medium text-gray-300 font-mono flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span>Operating System (OS)</span>
                  </td>
                  {comparisonList.map((product) => {
                    const val = getSpecValue(product, ['OS', 'Operating System', 'Software']);
                    return (
                      <td key={product.id} className="py-3.5 px-4 align-middle text-xs text-gray-300">
                        {val}
                      </td>
                    );
                  })}
                  {comparisonList.length < 3 && Array.from({ length: 3 - comparisonList.length }).map((_, i) => <td key={i} className="py-3.5 px-4" />)}
                </tr>

                {/* 3. ADDITIONAL DYNAMIC SPECS */}
                {uniqueSpecKeys.length > 0 && (
                  <>
                    <tr className="border-t border-gray-800 pt-4">
                      <td colSpan={4} className="py-3 font-mono text-[10px] font-extrabold text-purple-400 tracking-wider uppercase bg-purple-500/5 pl-2 rounded-l-md">
                        🛠️ Additional Technical Specifications
                      </td>
                    </tr>
                    {uniqueSpecKeys.map((key) => (
                      <tr key={key} className="border-b border-gray-800/50 hover:bg-white/20 transition-all">
                        <td className="py-3.5 align-middle text-xs font-medium text-gray-300 font-mono">
                          {key}
                        </td>
                        {comparisonList.map((product) => {
                          const val = product.specs ? product.specs[key] || 'N/A' : 'N/A';
                          return (
                            <td key={product.id} className="py-3.5 px-4 align-middle text-xs text-gray-450">
                              {val}
                            </td>
                          );
                        })}
                        {comparisonList.length < 3 && Array.from({ length: 3 - comparisonList.length }).map((_, i) => <td key={i} className="py-3.5 px-4" />)}
                      </tr>
                    ))}
                  </>
                )}

                {/* STOCK & RATING RATIO */}
                <tr className="border-t border-gray-800 pt-4">
                  <td colSpan={4} className="py-3 font-mono text-[10px] font-extrabold text-gray-400 tracking-wider uppercase bg-gray-800/20 pl-2 rounded-l-md">
                    🎖️ Rating & Logistics Details
                  </td>
                </tr>

                {/* RATING ROW */}
                <tr className="border-b border-gray-800/50 hover:bg-white/20 transition-all">
                  <td className="py-3.5 align-middle text-xs font-medium text-gray-300 font-mono flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>Customer Rating</span>
                  </td>
                  {comparisonList.map((product) => (
                    <td key={product.id} className="py-3.5 px-4 align-middle text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-amber-400 text-sm">{product.rating.toFixed(1)}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({product.reviewsCount} reviews)</span>
                      </div>
                    </td>
                  ))}
                  {comparisonList.length < 3 && Array.from({ length: 3 - comparisonList.length }).map((_, i) => <td key={i} className="py-3.5 px-4" />)}
                </tr>

                {/* STOCK STATUS ROW */}
                <tr className="border-b border-gray-800/50 hover:bg-white/20 transition-all">
                  <td className="py-3.5 align-middle text-xs font-medium text-gray-300 font-mono flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>Warehouse Availability</span>
                  </td>
                  {comparisonList.map((product) => {
                    const isOutOfStock = product.stock === 0;
                    const isLowStock = product.stock > 0 && product.stock <= 5;
                    return (
                      <td key={product.id} className="py-3.5 px-4 align-middle text-xs">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-500 font-mono font-bold uppercase">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-orange-500/10 text-orange-400 font-mono font-bold uppercase animate-pulse">Low Stock ({product.stock})</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-500 font-mono font-bold uppercase">In Stock ({product.stock})</span>
                        )}
                      </td>
                    );
                  })}
                  {comparisonList.length < 3 && Array.from({ length: 3 - comparisonList.length }).map((_, i) => <td key={i} className="py-3.5 px-4" />)}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-black/40 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-xl transition"
            id="close-compare-desk-btn"
          >
            Close Comparison Desk
          </button>
        </div>
      </motion.div>
    </div>
  );
}
