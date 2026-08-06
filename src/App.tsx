/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Trash2, X, Percent, Check, AlertCircle, Phone, MapPin, CreditCard, 
  Sparkles, ShieldCheck, Heart, ArrowRight, HelpCircle, Building2, GitCompare,
  Copy, Search, Info, QrCode, Mic, MicOff, Share2, ArrowUpDown, Sliders, Filter,
  Loader2, ChevronLeft, ChevronRight, ArrowUp, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import { handleImageError } from './utils/imageFallback';
import ProductDetailModal from './components/ProductDetailModal';
import RepairBooking from './components/RepairBooking';
import TradeInSystem from './components/TradeInSystem';
import BlogSystem from './components/BlogSystem';
import AIChatbot from './components/AIChatbot';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import ARViewModal from './components/ARViewModal';
import BulkInquiryModal from './components/BulkInquiryModal';
import ProductComparisonModal from './components/ProductComparisonModal';
import QRScannerModal from './components/QRScannerModal';
import LegalHubModal from './components/LegalHubModal';
import Confetti from './components/Confetti';
import SystemCheck from './components/SystemCheck';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Product, BlogPost, Coupon, Order, RepairRequest, TradeInRequest, CartItem, BulkInquiry } from './types';
import { useDataStore } from './hooks/useDataStore';
import { STORE_CATEGORIES, CATEGORY_NAMES, isCategoryMatch, getCategoryConfig } from './constants/categories';
import CategoryButton from './components/CategoryButton';

// --- Form Validation Helpers ---
function getNameError(name: string): string | null {
  if (!name.trim()) return "Recipient name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters long";
  if (!/^[a-zA-Z\s\-'\u00C0-\u00FF]+$/.test(name.trim())) return "Name can only contain letters, spaces, hyphens";
  return null;
}

function getPhoneError(phone: string): string | null {
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  if (!clean) return "Phone number is required";
  
  if (!/^\+?[0-9]+$/.test(clean)) {
    return "Phone number can only contain numbers, spaces, hyphens, or a leading '+'";
  }

  if (clean.startsWith('0')) {
    if (clean.length !== 10) {
      return `Ghanaian number must be exactly 10 digits (currently ${clean.length})`;
    }
    const prefix = clean.substring(0, 3);
    const validPrefixes = ['024', '054', '055', '059', '053', '025', '020', '050', '026', '056', '027', '057', '023', '028'];
    if (!validPrefixes.includes(prefix)) {
      return `Unknown Ghana prefix "${prefix}". Expected standard prefixes like 024, 020, 026, etc.`;
    }
  } else if (clean.startsWith('+233')) {
    if (clean.length !== 13) {
      return `Ghanaian number with +233 must be exactly 13 characters (currently ${clean.length})`;
    }
    const ghPrefix = '0' + clean.substring(4, 6);
    const validPrefixes = ['024', '054', '055', '059', '053', '025', '020', '050', '026', '056', '027', '057', '023', '028'];
    if (!validPrefixes.includes(ghPrefix)) {
      return `Unknown Ghana prefix (+233 ${clean.substring(4, 6)}...)`;
    }
  } else if (clean.startsWith('233')) {
    if (clean.length !== 12) {
      return `Ghanaian number with 233 must be exactly 12 digits (currently ${clean.length})`;
    }
    const ghPrefix = '0' + clean.substring(3, 5);
    const validPrefixes = ['024', '054', '055', '059', '053', '025', '020', '050', '026', '056', '027', '057', '023', '028'];
    if (!validPrefixes.includes(ghPrefix)) {
      return `Unknown Ghana prefix (233 ${clean.substring(3, 5)}...)`;
    }
  } else {
    return "Ghanaian phone number must start with 0, +233, or 233";
  }

  return null;
}

function getPhoneOperator(phone: string): { name: 'MTN MoMo' | 'Telecel Cash' | 'AT Money', brand: string, color: string } | null {
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  let localNum = '';
  if (clean.startsWith('0')) {
    localNum = clean;
  } else if (clean.startsWith('+233')) {
    localNum = '0' + clean.substring(4);
  } else if (clean.startsWith('233')) {
    localNum = '0' + clean.substring(3);
  }

  if (localNum.length >= 3) {
    const prefix = localNum.substring(0, 3);
    const mtnPrefixes = ['024', '054', '055', '059', '053', '025'];
    const telecelPrefixes = ['020', '050'];
    const atPrefixes = ['026', '056', '027', '057', '023', '028'];

    if (mtnPrefixes.includes(prefix)) {
      return { name: 'MTN MoMo', brand: 'MTN Mobile Money', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400' };
    }
    if (telecelPrefixes.includes(prefix)) {
      return { name: 'Telecel Cash', brand: 'Telecel Cash', color: 'text-red-500 bg-red-500/10 border-red-500/20 dark:text-red-400' };
    }
    if (atPrefixes.includes(prefix)) {
      return { name: 'AT Money', brand: 'AT Money', color: 'text-teal-600 bg-teal-500/10 border-teal-500/20 dark:text-teal-400' };
    }
  }
  return null;
}

function getEmailError(email: string): string | null {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address (e.g. user@example.com)";
  }
  return null;
}

function getAddressError(address: string): string | null {
  if (!address.trim()) return "Delivery address is required";
  if (address.trim().length < 5) return "Please enter a specific street address (min 5 characters)";
  return null;
}

function getEstimatedDeliveryText(option: 'Standard Accra Dispatch' | 'Expedited Motorcycle Courier' | 'In-Store Pickup') {
  const now = new Date();
  const format = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (option === 'Expedited Motorcycle Courier') {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return {
      dateString: `Tomorrow, ${format(tomorrow)}`,
      label: 'Expedited next-day cycle courier directly to your doorstep.',
      badge: 'Expedited (+1 Day)',
      colorClass: 'text-amber-600 bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20'
    };
  } else if (option === 'In-Store Pickup') {
    return {
      dateString: 'Today (Ready in 2 hours)',
      label: 'Collect in-person immediately from our Accra store branch.',
      badge: 'Instant Pick-Up',
      colorClass: 'text-green-600 bg-green-500/5 dark:bg-green-500/10 border-green-500/20'
    };
  } else {
    // Standard Accra Dispatch (+3 days)
    const standardDate = new Date(now);
    standardDate.setDate(now.getDate() + 3);
    return {
      dateString: `${format(standardDate)}`,
      label: 'Standard warehouse sorting and ground carrier delivery.',
      badge: 'Standard (+3 Days)',
      colorClass: 'text-[#0066FF] bg-[#0066FF]/5 dark:bg-[#0066FF]/10 border-[#0066FF]/20'
    };
  }
}

// --- Motion Variants for Grid and Product Card Animations ---
const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    }
  }
};

const productCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 120,
      damping: 14
    }
  }
};

