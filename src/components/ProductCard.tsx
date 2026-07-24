/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Heart, ShoppingCart, Sparkles, GitCompare, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { handleImageError } from '../utils/imageFallback';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  currency: 'GHS' | 'USD';
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onOpenAR?: (product: Product) => void;
  onToggleCompare?: (product: Product) => void;
  isComparing?: boolean;
  onQuickBuy?: (product: Product) => void;
}

export default function ProductCard({
  product,
  currency,
  onViewDetails,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  onOpenAR,
  onToggleCompare,
  isComparing = false,
  onQuickBuy,
}: ProductCardProps) {
  const displayPrice = currency === 'GHS' 
    ? `₵ ${product.priceGHS.toLocaleString()}` 
    : `$ ${product.priceUSD.toLocaleString()}`;

  const isLowStock = product.stock > 0 && product.stock < 5;
  const isOutOfStock = product.stock === 0;

  return (
    <motion.div 
      className={`group relative rounded-xl border bg-white dark:bg-[#121212] overflow-hidden transition-colors duration-300 flex flex-col justify-between ${
        product.isFeatured 
          ? 'border-indigo-500/40 dark:border-indigo-500/40 shadow-sm ring-1 ring-indigo-500/20' 
          : 'border-gray-100 dark:border-gray-800'
      }`}
      id={`product-card-${product.id}`}
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={{
        rest: { 
          scale: 1, 
          y: 0,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" 
        },
        hover: { 
          scale: 1.02, 
          y: -6,
          boxShadow: "0 20px 35px -10px rgba(0, 0, 0, 0.12), 0 10px 20px -5px rgba(0, 0, 0, 0.08)" 
        }
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      {/* Badges & Actions Trigger */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          {product.isFeatured && (
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[9px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded uppercase shadow-sm">
              ✨ FEATURED
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-[#0066FF] text-white text-[9px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded uppercase shadow-sm">
              BESTSELLER
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-amber-400 text-gray-900 text-[9px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded uppercase shadow-sm">
              NEW ARRIVAL
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-500 text-white text-[9px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded uppercase shadow-sm">
              OUT OF STOCK
            </span>
          )}
          {isLowStock && (
            <motion.span 
              className="bg-orange-500 text-white text-[9px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded uppercase shadow-sm"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.9, 1, 0.9]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              ⚠️ Low Stock: {product.stock} left
            </motion.span>
          )}
          <AnimatePresence>
            {isComparing && (
              <motion.span 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 15 }}
                className="bg-indigo-600 text-white text-[9px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded uppercase shadow-md flex items-center gap-1 self-start"
              >
                <GitCompare className="w-2.5 h-2.5" /> Comparing
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center space-x-1.5">
          {onToggleCompare && (
            <label
              id={`compare-checkbox-label-${product.id}`}
              className={`p-1.5 px-2.5 rounded-full border backdrop-blur-md transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-center ${
                isComparing 
                  ? 'bg-indigo-600/10 text-indigo-500 border-indigo-500/20 scale-105' 
                  : 'bg-white/80 dark:bg-black/80 text-gray-400 hover:text-indigo-500 hover:scale-105 border-gray-100 dark:border-gray-800'
              }`}
              title={isComparing ? "Remove from comparison" : "Add to comparison"}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={isComparing}
                onChange={() => onToggleCompare(product)}
                className="sr-only"
              />
              <div className="flex items-center space-x-1.5">
                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all duration-200 ${
                  isComparing 
                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                    : 'border-gray-400 dark:border-gray-600 bg-transparent'
                }`}>
                  {isComparing ? (
                    <motion.svg
                      className="w-2.5 h-2.5 stroke-current"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </motion.svg>
                  ) : null}
                </div>
                <span className="text-[10px] font-bold font-mono tracking-tight select-none">Compare</span>
              </div>
            </label>
          )}

          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            id={`wishlist-toggle-${product.id}`}
            className={`p-2 rounded-full border border-gray-100 dark:border-gray-800 backdrop-blur-md transition-all duration-200 shadow-sm ${
              isWishlisted 
                ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                : 'bg-white/80 dark:bg-black/80 text-gray-400 hover:text-red-500'
            }`}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.12 }}
          >
            <motion.div
              animate={{ 
                scale: isWishlisted ? [1, 1.35, 1] : 1,
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 15 
              }}
              className="flex items-center justify-center"
            >
              <Heart 
                className={`w-4 h-4 transition-colors duration-200 ${
                  isWishlisted ? 'fill-current text-red-500' : 'fill-none'
                }`} 
              />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Image Gallery Trigger */}
      <div 
        onClick={() => onViewDetails(product)}
        className="relative pt-[100%] cursor-pointer overflow-hidden bg-gray-50 dark:bg-black/40"
      >
        <motion.img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-4"
          loading="lazy"
          onError={handleImageError}
          variants={{
            rest: { 
              scale: 1, 
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.06)) brightness(0.96)" 
            },
            hover: { 
              scale: 1.08, 
              filter: "drop-shadow(0 12px 20px rgba(0, 0, 0, 0.18)) brightness(1.02)" 
            }
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        />
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {product.brand} • {product.category}
          </span>
          <h3 
            onClick={() => onViewDetails(product)}
            className="text-sm font-semibold mt-1 text-gray-900 dark:text-white line-clamp-1 hover:text-[#0066FF] cursor-pointer transition-colors"
          >
            {product.name}
          </h3>
          
          {/* Star Ratings */}
          <div className="flex items-center space-x-1 mt-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] text-gray-400">
              ({product.reviewsCount} reviews)
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Price & Cart Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-gray-400 block">PRICE</span>
            <span className="text-base font-bold text-[#0066FF] dark:text-[#0066FF]">
              {displayPrice}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {onOpenAR && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAR(product);
                }}
                id={`ar-view-${product.id}`}
                className="px-2 py-1.5 text-xs font-semibold text-amber-500 hover:text-amber-600 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-50 dark:hover:bg-amber-950/10 rounded-lg transition-all flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95"
                title="Visualize in 3D Space via Augmented Reality"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>AR</span>
              </button>
            )}
            <button
              onClick={() => onViewDetails(product)}
              className="px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              Info
            </button>
            <button
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                if (onQuickBuy) onQuickBuy(product);
              }}
              id={`quick-buy-${product.id}`}
              className="px-2 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-md flex items-center gap-1 active:scale-95 shrink-0"
              title="Buy instantly"
            >
              <Zap className="w-3 h-3 text-white fill-current" />
              <span>Buy</span>
            </button>
            <button
              disabled={isOutOfStock}
              onClick={() => onAddToCart(product)}
              id={`add-to-cart-${product.id}`}
              className="p-1.5 rounded-lg bg-[#0066FF] hover:bg-[#0055DD] disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-white shadow-lg shadow-[#0066FF]/10 active:scale-95 transition-all"
              title={isOutOfStock ? 'Out of stock' : 'Add to Cart'}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Hover Quick-Glance Overlay */}
      <div 
        id={`product-card-hover-overlay-${product.id}`}
        className="absolute inset-x-0 bottom-0 bg-white/95 dark:bg-[#151515]/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-850 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20 hidden md:flex flex-col justify-between min-h-[145px] shadow-2xl"
      >
        <div className="space-y-1.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider block">PRICE SUMMARY</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-base font-black text-[#0066FF] dark:text-[#0066FF]">
                  {displayPrice}
                </span>
                <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                  {currency === 'GHS' 
                    ? `($${product.priceUSD.toLocaleString()})` 
                    : `(₵${product.priceGHS.toLocaleString()})`}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider block">STATUS</span>
              <span className={`text-[11px] font-bold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-green-500'}`}>
                {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low (${product.stock})` : 'In Stock'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-[10px] text-gray-500 dark:text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] animate-pulse shrink-0"></span>
            <span className="font-medium">Ready for Express Accra Dispatch</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800/40">
          {onOpenAR && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAR(product);
              }}
              id={`quick-ar-${product.id}`}
              className="p-2 text-amber-500 hover:text-amber-600 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-50 dark:hover:bg-amber-950/10 rounded-lg transition-all flex items-center justify-center gap-1 shrink-0"
              title="Visualize in AR"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
            </button>
          )}
          <button
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            id={`quick-add-${product.id}`}
            className="flex-1 py-2 px-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 text-gray-700 dark:text-gray-300 text-xs font-bold active:scale-95 transition-all flex items-center justify-center space-x-1"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
          <button
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickBuy) onQuickBuy(product);
            }}
            id={`quick-buy-hover-${product.id}`}
            className="flex-1 py-2 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Quick Buy</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
