/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Heart, Hammer, RefreshCw, User, ShieldAlert, BookOpen, Sun, Moon, Globe, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currency: 'GHS' | 'USD';
  setCurrency: (c: 'GHS' | 'USD') => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  cartCount: number;
  wishlistCount: number;
  openCart: () => void;
  openWishlist: () => void;
  onOpenAdmin: () => void;
  onOpenCustomerDashboard: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  currency,
  setCurrency,
  isDarkMode,
  setIsDarkMode,
  cartCount,
  wishlistCount,
  openCart,
  openWishlist,
  onOpenAdmin,
  onOpenCustomerDashboard,
}: NavbarProps) {
  const [isBouncing, setIsBouncing] = useState(false);
  const prevCartCountRef = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 500);
      return () => clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  const navItems = [
    { id: 'shop', label: 'Store', icon: Smartphone },
    { id: 'repair', label: 'Repairs', icon: Hammer },
    { id: 'tradein', label: 'Trade-In', icon: RefreshCw },
    { id: 'blog', label: 'Tech Blog', icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-opacity-70 border-b transition-colors duration-300 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0B0B]/90 text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => setCurrentTab('shop')} 
            className="flex items-center space-x-2 cursor-pointer group"
            id="nav-logo"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#0066FF] to-[#00CCFF] flex items-center justify-center text-white font-bold shadow-lg shadow-[#0066FF]/20 group-hover:scale-105 transition-transform duration-200">
              ⚡
            </div>
            <div>
              <span className="font-sans font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-[#0066FF] dark:from-white dark:via-gray-100 dark:to-[#0066FF]">
                IMMORTAL
              </span>
              <span className="block text-[9px] font-mono tracking-widest text-[#0066FF] uppercase font-bold">
                ELECTRONICS
              </span>
            </div>
          </div>

          {/* Nav Items - Center */}
          <div className="hidden md:flex space-x-1 lg:space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  id={`nav-item-${item.id}`}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Utility - Right */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Currency Selector */}
            <button
              onClick={() => setCurrency(currency === 'GHS' ? 'USD' : 'GHS')}
              title="Change Currency"
              id="currency-toggle"
              className="flex items-center space-x-1 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-mono font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <Globe className="w-3.5 h-3.5 text-[#0066FF]" />
              <span>{currency === 'GHS' ? '₵ GHS' : '$ USD'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Theme"
              id="theme-toggle"
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Wishlist */}
            <button
              onClick={openWishlist}
              title="Wishlist"
              id="wishlist-btn"
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 relative"
            >
              <Heart className="w-4 h-4 hover:text-red-500 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <motion.button
              onClick={openCart}
              title="Shopping Cart"
              id="cart-btn"
              className="p-2 rounded-lg bg-[#0066FF] hover:bg-[#0055DD] text-white relative shadow-lg shadow-[#0066FF]/20"
              animate={isBouncing ? {
                scale: [1, 1.25, 0.9, 1.1, 1],
                rotate: [0, -10, 10, -5, 5, 0],
              } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-gray-900 animate-pulse">
                  {cartCount}
                </span>
              )}
            </motion.button>

            {/* Account Dashboard Toggle */}
            <button
              onClick={onOpenCustomerDashboard}
              title="Customer Account"
              id="account-btn"
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Admin Backdoor Dashboard Toggle */}
            <button
              onClick={onOpenAdmin}
              title="Staff / Admin Dashboard"
              id="admin-btn"
              className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar Tab Strip */}
      <div className="md:hidden flex justify-around border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-[#0B0B0B]/95 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              id={`mobile-nav-${item.id}`}
              className={`flex flex-col items-center space-y-0.5 text-xs ${
                isActive ? 'text-[#0066FF]' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