export default function App() {
  // Navigation & Theme State
  const [currentTab, setCurrentTab] = useState<'shop' | 'repair' | 'tradein' | 'blog'>('shop');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currency, setCurrency] = useState<'GHS' | 'USD'>('GHS');

  // API Hydrated States from centralized useDataStore hook
  const {
    products,
    setProducts,
    blogs,
    setBlogs,
    coupons,
    setCoupons,
    orders,
    setOrders,
    repairs,
    setRepairs,
    tradeins,
    setTradeInRequests,
    bulkInquiries,
    setBulkInquiries,
    isLoading,
    error,
    fetchInitialData,
    forceRefreshCatalog,
    handleBookBulkInquiry,
    handleUpdateBulkInquiry,
    handleBookRepair,
    handleTrackRepair,
    handleTradeInSubmit,
    handleTrackTradeIn,
    handleBlogComment,
    handleBlogLike,
    handleCreateBlog,
    handleDeleteBlog,
    handleCreateProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleUpdateStock,
    handleUpdateRepair,
    handleUpdateTradeIn,
    handleUpdateOrder,
    handleCreateCoupon
  } = useDataStore();

  // Wishlist State
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>(() => {
    try {
      return localStorage.getItem('immortal_shop_sort_by') || 'default';
    } catch {
      return 'default';
    }
  });

  // Save sort preference to localStorage
  useEffect(() => {
    try {
      if (sortBy === 'default') {
        localStorage.removeItem('immortal_shop_sort_by');
      } else {
        localStorage.setItem('immortal_shop_sort_by', sortBy);
      }
    } catch (e) {
      console.warn('Could not save sort preference to localStorage:', e);
    }
  }, [sortBy]);

  const handleResetSort = () => {
    setSortBy('default');
    try {
      localStorage.removeItem('immortal_shop_sort_by');
    } catch (e) {
      console.warn('Could not remove sort preference from localStorage:', e);
    }
  };

  // Curated Collections States
  const [customCollections, setCustomCollections] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('All');
  const collectionsCarouselRef = React.useRef<HTMLDivElement>(null);

  const scrollCollections = (direction: 'left' | 'right') => {
    if (collectionsCarouselRef.current) {
      const cardWidth = window.innerWidth < 640 ? 232 : 266;
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      collectionsCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Cart Drawer & Coupon State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quickBuyItem, setQuickBuyItem] = useState<CartItem | null>(null);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Checkout Flow Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [saveDetails, setSaveDetails] = useState(() => {
    return localStorage.getItem('immortal_save_details') === 'true';
  });
  const [checkoutName, setCheckoutName] = useState(() => {
    return localStorage.getItem('immortal_checkout_name') || '';
  });
  const [checkoutPhone, setCheckoutPhone] = useState(() => {
    return localStorage.getItem('immortal_checkout_phone') || '';
  });
  const [checkoutEmail, setCheckoutEmail] = useState(() => {
    return localStorage.getItem('immortal_checkout_email') || '';
  });
  const [checkoutAddress, setCheckoutAddress] = useState(() => {
    return localStorage.getItem('immortal_checkout_address') || '';
  });
  const [checkoutCity, setCheckoutCity] = useState(() => {
    return localStorage.getItem('immortal_checkout_city') || 'Accra';
  });
  const [deliveryOption, setDeliveryOption] = useState<'Standard Accra Dispatch' | 'Expedited Motorcycle Courier' | 'In-Store Pickup'>('Standard Accra Dispatch');
  const [paymentProvider, setPaymentProvider] = useState<'MTN MoMo' | 'Telecel Cash' | 'Credit Card' | 'Cash on Delivery'>('MTN MoMo');
  const [paymentGateway, setPaymentGateway] = useState<'Paystack' | 'Flutterwave'>('Paystack');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [failedGateways, setFailedGateways] = useState<string[]>([]);
  const [paymentAttempts, setPaymentAttempts] = useState(0);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutSuccessCode, setCheckoutSuccessCode] = useState<string | null>(null);

  // Real-time Form Validation states
  const [checkoutNameTouched, setCheckoutNameTouched] = useState(false);
  const [checkoutPhoneTouched, setCheckoutPhoneTouched] = useState(false);
  const [checkoutEmailTouched, setCheckoutEmailTouched] = useState(false);
  const [checkoutAddressTouched, setCheckoutAddressTouched] = useState(false);

  // Comparison & Modal States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [arProduct, setArProduct] = useState<Product | null>(null);
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isLegalHubOpen, setIsLegalHubOpen] = useState(false);
  const [selectedLegalTab, setSelectedLegalTab] = useState('terms');

  // Search Assistance & Insights States
  const [isSearchAssistOpen, setIsSearchAssistOpen] = useState(false);
  const [showSearchInsights, setShowSearchInsights] = useState(false);
  const [searchCopyFeedback, setSearchCopyFeedback] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const [shareFeedback, setShareFeedback] = useState(false);

  // Voice Search / Speech Recognition States
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [voiceSpeechText, setVoiceSpeechText] = useState('');
  const [voiceSearchError, setVoiceSearchError] = useState<string | null>(null);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  // Geolocation States
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetectionError, setLocationDetectionError] = useState<string | null>(null);
  const [locationDetectionSuccess, setLocationDetectionSuccess] = useState<string | null>(null);

  // Trending Keywords state with counts and trends
  const [trendingKeywords, setTrendingKeywords] = useState([
    { label: 'iPhone 15', value: 'iPhone 15', count: 342, trend: 'up' as 'up' | 'down' | 'stable' },
    { label: 'Galaxy S24', value: 'S24', count: 215, trend: 'up' as 'up' | 'down' | 'stable' },
    { label: 'Pixel 8', value: 'Pixel 8', count: 189, trend: 'stable' as 'up' | 'down' | 'stable' },
    { label: 'MacBook', value: 'MacBook', count: 403, trend: 'up' as 'up' | 'down' | 'stable' },
    { label: 'Anker', value: 'Anker', count: 156, trend: 'down' as 'up' | 'down' | 'stable' },
  ]);

  const registerTrendInteraction = (term: string) => {
    if (!term) return;
    setTrendingKeywords(prev => {
      return prev.map(item => {
        const isMatch = term.toLowerCase().includes(item.value.toLowerCase()) || 
                        item.value.toLowerCase().includes(term.toLowerCase());
        if (isMatch) {
          const newCount = item.count + 1;
          let newTrend: 'up' | 'down' | 'stable' = item.trend;
          if (newCount > item.count) {
            newTrend = 'up';
          }
          return {
            ...item,
            count: newCount,
            trend: newTrend
          };
        }
        return item;
      });
    });
  };

  // Recent Searches State & Persistence Function
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('immortal_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, 3);
      try {
        localStorage.setItem('immortal_recent_searches', JSON.stringify(next));
      } catch (e) {
        console.error('Error saving recent searches:', e);
      }
      return next;
    });
  };

  // Auto-save search queries with custom debounce
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) return;

    const timer = setTimeout(() => {
      saveRecentSearch(trimmed);
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset active suggestion index when searchQuery changes or suggestions close
  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [searchQuery, showInlineSuggestions]);

  const getInlineSuggestions = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    
    const results: {
      id: string;
      text: string;
      type: 'product' | 'brand';
      subtitle?: string;
      priceGHS?: number;
      priceUSD?: number;
      product?: Product;
    }[] = [];
    const seen = new Set<string>();

    // First find brand matches
    const productsArray = Array.isArray(products) ? products : [];
    productsArray.forEach(p => {
      if (!p || !p.brand) return;
      const brandLower = p.brand.toLowerCase();
      if (brandLower.includes(query) && !seen.has(`brand:${p.brand}`)) {
        seen.add(`brand:${p.brand}`);
        results.push({
          id: `brand-${p.brand}`,
          text: p.brand,
          type: 'brand',
          subtitle: 'Brand'
        });
      }
    });

    // Then find product matches
    productsArray.forEach(p => {
      if (!p || !p.name) return;
      const nameLower = p.name.toLowerCase();
      if (nameLower.includes(query) && !seen.has(`prod:${p.id}`)) {
        seen.add(`prod:${p.id}`);
        results.push({
          id: `prod-${p.id}`,
          text: p.name,
          type: 'product',
          subtitle: p.category || '',
          priceGHS: p.priceGHS || 0,
          priceUSD: p.priceUSD || 0,
          product: p
        });
      }
    });

    return results.slice(0, 6);
  };

  // Toggle Voice-to-Text Speech Recognition
  const toggleVoiceSearch = () => {
    if (isVoiceSearchActive) {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch (e) {
          console.warn("Error stopping recognition:", e);
        }
      }
      setIsVoiceSearchActive(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSearchError("Web Speech API is not natively supported in this browser environment. Showing voice simulator mode.");
      setIsVoiceSearchActive(true);
      setVoiceSpeechText('');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsVoiceSearchActive(true);
        setVoiceSpeechText('');
        setVoiceSearchError(null);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition warning/error:", event.error);
        if (event.error === 'not-allowed') {
          setVoiceSearchError("Microphone access denied. Try the diagnostic voice-to-text simulator options below.");
        } else {
          setVoiceSearchError(`Speech error: ${event.error}. Use the simulator buttons below.`);
        }
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => (result as any)[0])
          .map((result: any) => result.transcript)
          .join('');
        setVoiceSpeechText(transcript);
        setSearchQuery(transcript);
        setIsSearchAssistOpen(true);
      };

      recognition.onend = () => {
        setIsVoiceSearchActive(false);
      };

      setRecognitionInstance(recognition);
      recognition.start();
    } catch (err: any) {
      console.warn("Failed to initiate Web Speech API:", err);
      setVoiceSearchError("Microphone startup failed. Feel free to use the quick simulation options.");
      setIsVoiceSearchActive(true);
      setVoiceSpeechText('');
    }
  };

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationDetectionError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingLocation(true);
    setLocationDetectionError(null);
    setLocationDetectionSuccess(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'ImmortalElectronicsECommerceApp/1.0'
              }
            }
          );
          if (!response.ok) throw new Error("Reverse geocoding request failed.");
          const data = await response.json();
          
          if (data && data.address) {
            const addr = data.address;
            const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || "Accra";
            const region = addr.region || addr.state || addr.county || "Greater Accra";
            const suburb = addr.suburb || addr.neighbourhood || addr.quarter || "";
            const road = addr.road || "";
            
            setCheckoutCity(city);
            
            // Build suggested street address
            let suggestedAddress = '';
            if (road) suggestedAddress += road;
            if (suburb) {
              suggestedAddress += (suggestedAddress ? `, ${suburb}` : suburb);
            }
            if (region) {
              suggestedAddress += (suggestedAddress ? `, ${region}` : region);
            }
            
            if (suggestedAddress) {
              setCheckoutAddress(suggestedAddress);
            }
            
            setLocationDetectionSuccess(`Detected: ${city}, ${region}`);
          } else {
            setCheckoutCity("Accra");
            setCheckoutAddress(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            setLocationDetectionSuccess("Location detected via GPS coordinates");
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          setCheckoutCity("Accra");
          setCheckoutAddress(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setLocationDetectionSuccess("Detected via GPS (reverse lookup failed)");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMsg = "Could not detect location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location access denied. Please enable location permissions.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Position unavailable. Please try again.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Location request timed out. Please try again.";
        }
        
        setLocationDetectionError(`${errorMsg} Click below to simulate Ghanaian GPS.`);
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };



  // Real-time validation derived states
  const nameError = getNameError(checkoutName);
  const phoneError = getPhoneError(checkoutPhone);
  const emailError = getEmailError(checkoutEmail);
  const addressError = getAddressError(checkoutAddress);
  const phoneOperator = getPhoneOperator(checkoutPhone);

  const hasValidationErrors = !!(nameError || phoneError || emailError || addressError);
  const hasActiveErrors = !!(
    (checkoutNameTouched && nameError) ||
    (checkoutPhoneTouched && phoneError) ||
    (checkoutEmailTouched && emailError) ||
    (checkoutAddressTouched && addressError)
  );

  const isFormComplete = checkoutName.trim().length > 0 && 
                         checkoutPhone.trim().length > 0 && 
                         checkoutAddress.trim().length > 0;

  const isSubmitDisabled = hasValidationErrors || isCheckoutLoading;

  // Reset touched fields and payment states on modal close
  useEffect(() => {
    if (!isCheckoutOpen) {
      setCheckoutNameTouched(false);
      setCheckoutPhoneTouched(false);
      setCheckoutEmailTouched(false);
      setCheckoutAddressTouched(false);
      setQuickBuyItem(null);
      setPaymentError(null);
      setFailedGateways([]);
      setPaymentAttempts(0);
    }
  }, [isCheckoutOpen]);

  // Auto-detect payment provider from phone prefix
  useEffect(() => {
    if (phoneOperator) {
      if (phoneOperator.name === 'MTN MoMo' && paymentProvider !== 'MTN MoMo') {
        setPaymentProvider('MTN MoMo');
      } else if (phoneOperator.name === 'Telecel Cash' && paymentProvider !== 'Telecel Cash') {
        setPaymentProvider('Telecel Cash');
      }
    }
  }, [checkoutPhone]);

  // Curated Collections Live Sync Loader
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('./lib/firebase');
        const fetchPromise = getDocs(collection(db, 'collections'));
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore fetch timeout')), 3500)
        );
        const colSnap: any = await Promise.race([fetchPromise, timeoutPromise]);
        const cols: any[] = [];
        colSnap.forEach((doc: any) => {
          cols.push({ id: doc.id, ...doc.data() });
        });
        if (cols.length > 0) {
          setCustomCollections(cols);
        } else {
          const defaults = [
            { id: 'col-new-arrivals', name: 'New Arrivals', description: 'Fresh premium stock newly arrived in Accra', productIds: [], isFeaturedHome: true },
            { id: 'col-best-sellers', name: 'Best Sellers', description: 'Most popular customer devices and computers', productIds: [], isFeaturedHome: true },
            { id: 'col-flagship-deals', name: 'Flagship Deals', description: 'Premium discounted offers', productIds: [], isFeaturedHome: true }
          ];
          setCustomCollections(defaults);
        }
      } catch (err) {
        console.warn('Could not fetch custom collections, using LocalStorage fallback:', err);
        const localCols = localStorage.getItem('immortal_custom_collections');
        if (localCols) {
          setCustomCollections(JSON.parse(localCols));
        } else {
          const defaults = [
            { id: 'col-new-arrivals', name: 'New Arrivals', description: 'Fresh premium stock newly arrived in Accra', productIds: [], isFeaturedHome: true },
            { id: 'col-best-sellers', name: 'Best Sellers', description: 'Most popular customer devices and computers', productIds: [], isFeaturedHome: true },
            { id: 'col-flagship-deals', name: 'Flagship Deals', description: 'Premium discounted offers', productIds: [], isFeaturedHome: true }
          ];
          setCustomCollections(defaults);
        }
      }
    };
    fetchCollections();
  }, [isAdminOpen]); // Refetch when admin closes to keep storefront fresh!

  // Check URL parameters for search and product sharing link once products are loaded
  useEffect(() => {
    const productsArray = Array.isArray(products) ? products : [];
    if (productsArray.length > 0) {
      try {
        const params = new URLSearchParams(window.location.search);
        const searchParam = params.get('search');
        const productParam = params.get('product');
        const legalParam = params.get('legal');
        if (searchParam) {
          setSearchQuery(decodeURIComponent(searchParam));
        }
        if (productParam) {
          const matchedProduct = productsArray.find((p: any) => String(p.id) === String(productParam));
          if (matchedProduct) {
            setSelectedProduct(matchedProduct);
          }
        }
        if (legalParam) {
          setSelectedLegalTab(decodeURIComponent(legalParam));
          setIsLegalHubOpen(true);
        }
      } catch (paramErr) {
        console.warn('Could not parse shared URL parameters:', paramErr);
      }
    }
  }, [products]);



  const handleCopySearchQuery = async () => {
    if (!searchQuery) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(searchQuery);
      } else {
        const el = document.createElement('textarea');
        el.value = searchQuery;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setSearchCopyFeedback(true);
      setTimeout(() => setSearchCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to copy search text:', err);
    }
  };

  const copyShareLink = async (url: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2500);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const handleShareSearch = async () => {
    const query = searchQuery.trim();
    const baseUrl = window.location.origin + window.location.pathname;
    
    let shareUrl = baseUrl;
    let shareTitle = 'Immortal Electronics Ghana';
    let shareText = 'Explore authentic electronics, laptop, smartphone trade-ins, and diagnostics at Immortal Electronics Ghana!';

    if (selectedProduct) {
      shareUrl = `${baseUrl}?product=${encodeURIComponent(selectedProduct.id)}`;
      shareTitle = `${selectedProduct.name} - Immortal Electronics`;
      shareText = `Check out the ${selectedProduct.name} (${selectedProduct.brand}) available at Immortal Electronics!`;
    } else if (query) {
      shareUrl = `${baseUrl}?search=${encodeURIComponent(query)}`;
      shareTitle = `Immortal Electronics Search: "${query}"`;
      shareText = `Browse authentic electronics matching "${query}" at Immortal Electronics!`;
    }
    
    const shareData = {
      title: shareTitle,
      text: shareText,
      url: shareUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          copyShareLink(shareUrl);
        }
      }
    } else {
      copyShareLink(shareUrl);
    }
  };

  // Cart Actions
  const handleAddToCart = (product: Product, selectedColor?: string) => {
    const defaultColor = selectedColor || product.colors[0] || 'Default';
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.selectedColor === defaultColor);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id && item.selectedColor === defaultColor
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedColor: defaultColor }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, selectedColor: string | undefined, delta: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.product.id === productId && item.selectedColor === selectedColor) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string, selectedColor: string | undefined) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedColor === selectedColor)));
  };

  const handleReorder = (items: CartItem[]) => {
    let addedCount = 0;
    let outOfStockCount = 0;
    const newCartItems: CartItem[] = [];
    const productsArray = Array.isArray(products) ? products : [];

    items.forEach(item => {
      const liveProduct = productsArray.find(p => p.id === item.product.id);
      if (liveProduct && liveProduct.stock > 0) {
        const qtyToAdd = Math.min(item.quantity, liveProduct.stock);
        newCartItems.push({
          product: liveProduct,
          quantity: qtyToAdd,
          selectedColor: item.selectedColor || liveProduct.colors[0] || 'Default'
        });
        addedCount++;
      } else {
        outOfStockCount++;
      }
    });

    if (newCartItems.length > 0) {
      setCart(prev => {
        let updatedCart = [...prev];
        newCartItems.forEach(newItem => {
          const existingIdx = updatedCart.findIndex(
            item => item.product.id === newItem.product.id && item.selectedColor === newItem.selectedColor
          );
          if (existingIdx > -1) {
            const liveProduct = productsArray.find(p => p.id === newItem.product.id);
            const currentQty = updatedCart[existingIdx].quantity;
            const maxStock = liveProduct ? liveProduct.stock : 99;
            const newQty = Math.min(currentQty + newItem.quantity, maxStock);
            updatedCart[existingIdx] = {
              ...updatedCart[existingIdx],
              quantity: newQty
            };
          } else {
            updatedCart.push(newItem);
          }
        });
        return updatedCart;
      });
      setIsCartOpen(true);
    }

    return { addedCount, outOfStockCount };
  };

  // Wishlist Actions
  const handleToggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Coupon Engine
  const handleApplyCoupon = () => {
    setCouponError(null);
    const code = appliedCouponCode.trim().toUpperCase();
    if (!code) return;

    const matched = coupons.find(c => c.code === code && c.active);
    if (!matched) {
      setCouponError('Invalid or expired coupon code.');
      setActiveCoupon(null);
      return;
    }

    // Min spend validation
    const currentCheckoutItems = quickBuyItem ? [quickBuyItem] : cart;
    const totalGHS = currentCheckoutItems.reduce((sum, item) => sum + item.product.priceGHS * item.quantity, 0);
    if (matched.minSpendGHS && totalGHS < matched.minSpendGHS) {
      setCouponError(`This coupon requires a minimum spend of GHS ${matched.minSpendGHS}.`);
      setActiveCoupon(null);
      return;
    }

    setActiveCoupon(matched);
  };

  // Cart calculations
  const currentCheckoutItems = quickBuyItem ? [quickBuyItem] : cart;
  const deliveryCostGHS = deliveryOption === 'Expedited Motorcycle Courier' ? 55 : deliveryOption === 'In-Store Pickup' ? 0 : 35;
  const subtotalGHS = currentCheckoutItems.reduce((sum, item) => sum + item.product.priceGHS * item.quantity, 0);
  const discountGHS = activeCoupon ? Math.round(subtotalGHS * (activeCoupon.discountPercent / 100)) : 0;
  const finalTotalGHS = Math.max(0, subtotalGHS - discountGHS + deliveryCostGHS);

  const subtotalUSD = Math.round(subtotalGHS / 14.5);
  const discountUSD = activeCoupon ? Math.round(subtotalUSD * (activeCoupon.discountPercent / 100)) : 0;
  const deliveryCostUSD = Math.round(deliveryCostGHS / 14.5);
  const finalTotalUSD = Math.max(0, subtotalUSD - discountUSD + deliveryCostUSD);

  // Checkout Action
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all as touched on submit attempt
    setCheckoutNameTouched(true);
    setCheckoutPhoneTouched(true);
    setCheckoutEmailTouched(true);
    setCheckoutAddressTouched(true);

    if (hasValidationErrors) {
      alert('Please correct the validation errors in the form before submitting.');
      return;
    }

    if (!checkoutName || !checkoutPhone || !checkoutAddress) {
      alert('Please fill out all required shipping fields.');
      return;
    }

    setIsCheckoutLoading(true);
    setPaymentError(null);

    // Simulate Paystack/Flutterwave transaction if it is an online payment method
    const isOnlinePayment = paymentProvider !== 'Cash on Delivery';
    
    if (isOnlinePayment) {
      try {
        // Trigger simulated backend payment charge
        await fetch('/api/payments/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: paymentProvider === 'Credit Card' ? 'Card' : 'Mobile Money',
            provider: paymentProvider === 'Credit Card' ? 'Visa/Mastercard' : paymentProvider,
            amountGHS: finalTotalGHS,
            phoneNumber: checkoutPhone,
          })
        });
      } catch (err) {
        console.warn("Backend charge logging API warning:", err);
      }
    }

    try {
      const orderPayload = {
        customerName: checkoutName,
        customerPhone: checkoutPhone,
        customerEmail: checkoutEmail,
        address: checkoutAddress,
        city: checkoutCity,
        items: currentCheckoutItems,
        totalGHS: finalTotalGHS,
        totalUSD: finalTotalUSD,
        deliveryOption,
        deliveryCostGHS,
        paymentProvider,
        couponApplied: activeCoupon?.code || undefined
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const orderData = res.ok ? await res.json().catch(() => ({})) : {};
      if (orderData.trackingNumber) {
        if (saveDetails) {
          localStorage.setItem('immortal_save_details', 'true');
          localStorage.setItem('immortal_checkout_name', checkoutName);
          localStorage.setItem('immortal_checkout_phone', checkoutPhone);
          localStorage.setItem('immortal_checkout_email', checkoutEmail || '');
          localStorage.setItem('immortal_checkout_address', checkoutAddress);
          localStorage.setItem('immortal_checkout_city', checkoutCity);
        } else {
          localStorage.removeItem('immortal_save_details');
          localStorage.removeItem('immortal_checkout_name');
          localStorage.removeItem('immortal_checkout_phone');
          localStorage.removeItem('immortal_checkout_email');
          localStorage.removeItem('immortal_checkout_address');
          localStorage.removeItem('immortal_checkout_city');
        }
        setCheckoutSuccessCode(orderData.trackingNumber);
        if (quickBuyItem) {
          setQuickBuyItem(null);
        } else {
          setCart([]); // Clear cart
        }
        setActiveCoupon(null);
        setAppliedCouponCode('');
        // Refresh orders
        fetchInitialData();
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during checkout processing.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };



  // Comparison list togglers
  const handleToggleCompare = (product: Product) => {
    setComparisonList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 gadgets at a time.');
        return prev;
      }
      return [...prev, product];
    });
  };

  // Product searches
  const productsArray = Array.isArray(products) ? products : [];
  console.log("PRODUCT DATA RECEIVED:", products);
  if (productsArray.length > 0) {
    console.log("Total products received:", productsArray.length);
    console.log("First product object:", productsArray[0]);
    console.log("Product categories:", Array.from(new Set(productsArray.map(p => p?.category || 'Unknown'))));
    console.log("Product status:", productsArray.map(p => ({ id: p.id, status: p.status || 'Published' })));
    console.log("Product visibility:", productsArray.map(p => ({ id: p.id, isFeatured: p.isFeatured, status: p.status || 'Published' })));
  }
  const filteredProducts = productsArray.filter(p => {
    if (!p) return false;
    // Only show published products on storefront (status defaults to Published if not specified)
    const statusVal = String(p.status || 'Published').trim().toLowerCase();
    const isUnpublished = statusVal === 'draft' || statusVal === 'scheduled' || statusVal === 'archived' || statusVal === 'offline' || statusVal === 'unpublished';
    const isPublished = !isUnpublished;
    if (!isPublished) return false;

    const category = p.category || '';
    const brand = p.brand || '';
    const name = p.name || '';
    const description = p.description || '';
    const stock = typeof p.stock === 'number' ? p.stock : 0;

    const matchesCategory = isCategoryMatch(category, selectedCategory, name, description);
    const matchesBrand = selectedBrand === 'All' || brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchesStock = !inStockOnly || stock > 0;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCollection = selectedCollectionId === 'All' || (() => {
      if (selectedCollectionId === 'col-new-arrivals') {
        return p.isNewArrival || p.isNew;
      }
      if (selectedCollectionId === 'col-best-sellers') {
        return p.isBestSeller;
      }
      if (selectedCollectionId === 'col-flagship-deals') {
        return Boolean(p.isFeatured || p.isBestSeller);
      }
      const activeCol = customCollections.find(c => c.id === selectedCollectionId);
      if (activeCol && activeCol.productIds && activeCol.productIds.length > 0) {
        return activeCol.productIds.includes(p.id);
      }
      return true;
    })();

    return matchesCategory && matchesBrand && matchesStock && matchesSearch && matchesCollection;
  }).sort((a, b) => {
    if (sortBy === 'price-low-high') {
      const priceA = currency === 'GHS' ? a.priceGHS : a.priceUSD;
      const priceB = currency === 'GHS' ? b.priceGHS : b.priceUSD;
      return priceA - priceB;
    }
    if (sortBy === 'price-high-low') {
      const priceA = currency === 'GHS' ? a.priceGHS : a.priceUSD;
      const priceB = currency === 'GHS' ? b.priceGHS : b.priceUSD;
      return priceB - priceA;
    }
    if (sortBy === 'newest') {
      const aArrival = a.isNewArrival ? 2 : a.isNew ? 1 : 0;
      const bArrival = b.isNewArrival ? 2 : b.isNew ? 1 : 0;
      return bArrival - aArrival;
    }
    if (sortBy === 'popular') {
      const priorityA = a.isBestSeller ? 1 : 0;
      const priorityB = b.isBestSeller ? 1 : 0;
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }
      return b.reviewsCount - a.reviewsCount;
    }
    if (sortBy === 'top-rated') {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.reviewsCount - a.reviewsCount;
    }
    // Default Featured sorting
    const isFeaturedA = a.isFeatured ? 1 : 0;
    const isFeaturedB = b.isFeatured ? 1 : 0;
    if (isFeaturedA !== isFeaturedB) {
      return isFeaturedB - isFeaturedA;
    }
    const aNew = a.isNewArrival || a.isNew ? 1 : 0;
    const bNew = b.isNewArrival || b.isNew ? 1 : 0;
    if (aNew !== bNew) {
      return bNew - aNew;
    }
    return b.rating - a.rating;
  });

  // STEP 6: Show the filtered/searched products exactly as requested
  const displayProducts = filteredProducts;

  if (typeof window !== 'undefined' && window.location.pathname === '/system-check') {
    return <SystemCheck />;
  }

  return (
    <div className={`min-h-screen font-sans antialiased text-gray-900 dark:text-gray-100 ${theme === 'dark' ? 'bg-[#0B0B0B] dark' : 'bg-gray-50'}`}>
      
      {/* Top Notification banner */}
      <div className="bg-[#0066FF] text-white text-center py-2 px-4 text-xs font-semibold tracking-wider flex items-center justify-center space-x-2 relative z-50">
        <span>🇬🇭 FREE DELIVERY IN ACCRA | Call/WhatsApp: +233 54 795 6875 | Open Today</span>
      </div>

      {/* Navigation Header */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => setCurrentTab(tab as any)} 
        currency={currency}
        setCurrency={setCurrency}
        isDarkMode={theme === 'dark'}
        setIsDarkMode={(dark) => setTheme(dark ? 'dark' : 'light')}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        openCart={() => setIsCartOpen(true)}
        openWishlist={() => alert('Your wishlist contains ' + wishlist.length + ' saved gadgets.')}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenCustomerDashboard={() => setIsDashboardOpen(true)}
      />

      {/* Main Container */}
      <main className="relative z-10 pb-20">
        
        {/* SHOP TAB VIEW */}
        {currentTab === 'shop' && (
          <div className="space-y-8">
            <Hero 
              onShopClick={() => document.getElementById('shop-section-anchor')?.scrollIntoView({ behavior: 'smooth' })}
              onRepairClick={() => setCurrentTab('repair')}
              onWhatsAppClick={() => window.open('https://wa.me/233244192834', '_blank')}
              onViewOfferClick={() => {
                const nubia = products.find(p => p.id === 'prod-nubia-z80-ultra');
                if (nubia) {
                  setSelectedProduct(nubia);
                } else {
                  // Fallback if not fully loaded/hydrated yet
                  const fallbackNubia = {
                    id: 'prod-nubia-z80-ultra',
                    name: "nubia Z80 Ultra",
                    description: "nubia Z80 Ultra 5G Smartphone Global Version Snapdragon 8 Elite Gen 5 7200mAh 6.85'' 144Hz Oled Display 90W Fast Charg",
                    priceGHS: 15500,
                    priceUSD: 1050,
                    category: 'Smartphones',
                    brand: 'nubia',
                    image: '/src/assets/images/nubia_silver_side_1784297083308.jpg',
                    images: [
                      '/src/assets/images/nubia_silver_side_1784297083308.jpg',
                      '/src/assets/images/nubia_silver_all_views_1784297097731.jpg',
                      '/src/assets/images/nubia_silver_back_flat_1784297108340.jpg'
                    ],
                    rating: 5.0,
                    reviewsCount: 19,
                    specs: {
                      'Refurbished item grade': 'premium',
                      'High-concerned chemical': 'None',
                      'IP68/IP69K': 'Yes',
                      'Charging Power': 'Other',
                      'Other Features': 'Photograph Phone,5G Mobile Phone,Fast Charging Phone',
                      'Screen Refresh Rate': '144 Hz',
                      'Bluetooth Version': 'YES',
                      'Battery Capacity Range': '6000-7499mAh',
                      'Rear Camera Quantity': '3',
                      'Wireless Charging': 'Yes',
                      'NFC': 'Yes',
                      'Biometrics Technology': 'In-Screen Fingerprint Recognition',
                      'Charging Interface Type': 'Type-C',
                      'Front Camera Quantity': '3',
                      '3.5mm Headphone Port': 'Yes',
                      'Fast Charging': 'Supercharge',
                      'Screen Type': 'Full Screen',
                      'Rear Camera Pixel': '50MP,≈ 64 MP',
                      'Front Camera Pixel': '16MP',
                      'Battery Capacity(mAh)': '7200',
                      'Screen Material': 'AMOLED',
                      'Battery Type': 'Not Detachable',
                      'Display Resolution': '144 Hz',
                      'SIM Card Quantity': '2 SIM Card',
                      'Display Size': '6.85',
                      'Operation System': 'Android',
                      'Item Condition': 'New',
                      'Brand Name': 'nubia',
                      'Design': 'Bar',
                      'Touch Screen': 'Yes',
                      'Language': 'Arabic,Polish,German,Russian,French,Korean,Norwegian,Portuguese,Japanese,Turkish,Spanish,Italian,English',
                      'WIFI': 'Yes'
                    },
                    colors: ['16GB 512GB Silver', '12GB 256GB Silver'],
                    isNew: true,
                    stock: 45,
                    isNewArrival: true,
                    isBestSeller: true,
                    status: 'Published'
                  };
                  setSelectedProduct(fallbackNubia as any);
                }
              }}
              currency={currency}
            />
            


            <div id="shop-section-anchor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-4">
              {/* Filter controls */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  {/* Category Buttons */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 max-w-full">
                    {CATEGORY_NAMES.map(catName => {
                      const count = catName === 'All' ? productsArray.length : productsArray.filter(p => isCategoryMatch(p.category, catName, p.name, p.description)).length;
                      const catConfig = getCategoryConfig(catName) || {
                        id: catName,
                        label: catName,
                        icon: '⚡',
                        desc: catName,
                        keywords: []
                      };
                      return (
                        <CategoryButton
                          key={catName}
                          category={catConfig}
                          isSelected={selectedCategory === catName}
                          itemCount={count}
                          variant="pill"
                          onClick={() => setSelectedCategory(catName)}
                        />
                      );
                    })}
                  </div>

                  {/* Sorting Selector dropdown */}
                  <div className="flex items-center space-x-2 shrink-0" id="shop-sorting-control">
                    <div className="relative">
                      <select
                        id="shop-sort-selector"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none pl-8 pr-8 py-1.5 text-xs bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-800 border border-transparent dark:border-transparent rounded-lg font-bold text-gray-750 dark:text-gray-350 focus:outline-none focus:ring-1 focus:ring-[#0066FF] transition-all cursor-pointer shadow-sm min-w-[155px]"
                        title="Sort products list"
                      >
                        <option value="default">Default Featured</option>
                        <option value="popular">Most Popular</option>
                        <option value="top-rated">Top Rated</option>
                        <option value="price-low-high">Price: Low to High</option>
                        <option value="price-high-low">Price: High to Low</option>
                        <option value="newest">Newest Arrivals</option>
                      </select>
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 text-[8px]">
                        ▼
                      </div>
                    </div>
                    <button
                      id="shop-sort-reset-btn"
                      type="button"
                      onClick={handleResetSort}
                      disabled={sortBy === 'default'}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 shadow-sm ${
                        sortBy !== 'default'
                          ? 'bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 cursor-pointer'
                          : 'bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                      }`}
                      title="Reset sorting preference to default"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* Brand Selector Dropdown */}
                  <div className="flex items-center space-x-2 shrink-0" id="shop-brand-control">
                    <div className="relative">
                      <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="appearance-none pl-8 pr-8 py-1.5 text-xs bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-800 border border-transparent dark:border-transparent rounded-lg font-bold text-gray-750 dark:text-gray-350 focus:outline-none focus:ring-1 focus:ring-[#0066FF] transition-all cursor-pointer shadow-sm min-w-[130px]"
                        title="Filter by brand"
                      >
                        <option value="All">All Brands</option>
                        <option value="Apple">Apple</option>
                        <option value="Samsung">Samsung</option>
                        <option value="Google">Google</option>
                        <option value="HP">HP</option>
                        <option value="Sony">Sony</option>
                        <option value="Dell">Dell</option>
                        <option value="SanDisk">SanDisk</option>
                        <option value="Anker">Anker</option>
                      </select>
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
                        <Sliders className="w-3.5 h-3.5" />
                      </div>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 text-[8px]">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* In Stock Only Checkbox/Toggle */}
                  <div className="flex items-center space-x-2 shrink-0" id="shop-stock-control">
                    <label className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-850 px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer select-none text-gray-750 dark:text-gray-350 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all shadow-sm">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-700 text-[#0066FF] focus:ring-[#0066FF] accent-[#0066FF]"
                      />
                      <span>In Stock Only</span>
                    </label>
                  </div>

                  {/* Search Bar */}
                  <div className="flex flex-col space-y-1.5 w-full sm:w-72" id="search-bar-container-with-trending">
                    {/* Trending keywords row */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5" id="trending-keywords-list">
                      <span className="text-[10px] font-black font-mono text-amber-500 uppercase tracking-widest shrink-0">🔥 Trending:</span>
                      {[
                        { label: 'iPhone 15', value: 'iPhone 15' },
                        { label: 'Galaxy S24', value: 'S24' },
                        { label: 'Pixel 8', value: 'Pixel 8' },
                        { label: 'MacBook', value: 'MacBook' },
                        { label: 'Anker', value: 'Anker' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setSearchQuery(item.value);
                            saveRecentSearch(item.value);
                            setIsSearchAssistOpen(true);
                            // Adjust category to All if no match in current category
                            const matchesInCurrent = products.some(p => 
                              (isCategoryMatch(p.category, selectedCategory, p.name, p.description)) &&
                              (p.name.toLowerCase().includes(item.value.toLowerCase()) || 
                               p.brand.toLowerCase().includes(item.value.toLowerCase()))
                            );
                            if (!matchesInCurrent) {
                              setSelectedCategory('All');
                            }
                          }}
                          className={`px-2 py-0.5 bg-gray-100 hover:bg-[#0066FF]/10 hover:text-[#0066FF] dark:bg-gray-850 dark:hover:bg-[#0066FF]/20 text-[10px] font-black font-mono rounded-md text-gray-500 dark:text-gray-400 hover:border-[#0066FF]/30 border border-transparent dark:border-transparent transition-all whitespace-nowrap shrink-0 ${
                            searchQuery.toLowerCase() === item.value.toLowerCase()
                              ? 'bg-[#0066FF]/15 text-[#0066FF] border-[#0066FF]/40'
                              : ''
                          }`}
                          title={`Search "${item.value}"`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full" id="search-bar-parent">
                    {/* Background overlay helper to click-outside to close */}
                    {(isSearchAssistOpen || (showInlineSuggestions && searchQuery.trim() !== '')) && (
                      <div 
                        className="fixed inset-0 z-30 cursor-default" 
                        onClick={() => {
                          setIsSearchAssistOpen(false);
                          setShowInlineSuggestions(false);
                        }} 
                      />
                    )}
                    
                    {/* Share copied feedback toast */}
                    <AnimatePresence>
                      {shareFeedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -5, scale: 0.95 }}
                          className="absolute right-0 -top-8 bg-emerald-500 text-white text-[10px] font-black font-mono px-2.5 py-1 rounded-md shadow-lg z-50 flex items-center gap-1 border border-emerald-400"
                          id="search-share-feedback-toast"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>LINK COPIED!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative z-40 flex items-center">
                      <Search className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search Apple, Samsung, accessories..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowInlineSuggestions(true);
                          if (!isSearchAssistOpen) setIsSearchAssistOpen(true);
                        }}
                        onFocus={() => {
                          setShowInlineSuggestions(true);
                          setIsSearchAssistOpen(true);
                        }}
                        onKeyDown={(e) => {
                          const suggestions = getInlineSuggestions();
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            if (suggestions.length > 0) {
                              setActiveSuggestionIndex(prev => {
                                const nextIndex = prev + 1 >= suggestions.length ? 0 : prev + 1;
                                return nextIndex;
                              });
                            }
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            if (suggestions.length > 0) {
                              setActiveSuggestionIndex(prev => {
                                const nextIndex = prev - 1 < 0 ? suggestions.length - 1 : prev - 1;
                                return nextIndex;
                              });
                            }
                          } else if (e.key === 'Enter') {
                            if (showInlineSuggestions && activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
                              e.preventDefault();
                              const selected = suggestions[activeSuggestionIndex];
                              setSearchQuery(selected.text);
                              saveRecentSearch(selected.text);
                              setShowInlineSuggestions(false);
                              registerTrendInteraction(selected.text);
                              if (selected.type === 'product' && selected.product) {
                                setSelectedProduct(selected.product);
                              }
                            } else {
                              saveRecentSearch(searchQuery);
                              setShowInlineSuggestions(false);
                              setIsSearchAssistOpen(false);
                            }
                          } else if (e.key === 'Escape') {
                            setShowInlineSuggestions(false);
                            setIsSearchAssistOpen(false);
                          }
                        }}
                        className="w-full pl-8 pr-20 py-1.5 text-xs bg-gray-100 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-800 dark:text-white placeholder-gray-450 focus:outline-none focus:ring-1 focus:ring-[#0066FF] transition-all"
                        id="shop-search-field"
                      />
                      
                      {/* Share Results/Product Button */}
                      <button
                        type="button"
                        onClick={handleShareSearch}
                        className="absolute right-14 p-1 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-850 transition"
                        title="Share current search results or product page link"
                        id="search-share-btn"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Voice Hands-free Search Button */}
                      <button
                        type="button"
                        onClick={toggleVoiceSearch}
                        className={`absolute right-8 p-1 rounded transition-all ${
                          isVoiceSearchActive 
                            ? 'text-red-500 bg-red-500/10 animate-bounce scale-110 border border-red-500/20' 
                            : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-850'
                        }`}
                        title="Voice Search (Hands-free)"
                        id="voice-search-mic-btn"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsSearchAssistOpen(!isSearchAssistOpen)}
                        className="absolute right-2.5 p-1 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-850 transition"
                        title="Search Assistance Menu"
                        id="search-assist-toggle"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isSearchAssistOpen ? 'text-[#0066FF] animate-pulse' : ''}`} />
                      </button>
                    </div>

                    {/* Interactive Voice Search Overlay Status Box */}
                    <AnimatePresence>
                      {isVoiceSearchActive && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.95 }}
                          className="absolute left-0 right-0 mt-1.5 p-3.5 bg-black/95 dark:bg-[#0B0B0B] border border-red-500/30 dark:border-red-500/20 rounded-xl flex flex-col space-y-2 z-50 shadow-2xl"
                          id="voice-search-indicator-card"
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs text-red-400 font-mono font-bold uppercase tracking-wider">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                              <span>Voice Search Active</span>
                            </span>
                            <button
                              onClick={() => setIsVoiceSearchActive(false)}
                              className="text-gray-400 hover:text-white font-mono text-[9px] uppercase border border-gray-800 hover:border-gray-700 px-1.5 py-0.5 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                          
                          <div className="p-2 bg-gray-900/50 rounded-lg border border-gray-800 min-h-[40px] flex items-center">
                            {voiceSpeechText ? (
                              <p className="text-xs text-white italic font-medium">"{voiceSpeechText}"</p>
                            ) : (
                              <p className="text-xs text-gray-500 animate-pulse">Listening... Speak now into your microphone</p>
                            )}
                          </div>

                          {voiceSearchError && (
                            <div className="text-[10px] text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20 leading-relaxed font-mono">
                              ⚠️ {voiceSearchError}
                            </div>
                          )}

                          <div className="pt-2 border-t border-gray-800 space-y-1">
                            <span className="text-[9px] text-gray-500 font-mono font-bold uppercase block tracking-wider">Speech Sandbox Simulator:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                'iPhone 15',
                                'S24 Ultra',
                                'MacBook',
                                'Anker Charger',
                                'Sony XM5'
                              ].map((phrase) => (
                                <button
                                  key={phrase}
                                  type="button"
                                  onClick={() => {
                                    setVoiceSpeechText(phrase);
                                    setSearchQuery(phrase);
                                    setIsVoiceSearchActive(false);
                                    setIsSearchAssistOpen(true);
                                  }}
                                  className="px-2 py-0.5 bg-gray-900 hover:bg-[#0066FF] hover:text-white text-gray-400 text-[10px] rounded-md font-mono transition-all border border-gray-850"
                                >
                                  Speak "{phrase}"
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Inline Suggestions Dropdown */}
                    <AnimatePresence>
                      {showInlineSuggestions && searchQuery.trim() !== '' && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          transition={{ duration: 0.1 }}
                          className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-gray-150 dark:divide-gray-800/60"
                          id="search-inline-suggestions-dropdown"
                        >
                          <div className="p-2 bg-gray-50/50 dark:bg-gray-850/40 flex items-center justify-between text-[10px] font-mono font-bold text-gray-400">
                            <span>Suggestions for "{searchQuery}"</span>
                            <span className="text-[9px] uppercase tracking-wider text-[#0066FF] px-1.5 py-0.5 bg-[#0066FF]/10 rounded">Smart Autocomplete</span>
                          </div>

                          <div className="py-1 max-h-64 overflow-y-auto no-scrollbar">
                            {getInlineSuggestions().length === 0 ? (
                              <div className="p-3 text-center text-xs text-gray-400 font-mono">
                                No direct match found. Press Enter to search anyway.
                              </div>
                            ) : (
                              getInlineSuggestions().map((suggestion, idx) => {
                                const isActive = idx === activeSuggestionIndex;
                                return (
                                  <button
                                    key={suggestion.id}
                                    type="button"
                                    id={`inline-suggestion-item-${idx}`}
                                    onClick={() => {
                                      setSearchQuery(suggestion.text);
                                      saveRecentSearch(suggestion.text);
                                      setShowInlineSuggestions(false);
                                      registerTrendInteraction(suggestion.text);
                                      if (suggestion.type === 'product' && suggestion.product) {
                                        setSelectedProduct(suggestion.product);
                                      }
                                    }}
                                    onMouseEnter={() => setActiveSuggestionIndex(idx)}
                                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-all border-l-2 ${
                                      isActive 
                                        ? 'bg-[#0066FF]/10 dark:bg-[#0066FF]/15 border-l-[#0066FF]' 
                                        : 'hover:bg-[#0066FF]/5 dark:hover:bg-[#0066FF]/10 border-l-transparent'
                                    } group`}
                                  >
                                    <div className="flex items-center space-x-2.5 min-w-0">
                                      {suggestion.type === 'brand' ? (
                                        <span className={`w-5 h-5 rounded text-gray-500 font-black font-mono text-[9px] flex items-center justify-center border transition-colors ${
                                          isActive ? 'bg-[#0066FF]/15 border-[#0066FF]/30 text-[#0066FF]' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                        }`}>B</span>
                                      ) : (
                                        <span className={`w-5 h-5 rounded font-black font-mono text-[9px] flex items-center justify-center border transition-colors ${
                                          isActive ? 'bg-[#0066FF]/25 text-[#0066FF] border-[#0066FF]/40' : 'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/25'
                                        }`}>P</span>
                                      )}
                                      <div className="truncate">
                                        <p className={`text-xs font-semibold transition-colors truncate ${
                                          isActive ? 'text-[#0066FF] dark:text-blue-400 font-bold' : 'text-gray-800 dark:text-gray-200 group-hover:text-[#0066FF]'
                                        }`}>
                                          {suggestion.text}
                                        </p>
                                        <span className="text-[10px] font-mono text-gray-400">
                                          {suggestion.subtitle}
                                        </span>
                                      </div>
                                    </div>

                                    {suggestion.type === 'product' && suggestion.priceGHS !== undefined && (
                                      <div className="text-right shrink-0">
                                        <p className="text-xs font-black text-emerald-500 font-mono">
                                          {currency === 'GHS' 
                                            ? `₵ ${suggestion.priceGHS.toLocaleString()}` 
                                            : `$ ${suggestion.priceUSD?.toLocaleString()}`}
                                        </p>
                                        <span className={`text-[8px] font-bold font-mono uppercase px-1 rounded transition-colors ${
                                          isActive ? 'bg-[#0066FF]/15 text-[#0066FF]' : 'bg-emerald-500/10 text-emerald-500'
                                        }`}>
                                          {isActive ? 'Select ↵' : 'View Specs'}
                                        </span>
                                      </div>
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Assistance Dropdown Menu */}
                    <AnimatePresence>
                      {isSearchAssistOpen && (!showInlineSuggestions || searchQuery.trim() === '') && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-4 space-y-3.5 z-40"
                          id="search-assistance-menu"
                        >
                          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
                            <span className="text-[10px] font-mono font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>Search Assistance Desk</span>
                            </span>
                            <button
                              onClick={() => setIsSearchAssistOpen(false)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-0.5 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick Actions Grid */}
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={handleCopySearchQuery}
                              disabled={!searchQuery}
                              className="flex flex-col items-center justify-center p-2 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 hover:border-gray-300 dark:hover:border-gray-700 transition group disabled:opacity-40 disabled:pointer-events-none"
                              id="btn-copy-search-query"
                              title="Copy search query to clipboard"
                            >
                              {searchCopyFeedback ? (
                                <Check className="w-4 h-4 text-green-500 mb-1" />
                              ) : (
                                <Copy className="w-4 h-4 text-[#0066FF] group-hover:scale-105 transition-transform mb-1" />
                              )}
                              <span className="text-[9px] font-bold font-mono text-gray-600 dark:text-gray-300">
                                {searchCopyFeedback ? 'Copied!' : 'Copy Query'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery('');
                                setShowSearchInsights(false);
                              }}
                              disabled={!searchQuery}
                              className="flex flex-col items-center justify-center p-2 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 hover:border-gray-300 dark:hover:border-gray-700 transition group disabled:opacity-40 disabled:pointer-events-none"
                              id="btn-clear-search-query"
                              title="Clear search query"
                            >
                              <X className="w-4 h-4 text-red-500 group-hover:scale-105 transition-transform mb-1" />
                              <span className="text-[9px] font-bold font-mono text-gray-600 dark:text-gray-300">Clear Field</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setShowSearchInsights(!showSearchInsights)}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition group ${
                                showSearchInsights 
                                  ? 'bg-[#0066FF]/10 border-[#0066FF]/30' 
                                  : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 hover:border-gray-300 dark:hover:border-gray-700'
                              }`}
                              id="btn-view-search-insights"
                              title="Toggle query matches and specs info"
                            >
                              <Info className={`w-4 h-4 mb-1 group-hover:scale-105 transition-transform ${showSearchInsights ? 'text-[#0066FF]' : 'text-gray-400'}`} />
                              <span className="text-[9px] font-bold font-mono text-gray-600 dark:text-gray-300">View Details</span>
                            </button>
                          </div>

                          {/* Recent Searches Section */}
                          <div className="space-y-1.5" id="recent-searches-section">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Recent Searches</span>
                              {recentSearches.length > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRecentSearches([]);
                                    localStorage.removeItem('immortal_recent_searches');
                                  }}
                                  className="text-[9px] font-bold font-mono text-red-500 hover:text-red-600 uppercase tracking-wider bg-transparent border-none p-0 cursor-pointer"
                                  id="clear-recent-searches-btn"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                            {recentSearches.length === 0 ? (
                              <p className="text-[10px] font-mono text-gray-400 italic py-1">No recent searches yet.</p>
                            ) : (
                              <div className="flex flex-col gap-1">
                                {recentSearches.map((term, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setSearchQuery(term);
                                      saveRecentSearch(term);
                                      if (selectedCategory !== 'All') {
                                        const matchesInCurrent = products.some(p => 
                                          isCategoryMatch(p.category, selectedCategory, p.name, p.description) &&
                                          (p.name.toLowerCase().includes(term.toLowerCase()) || 
                                           p.brand.toLowerCase().includes(term.toLowerCase()))
                                        );
                                        if (!matchesInCurrent) {
                                          setSelectedCategory('All');
                                        }
                                      }
                                    }}
                                    className="flex items-center justify-between px-2.5 py-1.5 bg-gray-50 hover:bg-[#0066FF]/5 dark:bg-black/25 dark:hover:bg-[#0066FF]/10 rounded-lg text-xs font-medium text-gray-750 dark:text-gray-300 hover:text-[#0066FF] dark:hover:text-[#0066FF] transition-all border border-gray-100/50 dark:border-gray-800/40 text-left"
                                    id={`recent-search-item-${idx}`}
                                  >
                                    <span className="truncate max-w-[180px]">{term}</span>
                                    <span className="text-[9px] font-mono text-gray-400 font-bold">#{idx + 1}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Predefined Popular Queries / Templates */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Popular Search Filters</span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: ' iPhone', term: 'iPhone' },
                                { label: 'Galaxy S23', term: 'Galaxy' },
                                { label: 'EliteBook', term: 'EliteBook' },
                                { label: 'Fast Charger', term: 'Charger' },
                                { label: 'Nintendo', term: 'Nintendo' },
                                { label: 'MacBook', term: 'MacBook' },
                              ].map((item) => (
                                <button
                                  key={item.label}
                                  type="button"
                                  onClick={() => {
                                    setSearchQuery(item.term);
                                    saveRecentSearch(item.term);
                                    if (selectedCategory !== 'All') {
                                      const matchesInCurrent = products.some(p => 
                                        isCategoryMatch(p.category, selectedCategory, p.name, p.description) &&
                                        (p.name.toLowerCase().includes(item.term.toLowerCase()) || 
                                         p.brand.toLowerCase().includes(item.term.toLowerCase()))
                                      );
                                      if (!matchesInCurrent) {
                                        setSelectedCategory('All');
                                      }
                                    }
                                  }}
                                  className={`px-2 py-1 rounded-md text-[10px] font-bold font-mono transition-all ${
                                    searchQuery.toLowerCase() === item.term.toLowerCase()
                                      ? 'bg-[#0066FF] text-white'
                                      : 'bg-gray-100 dark:bg-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Real-time Insights Details Section */}
                          {showSearchInsights && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-3 bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-gray-800 rounded-lg text-xs space-y-2 overflow-hidden"
                              id="search-insights-details"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[9px] font-bold text-[#0066FF] uppercase tracking-wider flex items-center gap-1">
                                  <Info className="w-3 h-3" />
                                  <span>Query Diagnostics</span>
                                </span>
                                <span className="font-mono text-[9px] text-gray-400">
                                  {searchQuery ? `Active Query: "${searchQuery}"` : 'Global Store View'}
                                </span>
                              </div>

                              <div className="space-y-1 text-[11px] font-mono text-gray-500 dark:text-gray-400">
                                <div className="flex justify-between">
                                  <span>Matching Products:</span>
                                  <span className="font-bold text-gray-900 dark:text-white">{filteredProducts.length} items</span>
                                </div>
                                
                                {filteredProducts.length > 0 && (
                                  <>
                                    <div className="flex justify-between">
                                      <span>Average Price:</span>
                                      <span className="font-bold text-emerald-500">
                                        {currency === 'GHS' 
                                          ? `₵ ${(filteredProducts.reduce((sum, p) => sum + p.priceGHS, 0) / filteredProducts.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                                          : `$ ${(filteredProducts.reduce((sum, p) => sum + p.priceUSD, 0) / filteredProducts.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                      </span>
                                    </div>

                                    <div className="pt-1.5 border-t border-gray-200/50 dark:border-gray-800/50 space-y-1">
                                      <span className="text-[9px] font-black uppercase text-gray-400 block">Matches by Category:</span>
                                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
                                        {Object.entries(
                                          filteredProducts.reduce((acc: Record<string, number>, p) => {
                                            acc[p.category] = (acc[p.category] || 0) + 1;
                                            return acc;
                                          }, {})
                                        ).map(([catName, cnt]) => (
                                          <div key={catName} className="flex justify-between">
                                            <span className="truncate max-w-[90px]">{catName}:</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{cnt}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

              {/* Products Grid */}
              {isLoading && products.length === 0 ? (
                <div className="space-y-8" id="product-skeletons-container">
                  {/* Visual Status Indicator */}
                  <div className="flex items-center space-x-3 bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 p-4 rounded-xl">
                    <Loader2 className="w-5 h-5 text-[#0066FF] animate-spin shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white font-mono">Synchronizing Digital Catalogues...</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Fetching products from Firestore server and preparing high-fidelity previews</p>
                    </div>
                  </div>

                  {/* High-Fidelity Card Skeletons Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <div 
                        key={`product-skeleton-${idx}`}
                        className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] overflow-hidden flex flex-col justify-between h-full animate-pulse"
                      >
                        {/* Placeholder Image container matching original ProductCard image structure */}
                        <div className="relative pt-[100%] bg-gray-50 dark:bg-zinc-900/40">
                          {/* Inner soft image outline placeholder */}
                          <div className="absolute inset-4 rounded-lg bg-gray-100 dark:bg-zinc-800/60 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-gray-200 dark:text-zinc-700/80 animate-spin" />
                          </div>
                        </div>

                        {/* Product Information Skeleton */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-3">
                            {/* Brand & Category Row */}
                            <div className="h-3 bg-gray-100 dark:bg-zinc-800/60 rounded w-1/3" />
                            {/* Product Name */}
                            <div className="h-5 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
                            {/* Star Ratings */}
                            <div className="flex items-center space-x-2">
                              <div className="h-3.5 bg-amber-100 dark:bg-amber-950/20 rounded w-10" />
                              <div className="h-3 bg-gray-100 dark:bg-zinc-800/60 rounded w-16" />
                            </div>
                            {/* Description lines */}
                            <div className="space-y-1.5 pt-1">
                              <div className="h-3 bg-gray-100 dark:bg-zinc-800/60 rounded w-full" />
                              <div className="h-3 bg-gray-100 dark:bg-zinc-800/60 rounded w-5/6" />
                            </div>
                          </div>

                          {/* Price & Actions Row */}
                          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="h-2.5 bg-gray-100 dark:bg-zinc-800/60 rounded w-8" />
                              <div className="h-5 bg-[#0066FF]/10 dark:bg-[#0066FF]/5 rounded w-16" />
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {/* AR Button mockup */}
                              <div className="h-8 w-12 bg-gray-100 dark:bg-zinc-800/60 rounded-lg" />
                              {/* Cart/Buy Button mockup */}
                              <div className="h-8 w-20 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : error && products.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-red-200 dark:border-red-900/30 rounded-2xl flex flex-col items-center justify-center space-y-4 bg-red-50/50 dark:bg-red-950/10">
                  <AlertCircle className="w-12 h-12 text-red-500 animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-red-600 dark:text-red-400 font-mono">Failed to fetch products</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">There was an issue synchronizing the catalogue from Firebase. Please check your connection or retry.</p>
                  </div>
                  <button
                    onClick={() => fetchInitialData()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : displayProducts.length > 0 ? (
                <div className="space-y-4">
                  <motion.div 
                    key={`${selectedCategory}-${searchQuery}-${sortBy}`}
                    variants={gridContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  >
                    {displayProducts.map(product => (
                      <motion.div 
                        key={product.id} 
                        variants={productCardVariants}
                        className="h-full"
                      >
                        <ProductCard
                          product={product}
                          currency={currency}
                          onAddToCart={() => handleAddToCart(product)}
                          onViewDetails={() => setSelectedProduct(product)}
                          onToggleWishlist={handleToggleWishlist}
                          isWishlisted={wishlist.some(p => p.id === product.id)}
                          onOpenAR={(prod) => setArProduct(prod)}
                          onToggleCompare={handleToggleCompare}
                          isComparing={comparisonList.some(p => p.id === product.id)}
                          onQuickBuy={(prod) => {
                            setQuickBuyItem({ product: prod, quantity: 1, selectedColor: prod.colors[0] || 'Default' });
                            setIsCheckoutOpen(true);
                          }}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              ) : (
                <div className="text-center py-24 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center space-y-4">
                  <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-700 animate-bounce" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-gray-700 dark:text-gray-300 font-mono">No products matched your search or filters.</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Try adjusting your active filters or typing a different search term.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedBrand('All');
                      setInStockOnly(false);
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-[#0066FF] hover:bg-[#0055DD] text-white text-xs font-bold rounded-lg transition-all"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REPAIRS TAB VIEW */}
        {currentTab === 'repair' && (
          <RepairBooking 
            onBookRepair={handleBookRepair} 
            onTrackRepair={handleTrackRepair} 
            currency={currency} 
          />
        )}

        {/* TRADE-IN TAB VIEW */}
        {currentTab === 'tradein' && (
          <TradeInSystem 
            onSubmitTradeIn={handleTradeInSubmit} 
            onTrackTradeIn={handleTrackTradeIn} 
            currency={currency} 
          />
        )}

        {/* BLOG TAB VIEW */}
        {currentTab === 'blog' && (
          <BlogSystem 
            blogs={blogs} 
            onComment={handleBlogComment} 
            onLike={handleBlogLike} 
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 dark:border-gray-900 bg-white dark:bg-[#060606] py-16 text-xs text-gray-500 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          <div className="space-y-4 md:col-span-1">
            <span className="font-sans font-black tracking-widest text-lg text-gray-900 dark:text-white block">IMMORTAL</span>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Ghana's certified premium hub for luxurious electronics sales, advanced micro-repair operations, and device swap systems. Led by CEO Benjamin Danso. Based in Circle Ebony, Accra, Ghana.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="bg-[#0066FF]/10 text-[#0066FF] px-2 py-0.5 rounded font-mono font-bold text-[9px] border border-[#0066FF]/10">MTN MOMO</span>
              <span className="bg-amber-400/10 text-amber-500 px-2 py-0.5 rounded font-mono font-bold text-[9px] border border-amber-500/10">TELECEL CASH</span>
              <span className="bg-teal-500/10 text-teal-500 px-2 py-0.5 rounded font-mono font-bold text-[9px] border border-teal-500/10">AT MONEY</span>
            </div>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider block mb-3 text-gray-850 dark:text-gray-200 font-mono text-[10px]">Operations</span>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button 
                  onClick={() => {
                    setCurrentTab('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => {
                      document.getElementById('shop-section-anchor')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }} 
                  className="hover:text-[#0066FF] text-left cursor-pointer transition"
                >
                  Buy Flagship Smartphones
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setCurrentTab('repair');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-[#0066FF] text-left cursor-pointer transition"
                >
                  Book Certified Diagnostics
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setCurrentTab('tradein');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-[#0066FF] text-left cursor-pointer transition"
                >
                  Request Instant Swap Appraisals
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setCurrentTab('blog');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-[#0066FF] text-left cursor-pointer transition"
                >
                  TechLongevity Blog
                </button>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider block mb-3 text-gray-850 dark:text-gray-200 font-mono text-[10px]">Legal & Policies</span>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => { setSelectedLegalTab('terms'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Terms & Conditions</button></li>
              <li><button onClick={() => { setSelectedLegalTab('privacy'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Privacy Policy</button></li>
              <li><button onClick={() => { setSelectedLegalTab('acceptable-use'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Acceptable Use Policy</button></li>
              <li><button onClick={() => { setSelectedLegalTab('disclaimer'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">General Disclaimer</button></li>
              <li><button onClick={() => { setSelectedLegalTab('cookies'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Cookie Policy</button></li>
              <li><button onClick={() => { setSelectedLegalTab('security'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Security Policy</button></li>
            </ul>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider block mb-3 text-gray-850 dark:text-gray-200 font-mono text-[10px]">Customer Care</span>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => { setSelectedLegalTab('refunds'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Refund & Return Policy</button></li>
              <li><button onClick={() => { setSelectedLegalTab('shipping'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Shipping & Delivery Policy</button></li>
              <li><button onClick={() => { setSelectedLegalTab('repairs'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Repair Service Policy</button></li>
              <li><button onClick={() => { setSelectedLegalTab('warranty'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Warranty Policy</button></li>
              <li><button onClick={() => { setSelectedLegalTab('payment'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Payment Policy</button></li>
              <li><button onClick={() => { setSelectedLegalTab('returns-exchanges'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Returns & Exchanges Guide</button></li>
              <li><button onClick={() => { setSelectedLegalTab('faq'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">F.A.Q.</button></li>
            </ul>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider block mb-3 text-gray-850 dark:text-gray-200 font-mono text-[10px]">Corporate & Trust</span>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => { setSelectedLegalTab('about'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">About Immortal Electronics</button></li>
              <li><button onClick={() => { setSelectedLegalTab('contact'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Contact Us & Store Map</button></li>
              <li><button onClick={() => { setSelectedLegalTab('accessibility'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Accessibility Statement</button></li>
              <li><button onClick={() => { setSelectedLegalTab('vendor-policy'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Vendor & Supplier Policy</button></li>
              <li><button onClick={() => { setSelectedLegalTab('careers'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Careers & Vacancies</button></li>
              <li><button onClick={() => { setSelectedLegalTab('sustainability'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#0066FF] text-left cursor-pointer transition">Sustainability & E-Waste</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-150 dark:border-gray-900 mt-12 pt-8 text-center text-[10px] text-gray-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} Immortal Electronics Ltd. All rights reserved. Circle Ebony, Accra, Republic of Ghana, Tailored & Developed by Zealguy Venture
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px]">
            <button onClick={() => { setSelectedLegalTab('terms'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:underline transition">Terms of Service</button>
            <span>•</span>
            <button onClick={() => { setSelectedLegalTab('privacy'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:underline transition">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => { setSelectedLegalTab('cookies'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:underline transition">Cookie Settings</button>
            <span>•</span>
            <button onClick={() => { setSelectedLegalTab('about'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:underline transition">About Us</button>
            <span>•</span>
            <button onClick={() => { setSelectedLegalTab('contact'); setIsLegalHubOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:underline transition">Contact Support</button>
            <span>•</span>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-[#0066FF]/10 text-gray-700 dark:text-gray-300 hover:text-[#0066FF] font-mono font-bold transition cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp size={11} />
            </button>
          </div>
        </div>
      </footer>

      {/* SHOPPING CART SLIDE-IN PANEL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-md h-full bg-white dark:bg-[#0B0B0B] border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
            id="cart-slideout"
          >
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#0066FF]" />
                <span className="font-extrabold text-sm tracking-wide">YOUR SHOPPING CART</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                id="close-cart-btn"
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {cart.length > 0 ? (
                cart.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-900 rounded-xl flex justify-between gap-3 text-xs">
                    <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-contain p-1 bg-white rounded" onError={handleImageError} />
                    
                    <div className="flex-1 space-y-1">
                      <span className="font-bold text-gray-900 dark:text-white block">{item.product.name}</span>
                      {item.selectedColor && <span className="text-[10px] text-gray-400 font-mono block">Color: {item.selectedColor}</span>}
                      
                      <div className="flex items-center space-x-2 pt-1">
                        <button 
                          onClick={() => handleUpdateCartQuantity(item.product.id, item.selectedColor, -1)}
                          className="w-5 h-5 border border-gray-200 dark:border-gray-800 flex items-center justify-center font-bold rounded"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateCartQuantity(item.product.id, item.selectedColor, 1)}
                          className="w-5 h-5 border border-gray-200 dark:border-gray-800 flex items-center justify-center font-bold rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right flex flex-col justify-between items-end">
                      <button 
                        onClick={() => handleRemoveFromCart(item.product.id, item.selectedColor)}
                        className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-[#0066FF] block mt-1">
                        {currency === 'GHS' 
                          ? `₵ ${(item.product.priceGHS * item.quantity).toLocaleString()}` 
                          : `$ ${(item.product.priceUSD * item.quantity).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-gray-400 font-mono italic">
                  Your cart is empty. Explore our gadgets!
                </div>
              )}
            </div>

            {/* Cart checkout footer with Promo Coupon */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121212]/30 space-y-4">
              {/* Promo code bar */}
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-mono uppercase block">Apply Promo Coupon</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. IMMORTAL20)"
                    value={appliedCouponCode}
                    onChange={(e) => setAppliedCouponCode(e.target.value)}
                    className="flex-1 p-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                    id="cart-coupon-input"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    id="cart-apply-coupon"
                    className="px-3 py-2 bg-amber-400 hover:bg-amber-500 text-black rounded-lg text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-mono mt-1">{couponError}</p>}
                {activeCoupon && <p className="text-[10px] text-green-500 font-mono mt-1">✓ Applied {activeCoupon.discountPercent}% OFF coupon ({activeCoupon.code})</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 border-t border-gray-200 dark:border-gray-800 pt-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Cart Subtotal:</span>
                  <span className="font-semibold text-gray-950 dark:text-white">
                    {currency === 'GHS' ? `₵ ${subtotalGHS.toLocaleString()}` : `$ ${subtotalUSD.toLocaleString()}`}
                  </span>
                </div>
                {discountGHS > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount Applied:</span>
                    <span>-{currency === 'GHS' ? `₵ ${discountGHS.toLocaleString()}` : `$ ${discountUSD.toLocaleString()}`}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-gray-950 dark:text-white pt-2 border-t border-gray-150 dark:border-gray-900">
                  <span>Subtotal estimate:</span>
                  <span className="text-[#0066FF]">
                    {currency === 'GHS' ? `₵ ${(subtotalGHS - discountGHS).toLocaleString()}` : `$ ${(subtotalUSD - discountUSD).toLocaleString()}`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                disabled={cart.length === 0}
                id="cart-checkout-cta"
                className="w-full py-3 bg-[#0066FF] hover:bg-[#0055DD] disabled:bg-gray-200 text-white font-bold rounded-xl text-center shadow-lg shadow-[#0066FF]/20"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT FLOW MODAL WITH MOMO EMULATION */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto text-gray-900 dark:text-white">
          <div 
            className="w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0B0B0B] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
            id="checkout-modal"
          >
            {checkoutSuccessCode ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-center space-y-5 py-6 sm:py-8 relative" 
                id="checkout-success-view"
              >
                <Confetti />

                {/* Animated Visual Check Pulse Badge */}
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping scale-125 opacity-75" />
                  <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 via-teal-500/25 to-blue-500/30 blur-xl rounded-full animate-pulse" />
                  
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 relative z-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.25, 1] }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      <Check className="w-9 h-9 sm:w-11 sm:h-11 stroke-[3]" />
                    </motion.div>
                  </motion.div>
                </div>
                
                <motion.h3 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight flex items-center justify-center gap-2"
                >
                  <span>Order Verified & Confirmed!</span>
                </motion.h3>
                
                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed"
                >
                  Your order has been registered in our database and dispatched. We will send status updates to your phone.
                </motion.p>
                
                {/* Entrance Animation for Order & Products Update Code */}
                <motion.div 
                  initial={{ y: 15, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.28, duration: 0.4, ease: "easeOut" }}
                  className="bg-gray-50 dark:bg-gray-950 border border-emerald-500/30 dark:border-emerald-500/20 p-4 sm:p-5 rounded-2xl inline-block font-mono shadow-md relative overflow-hidden group"
                  id="order-dispatch-code-card"
                >
                  <div className="absolute -inset-y-0 -inset-x-12 bg-gradient-to-r from-transparent via-[#0066FF]/10 to-transparent skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider font-bold">ORDER DISPATCH CODE</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-[#0066FF] dark:text-blue-400 tracking-wider block mt-1 select-all">{checkoutSuccessCode}</span>
                </motion.div>

                {/* Estimated Delivery Confirmation Card with Entrance Animation */}
                {(() => {
                  const est = getEstimatedDeliveryText(deliveryOption);
                  return (
                    <motion.div 
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.35, duration: 0.4 }}
                      className="max-w-md mx-auto p-3.5 sm:p-4 rounded-2xl border border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-black/20 text-left flex items-start gap-3 mt-4" 
                      id="success-delivery-est"
                    >
                      <span className="text-xl">📦</span>
                      <div>
                        <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">Estimated Handover / Arrival</span>
                        <p className="text-xs font-black text-gray-900 dark:text-white mt-0.5">{est.dateString}</p>
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{est.label}</p>
                      </div>
                    </motion.div>
                  );
                })()}
                
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.42, duration: 0.3 }}
                  className="pt-4"
                >
                  <button
                    onClick={() => {
                      setCheckoutSuccessCode(null);
                      setIsCheckoutOpen(false);
                    }}
                    className="px-8 py-3 bg-[#0066FF] hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 duration-200"
                  >
                    Done
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <h3 className="text-sm sm:text-md font-extrabold flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-[#0066FF]" />
                    <span>{quickBuyItem ? 'Direct Quick Buy Checkout' : 'Secure Accra Dispatch Checkout'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
                  {/* Shipping Form */}
                  <div className="space-y-3">
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block border-b border-gray-100 dark:border-gray-900 pb-1">1. Billing & Shipping Details</span>
                    
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Recipient Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Alhassan Ibrahim"
                        value={checkoutName}
                        onChange={(e) => {
                          setCheckoutName(e.target.value);
                          if (!checkoutNameTouched) setCheckoutNameTouched(true);
                        }}
                        onBlur={() => setCheckoutNameTouched(true)}
                        className={`mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border rounded-lg text-xs transition-all duration-200 ${
                          checkoutNameTouched && nameError 
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                            : checkoutNameTouched && !nameError && checkoutName.trim().length > 0
                            ? 'border-green-500 focus:border-green-500 focus:ring-1 focus:ring-green-500'
                            : 'border-gray-200 dark:border-gray-800 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]'
                        }`}
                        id="checkout-input-name"
                      />
                      {checkoutNameTouched && nameError && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 animate-fadeIn">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          <span>{nameError}</span>
                        </p>
                      )}
                      {checkoutNameTouched && !nameError && checkoutName.trim().length > 0 && (
                        <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 flex items-center gap-1 animate-fadeIn">
                          <Check className="w-3 h-3 flex-shrink-0" />
                          <span>Looks good!</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Ghanaian Phone Number (MoMo alerts) *</label>
                      <div className="relative mt-1">
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 0244192834"
                          value={checkoutPhone}
                          onChange={(e) => {
                            setCheckoutPhone(e.target.value);
                            if (!checkoutPhoneTouched) setCheckoutPhoneTouched(true);
                          }}
                          onBlur={() => setCheckoutPhoneTouched(true)}
                          className={`w-full p-2 bg-gray-50 dark:bg-black/20 border rounded-lg text-xs transition-all duration-200 pr-20 ${
                            checkoutPhoneTouched && phoneError 
                              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                              : checkoutPhoneTouched && !phoneError && checkoutPhone.trim().length > 0
                              ? 'border-green-500 focus:border-green-500 focus:ring-1 focus:ring-green-500'
                              : 'border-gray-200 dark:border-gray-800 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]'
                          }`}
                          id="checkout-input-phone"
                        />
                        {phoneOperator && (
                          <span className={`absolute right-2 top-[50%] -translate-y-[50%] text-[9px] font-bold px-1.5 py-0.5 rounded border ${phoneOperator.color} animate-fadeIn`}>
                            {phoneOperator.name}
                          </span>
                        )}
                      </div>
                      
                      {checkoutPhoneTouched && phoneError && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 animate-fadeIn">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          <span>{phoneError}</span>
                        </p>
                      )}
                      
                      {checkoutPhoneTouched && !phoneError && checkoutPhone.trim().length > 0 && (
                        <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 flex items-center gap-1 animate-fadeIn">
                          <Check className="w-3 h-3 flex-shrink-0" />
                          <span>Valid contact ({phoneOperator ? phoneOperator.brand : 'Ghana Operator'})</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Email Address</label>
                      <input
                        type="email"
                        placeholder="alhassan@gmail.com"
                        value={checkoutEmail}
                        onChange={(e) => {
                          setCheckoutEmail(e.target.value);
                          if (!checkoutEmailTouched) setCheckoutEmailTouched(true);
                        }}
                        onBlur={() => setCheckoutEmailTouched(true)}
                        className={`mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border rounded-lg text-xs transition-all duration-200 ${
                          checkoutEmailTouched && emailError 
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                            : checkoutEmailTouched && !emailError && checkoutEmail.trim().length > 0
                            ? 'border-green-500 focus:border-green-500 focus:ring-1 focus:ring-green-500'
                            : 'border-gray-200 dark:border-gray-800 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]'
                        }`}
                        id="checkout-input-email"
                      />
                      {checkoutEmailTouched && emailError && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 animate-fadeIn">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          <span>{emailError}</span>
                        </p>
                      )}
                      {checkoutEmailTouched && !emailError && checkoutEmail.trim().length > 0 && (
                        <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 flex items-center gap-1 animate-fadeIn">
                          <Check className="w-3 h-3 flex-shrink-0" />
                          <span>Valid email format</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Delivery Street Address (Accra/GHS) *</label>
                      <input
                        type="text"
                        required
                        placeholder="Circle Ebony, Accra"
                        value={checkoutAddress}
                        onChange={(e) => {
                          setCheckoutAddress(e.target.value);
                          if (!checkoutAddressTouched) setCheckoutAddressTouched(true);
                        }}
                        onBlur={() => setCheckoutAddressTouched(true)}
                        className={`mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border rounded-lg text-xs transition-all duration-200 ${
                          checkoutAddressTouched && addressError 
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                            : checkoutAddressTouched && !addressError && checkoutAddress.trim().length > 0
                            ? 'border-green-500 focus:border-green-500 focus:ring-1 focus:ring-green-500'
                            : 'border-gray-200 dark:border-gray-800 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]'
                        }`}
                        id="checkout-input-address"
                      />
                      {checkoutAddressTouched && addressError && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 animate-fadeIn">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          <span>{addressError}</span>
                        </p>
                      )}
                      {checkoutAddressTouched && !addressError && checkoutAddress.trim().length > 0 && (
                        <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 flex items-center gap-1 animate-fadeIn">
                          <Check className="w-3 h-3 flex-shrink-0" />
                          <span>Valid street address</span>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">City / Location</label>
                        <input
                          type="text"
                          required
                          value={checkoutCity}
                          onChange={(e) => setCheckoutCity(e.target.value)}
                          className="mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Dispatch Mode</label>
                        <select
                          value={deliveryOption}
                          onChange={(e) => setDeliveryOption(e.target.value as any)}
                          className="mt-1 w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-white rounded-lg"
                        >
                          <option value="Standard Accra Dispatch">Standard Dispatch (GHS 35)</option>
                          <option value="Expedited Motorcycle Courier">Expedited Cycle (GHS 55)</option>
                          <option value="In-Store Pickup">Accra In-Store Pick (GHS 0)</option>
                        </select>
                      </div>
                    </div>

                    {/* Dynamic Estimated Delivery Date Panel */}
                    {(() => {
                      const est = getEstimatedDeliveryText(deliveryOption);
                      return (
                        <div className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all duration-300 ${est.colorClass}`} id="delivery-est-panel">
                          <span className="text-sm mt-0.5">📅</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] uppercase font-bold tracking-wider block opacity-75">Estimated Handover / Arrival</span>
                            <span className="text-xs font-extrabold block mt-0.5">{est.dateString}</span>
                            <span className="text-[9px] block opacity-90 mt-0.5 leading-snug">{est.label}</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Save details checkbox */}
                    <div className="flex items-center space-x-2 pt-1" id="checkout-save-details-container">
                      <input
                        type="checkbox"
                        id="save-checkout-details-checkbox"
                        checked={saveDetails}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSaveDetails(checked);
                          localStorage.setItem('immortal_save_details', checked ? 'true' : 'false');
                          if (!checked) {
                            localStorage.removeItem('immortal_checkout_name');
                            localStorage.removeItem('immortal_checkout_phone');
                            localStorage.removeItem('immortal_checkout_email');
                            localStorage.removeItem('immortal_checkout_address');
                            localStorage.removeItem('immortal_checkout_city');
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-750 text-[#0066FF] focus:ring-[#0066FF] focus:ring-offset-0 cursor-pointer shrink-0"
                      />
                      <label 
                        htmlFor="save-checkout-details-checkbox" 
                        className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 cursor-pointer select-none"
                      >
                        Save my details for next time
                      </label>
                    </div>
                  </div>

                  {/* Payment & Order Summary */}
                  <div className="space-y-4">
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block border-b border-gray-100 dark:border-gray-900 pb-1">2. Payment Provider & Processor</span>

                    {/* Payment Error Alert with Solution Steps and Action Items */}
                    {paymentError && (
                      <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 space-y-2.5 animate-fadeIn" id="checkout-payment-error-banner">
                        <div className="flex items-start gap-2">
                          <span className="text-lg shrink-0">⚠️</span>
                          <div>
                            <span className="font-extrabold block text-sm">Payment Attempt Failed</span>
                            <p className="mt-1 opacity-90 leading-relaxed font-mono text-[10px] bg-red-500/5 p-2 rounded-lg border border-red-500/10">{paymentError}</p>
                          </div>
                        </div>
                        <div className="bg-red-500/5 p-2.5 rounded-xl border border-red-500/10 space-y-1.5">
                          <span className="font-bold text-[10px] uppercase tracking-wider block text-red-700 dark:text-red-300">💡 Solution Options (Modal remains open):</span>
                          <ul className="list-disc pl-4 space-y-1 text-[11px] opacity-90">
                            <li>Switch the **Secure Payment Processor** (e.g., choose {paymentGateway === 'Paystack' ? 'Flutterwave' : 'Paystack'} below).</li>
                            <li>Try a different **Payment Provider** wallet (MTN MoMo, Telecel Cash, or Credit Card).</li>
                            <li>Select **Cash on Delivery** to secure and authorize your order instantly without online payment processing.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Paystack / Flutterwave style provider choice */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { name: 'MTN MoMo', label: 'MTN Mobile Money' },
                        { name: 'Telecel Cash', label: 'Telecel Cash' },
                        { name: 'Credit Card', label: 'Visa / Mastercard' },
                        { name: 'Cash on Delivery', label: 'Cash On Delivery' }
                      ].map(prov => (
                        <button
                          key={prov.name}
                          type="button"
                          onClick={() => {
                            setPaymentProvider(prov.name as any);
                            setPaymentError(null); // Clear payment error upon switching provider
                          }}
                          className={`p-2.5 sm:p-3 border rounded-xl text-left text-xs transition-all ${
                            paymentProvider === prov.name 
                              ? 'border-[#0066FF] bg-[#0066FF]/10 font-bold text-[#0066FF]' 
                              : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {prov.label}
                        </button>
                      ))}
                    </div>

                    {/* Payment Gateway Processor Selection */}
                    {paymentProvider !== 'Cash on Delivery' && (
                      <div className="space-y-2 pt-1">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase font-mono">Secure Payment Processor *</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            { id: 'Paystack', name: 'Paystack Gateway', description: 'Accept MTN, Telecel & Cards', logo: '💳' },
                            { id: 'Flutterwave', name: 'Flutterwave Gateway', description: 'Grow business across Africa', logo: '🌊' }
                          ].map(gate => {
                            const isFailed = failedGateways.includes(gate.id);
                            const isSelected = paymentGateway === gate.id;
                            return (
                              <button
                                key={gate.id}
                                type="button"
                                onClick={() => {
                                  setPaymentGateway(gate.id as any);
                                  setPaymentError(null); // Clear error on gateway toggle
                                }}
                                className={`p-2.5 border rounded-xl text-left text-xs transition-all relative flex items-center justify-between ${
                                  isSelected 
                                    ? isFailed
                                      ? 'border-red-500 bg-red-500/10 font-bold text-red-600 dark:text-red-400'
                                      : 'border-[#0066FF] bg-[#0066FF]/10 font-bold text-[#0066FF]' 
                                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-base shrink-0">{gate.logo}</span>
                                  <div className="min-w-0">
                                    <span className="font-extrabold block truncate">{gate.id}</span>
                                    <span className="text-[9px] text-gray-400 block truncate">{gate.description}</span>
                                  </div>
                                </div>
                                {isFailed && (
                                  <span className="text-[8px] bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono shrink-0 ml-1">Failed</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Payment Details Simulator */}
                    {paymentProvider === 'MTN MoMo' && (
                      <div className="p-3 rounded-xl bg-[#F5B800]/10 border border-[#F5B800]/20 text-[11px] text-[#F5B800] space-y-1">
                        <span className="font-bold block">MTN MoMo Gateway ({paymentGateway} Secure Link)</span>
                        <p>We'll send a secure USSD payment prompt request to your telephone. Please confirm with your 4-digit Momo PIN.</p>
                      </div>
                    )}

                    {paymentProvider === 'Telecel Cash' && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-500 space-y-1">
                        <span className="font-bold block">Telecel Cash Gateway ({paymentGateway} Secure Link)</span>
                        <p>Please ensure you have generated your voucher code (*110#) before confirming checkout dispatch.</p>
                      </div>
                    )}

                    {/* Operator Mismatch Warning Banner */}
                    {phoneOperator && (
                      (phoneOperator.name === 'MTN MoMo' && paymentProvider !== 'MTN MoMo') ||
                      (phoneOperator.name === 'Telecel Cash' && paymentProvider !== 'Telecel Cash')
                    ) && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-1.5 animate-fadeIn">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">SIM / Gateway Mismatch Warning</span>
                          <p>Selected payment is {paymentProvider}, but your phone number appears to belong to {phoneOperator.brand}. Please double check or verify your Momo SIM.</p>
                        </div>
                      </div>
                    )}

                    {/* Items Breakdown */}
                    <div className="border border-gray-200 dark:border-gray-800 p-3 sm:p-3.5 rounded-xl bg-gray-50/30 dark:bg-black/5 space-y-2">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Items in Purchase</span>
                      {quickBuyItem ? (
                        <div className="flex items-center gap-2.5">
                          <img
                            src={quickBuyItem.product.image}
                            alt={quickBuyItem.product.name}
                            className="w-10 h-10 object-contain p-1 border border-gray-150 dark:border-gray-800 rounded-lg bg-white dark:bg-[#121212] shrink-0"
                            onError={handleImageError}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold block truncate text-gray-900 dark:text-white">{quickBuyItem.product.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono block truncate">Color: {quickBuyItem.selectedColor} • Qty: {quickBuyItem.quantity}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-950 dark:text-white shrink-0">
                            {currency === 'GHS' ? `₵${quickBuyItem.product.priceGHS.toLocaleString()}` : `$${quickBuyItem.product.priceUSD.toLocaleString()}`}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-24 overflow-y-auto">
                          {cart.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2.5">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-8 h-8 object-contain p-1 border border-gray-150 dark:border-gray-800 rounded-lg bg-white dark:bg-[#121212] shrink-0"
                                onError={handleImageError}
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-[11px] font-bold block truncate text-gray-800 dark:text-gray-200">{item.product.name}</span>
                                <span className="text-[9px] text-gray-400 font-mono font-medium block truncate">Color: {item.selectedColor} • Qty: {item.quantity}</span>
                              </div>
                              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 shrink-0">
                                {currency === 'GHS' ? `₵${(item.product.priceGHS * item.quantity).toLocaleString()}` : `$${(item.product.priceUSD * item.quantity).toLocaleString()}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Final Tally */}
                    <div className="border border-gray-200 dark:border-gray-800 p-3.5 sm:p-4 rounded-xl space-y-2 bg-gray-50/50 dark:bg-black/10">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Receipt Tally</span>
                      <div className="flex justify-between text-xs">
                        <span>Items Subtotal:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {currency === 'GHS' ? `₵ ${(subtotalGHS - discountGHS).toLocaleString()}` : `$ ${(subtotalUSD - discountUSD).toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Dispatch Courier:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {currency === 'GHS' ? `₵ ${deliveryCostGHS}` : `$ ${deliveryCostUSD}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-[#0066FF] pt-2 border-t border-gray-200 dark:border-gray-800">
                        <span>Grand Total:</span>
                        <span>{currency === 'GHS' ? `₵ ${finalTotalGHS.toLocaleString()}` : `$ ${finalTotalUSD.toLocaleString()}`}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitDisabled}
                      id="momo-checkout-confirm"
                      className={`w-full py-3 rounded-xl font-bold text-xs transition-all duration-200 shadow-lg ${
                        isSubmitDisabled 
                          ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none border border-transparent' 
                          : paymentError
                          ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-amber-500/20 cursor-pointer animate-pulse'
                          : 'bg-[#0066FF] hover:bg-[#0055DD] text-white shadow-[#0066FF]/20 cursor-pointer'
                      }`}
                    >
                      {isCheckoutLoading 
                        ? 'Transmitting Secure Payment Gateway...' 
                        : hasActiveErrors 
                        ? 'Please Correct Form Errors' 
                        : !isFormComplete 
                        ? 'Fill Required Fields' 
                        : paymentError
                        ? `Retry Payment via ${paymentGateway}`
                        : `Authorize & Confirm Checkout`
                      }
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DETAILED PRODUCT DIALOGUE MODAL */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          allProducts={products}
          currency={currency}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(prod, color) => handleAddToCart(prod, color)}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlist.some(p => p.id === selectedProduct.id)}
          onBuyNow={(prod, color) => {
            setQuickBuyItem({ product: prod, quantity: 1, selectedColor: color || prod.colors[0] || 'Default' });
            setSelectedProduct(null);
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          onOpenAR={(prod) => {
            setArProduct(prod);
          }}
          wishlist={wishlist}
          onViewProduct={(prod) => setSelectedProduct(prod)}
          onReviewAdded={fetchInitialData}
        />
      )}

      {/* IMMORTAL SPATIAL LABS AR OVERLAY */}
      {arProduct && (
        <ARViewModal
          product={arProduct}
          currency={currency}
          onClose={() => setArProduct(null)}
        />
      )}

      {/* DURABLE ACCRA CUSTOMER ACCOUNT DASHBOARD */}
      {isDashboardOpen && (
        <Dashboard
          orders={orders}
          repairs={repairs}
          tradeins={tradeins}
          currency={currency}
          onReorder={handleReorder}
          onClose={() => setIsDashboardOpen(false)}
        />
      )}

      {/* STAFF BACKDOOR DESK CONTROL */}
      {isAdminOpen && (
        <AdminPanel
          products={products}
          repairs={repairs}
          tradeins={tradeins}
          orders={orders}
          coupons={coupons}
          currency={currency}
          bulkInquiries={bulkInquiries}
          blogs={blogs}
          onUpdateStock={handleUpdateStock}
          onUpdateRepair={handleUpdateRepair}
          onUpdateTradeIn={handleUpdateTradeIn}
          onUpdateOrder={handleUpdateOrder}
          onCreateCoupon={handleCreateCoupon}
          onUpdateBulkInquiry={handleUpdateBulkInquiry}
          onCreateProduct={handleCreateProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onCreateBlog={handleCreateBlog}
          onDeleteBlog={handleDeleteBlog}
          onForceRefresh={forceRefreshCatalog}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* WHOLESALE BULK PURCHASE INQUIRY MODAL */}
      {isBulkModalOpen && (
        <BulkInquiryModal
          products={products}
          onClose={() => setIsBulkModalOpen(false)}
          onSubmitInquiry={handleBookBulkInquiry}
        />
      )}

      {/* PRODUCT COMPARISON MODAL */}
      <AnimatePresence>
        {isCompareModalOpen && (
          <ProductComparisonModal
            comparisonList={comparisonList}
            currency={currency}
            onClose={() => setIsCompareModalOpen(false)}
            onRemoveFromCompare={handleToggleCompare}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      {/* FLOATING COMPARISON BAR */}
      <AnimatePresence>
        {comparisonList.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xl bg-gray-900/95 dark:bg-black/95 backdrop-blur-md border border-gray-800 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            id="floating-compare-bar"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#0066FF]/10 text-[#0066FF] rounded-xl">
                <GitCompare className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wider text-white uppercase font-mono">Gadget Compare Deck</h4>
                <p className="text-[10px] text-gray-400 font-mono">
                  {comparisonList.length} of 3 items selected
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 flex-1">
              <div className="flex -space-x-2.5 overflow-hidden">
                {comparisonList.map(item => (
                  <div key={item.id} className="relative group w-8 h-8 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-black p-0.5 flex items-center justify-center">
                    <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" onError={handleImageError} />
                    <button
                      onClick={() => handleToggleCompare(item)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setComparisonList([])}
                  className="px-3 py-1.5 text-gray-400 hover:text-white text-[10px] font-bold uppercase font-mono transition"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="px-4 py-2 bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-black rounded-lg transition-all shadow-md shadow-[#0066FF]/20 flex items-center space-x-1"
                  id="open-compare-desk-btn"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Compare Now</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING GEMINI CHATBOT & VOICE SEARCH SIMULATOR */}
      <AIChatbot currentTab={currentTab} currency={currency} />

      {/* FLOATING QR CODE SCANNER ACTION BUTTON (Only on Shop Tab) */}
      <AnimatePresence>
        {currentTab === 'shop' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            className="fixed bottom-24 right-6 z-40"
            id="qr-fab-container"
          >
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="flex items-center space-x-2 px-4 py-3 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:scale-105 active:scale-95 text-white font-sans font-bold shadow-xl shadow-emerald-600/30 transition-all border border-white/10 cursor-pointer"
              id="qr-lens-fab"
              title="Open Camera QR Lens"
            >
              <div className="relative">
                <QrCode className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <span className="text-sm">Scan product QR</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR SCANNER LENS MODAL */}
      <AnimatePresence>
        {isQRScannerOpen && (
          <QRScannerModal
            products={products}
            onClose={() => setIsQRScannerOpen(false)}
            onScanSuccess={(scannedQuery) => {
              setSearchQuery(scannedQuery);
              // Adjust category to All if no match in current category
              const matchesInCurrent = products.some(p => 
                (isCategoryMatch(p.category, selectedCategory, p.name, p.description)) &&
                (p.name.toLowerCase().includes(scannedQuery.toLowerCase()) || 
                 p.brand.toLowerCase().includes(scannedQuery.toLowerCase()))
              );
              if (!matchesInCurrent) {
                setSelectedCategory('All');
              }
              // Scroll to products grid to instantly see the matched query search results
              document.getElementById('shop-section-anchor')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}
      </AnimatePresence>

      {/* LEGAL & POLICIES MODAL HUB */}
      <AnimatePresence>
        {isLegalHubOpen && (
          <LegalHubModal
            initialTab={selectedLegalTab}
            onClose={() => setIsLegalHubOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* OFFLINE ENTERPRISE PERSISTENCE & SYNC INDICATOR */}
      <OfflineIndicator />

    </div>
  );
}
