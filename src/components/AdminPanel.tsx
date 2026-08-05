/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Lock, LogOut, ShoppingBag, Layers, 
  ShoppingCart, Settings, Plus, Edit2, Trash2, 
  Upload, X, Eye, EyeOff, Search, RefreshCw,
  Wrench
} from 'lucide-react';
import { Product, RepairRequest, TradeInRequest, Order, Coupon, BulkInquiry, BlogPost } from '../types';
import { STORE_CATEGORIES } from '../constants/categories';
import { db, storage } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Standard Admin Credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'immortal2026';

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  productIds: string[];
  isFeaturedHome: boolean;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  defaultCurrency: 'GHS' | 'USD';
  accraDeliveryCostGHS: number;
  expeditedDeliveryCostGHS: number;
}

interface AdminPanelProps {
  products: Product[];
  repairs: RepairRequest[];
  tradeins: TradeInRequest[];
  orders: Order[];
  coupons: Coupon[];
  currency: 'GHS' | 'USD';
  bulkInquiries?: BulkInquiry[];
  blogs?: BlogPost[];
  onUpdateStock: (productId: string, newStock: number) => Promise<Product>;
  onUpdateRepair: (repairId: string, status: any, notes: string, quoteGHS: number) => Promise<RepairRequest>;
  onUpdateTradeIn: (tradeInId: string, status: any, notes: string, finalOfferGHS: number) => Promise<TradeInRequest>;
  onUpdateOrder: (orderId: string, status: any) => Promise<Order>;
  onCreateCoupon: (couponData: Coupon) => Promise<Coupon>;
  onUpdateBulkInquiry?: (inquiryId: string, status: string) => Promise<BulkInquiry>;
  onCreateProduct: (productData: Product) => Promise<Product>;
  onEditProduct: (productId: string, productData: Partial<Product>) => Promise<Product>;
  onDeleteProduct: (productId: string) => Promise<any>;
  onCreateBlog?: (blogData: any) => Promise<any>;
  onDeleteBlog?: (blogId: string) => Promise<any>;
  onForceRefresh?: () => Promise<void>;
  onClose: () => void;
}

export default function AdminPanel({
  products = [], repairs = [], tradeins = [], orders = [], coupons = [], bulkInquiries = [], blogs = [],
  onUpdateStock, onUpdateRepair, onUpdateTradeIn, onUpdateOrder, onCreateCoupon,
  onCreateProduct, onEditProduct, onDeleteProduct,
  onForceRefresh,
  onClose
}: AdminPanelProps) {
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'products' | 'collections' | 'orders' | 'repairs' | 'settings'>('products');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onForceRefresh) {
        await onForceRefresh();
      }
    } catch (err) {
      console.error('Force refresh catalog error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAdminAuthenticated') === 'true';
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Core Collections & Settings States
  const [customCollections, setCustomCollections] = useState<CollectionItem[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: 'Immortal Electronics',
    logoUrl: '',
    contactEmail: 'info@immortalelectronicsgh.com',
    contactPhone: '+233 54 795 6875',
    whatsappNumber: '+233 54 795 6875',
    address: 'Adabraka, Accra, Ghana',
    facebookUrl: 'https://facebook.com/immortalelectronics',
    instagramUrl: 'https://instagram.com/immortalelectronics',
    tiktokUrl: 'https://tiktok.com/@immortalelectronics',
    defaultCurrency: 'GHS',
    accraDeliveryCostGHS: 50,
    expeditedDeliveryCostGHS: 100
  });

  // Product Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'Out'>('All');

  // Product Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  
  // Product Form States
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategory, setProdCategory] = useState('Smartphones');
  const [prodBrand, setProdBrand] = useState('Apple');
  const [prodPriceGHS, setProdPriceGHS] = useState<number | ''>(0);
  const [prodPriceUSD, setProdPriceUSD] = useState<number | ''>(0);
  const [prodSaleGHS, setProdSaleGHS] = useState<number | ''>('');
  const [prodStock, setProdStock] = useState<number>(10);
  const [prodSKU, setProdSKU] = useState('');
  const [prodStatus, setProdStatus] = useState<'Published' | 'Draft'>('Published');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodCollection, setProdCollection] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodImageUrlInput, setProdImageUrlInput] = useState('');

  // Specs form states
  const [specProcessor, setSpecProcessor] = useState('');
  const [specRam, setSpecRam] = useState('');
  const [specStorage, setSpecStorage] = useState('');
  const [specDisplay, setSpecDisplay] = useState('');
  const [specBattery, setSpecBattery] = useState('');
  const [specWarranty, setSpecWarranty] = useState('1 Year Official Local Warranty');
  const [specCondition, setSpecCondition] = useState('Brand New Sealed');
  
  // Image Upload compression States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Collections Form States
  const [colName, setColName] = useState('');
  const [colDesc, setColDesc] = useState('');
  const [colIsFeatured, setColIsFeatured] = useState(true);
  const [selectedColId, setSelectedColId] = useState<string | null>(null);

  // New Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(10);

  // Load collections and settings from Firestore
  useEffect(() => {
    const loadSettingsAndCollections = async () => {
      try {
        const timeout = (ms: number) => new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout ${ms}ms`)), ms));

        // Load collections
        const colSnap: any = await Promise.race([getDocs(collection(db, 'collections')), timeout(3000)]).catch(() => null);
        if (colSnap && !colSnap.empty) {
          const loadedCols: CollectionItem[] = [];
          colSnap.forEach((doc: any) => {
            loadedCols.push({ id: doc.id, ...doc.data() } as CollectionItem);
          });
          setCustomCollections(loadedCols);
        } else {
          const defaults: CollectionItem[] = [
            { id: 'col-new-arrivals', name: 'New Arrivals', description: 'Fresh premium stock newly arrived in Accra', productIds: [], isFeaturedHome: true, createdAt: new Date().toISOString() },
            { id: 'col-best-sellers', name: 'Best Sellers', description: 'Most popular customer devices and computers', productIds: [], isFeaturedHome: true, createdAt: new Date().toISOString() },
            { id: 'col-flagship-deals', name: 'Flagship Deals', description: 'Premium discounted offers', productIds: [], isFeaturedHome: true, createdAt: new Date().toISOString() }
          ];
          setCustomCollections(defaults);
        }

        // Load settings
        const settingsSnap: any = await Promise.race([getDocs(collection(db, 'settings')), timeout(3000)]).catch(() => null);
        if (settingsSnap) {
          settingsSnap.forEach((doc: any) => {
            if (doc.id === 'store_config') {
              setStoreSettings(doc.data() as StoreSettings);
            }
          });
        }
      } catch (err) {
        console.warn('Fallback loading store settings/collections:', err);
      }
    };

    if (isAuthenticated) {
      loadSettingsAndCollections();
    }
  }, [isAuthenticated]);

  // Handle Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginError('');

    setTimeout(() => {
      if (loginUsername.trim().toLowerCase() === ADMIN_USERNAME && loginPassword === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
        localStorage.setItem('isAdminAuthenticated', 'true');
      } else {
        setLoginError('Invalid Administrator Credentials. Please check username and passcode.');
      }
      setIsLoginLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated');
  };

  // Image upload with compression
  const compressAndUploadImage = async (file: File) => {
    if (!file.type.match('image.*')) {
      alert('Please upload JPEG, PNG, or WebP images.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Compressing image...');
    
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 900;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(file); return; }

            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((resBlob) => resolve(resBlob || file), 'image/jpeg', 0.82);
          };
          img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
      });

      setUploadStatus('Uploading photo...');

      const fileRef = ref(storage, `products/${Date.now()}_${file.name.replace(/\s+/g, '_')}`);
      let finalUrl = '';

      try {
        const snapshot = await uploadBytes(fileRef, blob);
        finalUrl = await getDownloadURL(snapshot.ref);
      } catch (storageErr) {
        console.warn('Firebase Storage upload timeout, using optimized Data URL:', storageErr);
        finalUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
      }

      if (finalUrl) {
        setProdImages(prev => [...prev, finalUrl]);
      }
    } catch (err) {
      console.error('Image compression or upload error:', err);
      alert('Could not upload photo. You can also paste an image URL directly.');
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  const handleAddImageUrl = () => {
    if (!prodImageUrlInput.trim()) return;
    setProdImages(prev => [...prev, prodImageUrlInput.trim()]);
    setProdImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setProdImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdCategory('Smartphones');
    setProdBrand('Apple');
    setProdPriceGHS(0);
    setProdPriceUSD(0);
    setProdSaleGHS('');
    setProdStock(10);
    setProdSKU(`IMM-${Math.floor(1000 + Math.random() * 9000)}`);
    setProdStatus('Published');
    setProdIsFeatured(false);
    setProdCollection('');
    setProdImages([]);
    setProdImageUrlInput('');
    setSpecProcessor('Apple A18 Pro / Snapdragon 8 Gen 3');
    setSpecRam('8GB / 12GB Unified');
    setSpecStorage('256GB / 512GB NVMe');
    setSpecDisplay('OLED Super Retina XDR');
    setSpecBattery('All-Day Battery');
    setSpecWarranty('1 Year Official Warranty');
    setSpecCondition('Brand New Sealed');
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name || '');
    setProdDesc(prod.description || '');
    setProdCategory(prod.category || 'Smartphones');
    setProdBrand(prod.brand || 'Apple');
    setProdPriceGHS(prod.priceGHS || 0);
    setProdPriceUSD(prod.priceUSD || 0);
    setProdSaleGHS(prod.specs?.['SalePriceGHS'] ? Number(prod.specs['SalePriceGHS']) : '');
    setProdStock(typeof prod.stock === 'number' ? prod.stock : 10);
    setProdSKU(prod.specs?.['SKU'] || prod.id);
    setProdStatus(prod.status === 'Draft' ? 'Draft' : 'Published');
    setProdIsFeatured(!!prod.isFeatured);
    
    const existingCol = customCollections.find(c => c.productIds.includes(prod.id))?.id || '';
    setProdCollection(existingCol);

    const imagesList = Array.isArray(prod.images) && prod.images.length > 0 
      ? prod.images 
      : (prod.image ? [prod.image] : []);
    setProdImages(imagesList);
    setProdImageUrlInput('');

    setSpecProcessor(prod.specs?.['Processor'] || '');
    setSpecRam(prod.specs?.['RAM'] || '');
    setSpecStorage(prod.specs?.['Storage'] || '');
    setSpecDisplay(prod.specs?.['Display'] || '');
    setSpecBattery(prod.specs?.['Battery'] || '');
    setSpecWarranty(prod.specs?.['Warranty'] || '1 Year Official Warranty');
    setSpecCondition(prod.specs?.['Condition'] || 'Brand New Sealed');

    setIsProductModalOpen(true);
  };

  // Auto-calculate USD from GHS when price changes
  const handleGHSPriceChange = (val: number | '') => {
    setProdPriceGHS(val);
    if (typeof val === 'number' && val > 0) {
      setProdPriceUSD(Math.round((val / 15) * 100) / 100);
    }
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      alert('Product title is required.');
      return;
    }

    const priceGHSNum = typeof prodPriceGHS === 'number' ? prodPriceGHS : Number(prodPriceGHS) || 0;
    const priceUSDNum = typeof prodPriceUSD === 'number' ? prodPriceUSD : Number(prodPriceUSD) || (Math.round((priceGHSNum / 15) * 100) / 100);
    const primaryImg = prodImages.length > 0 ? prodImages[0] : 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600&auto=format&fit=crop';

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(100 + Math.random() * 900)}`,
      name: prodName.trim(),
      description: prodDesc.trim() || `${prodBrand} ${prodName} - High performance electronic device in Accra.`,
      category: prodCategory,
      brand: prodBrand.trim() || 'Generic',
      priceGHS: priceGHSNum,
      priceUSD: priceUSDNum,
      stock: Number(prodStock) || 0,
      image: primaryImg,
      images: prodImages.length > 0 ? prodImages : [primaryImg],
      isFeatured: prodIsFeatured,
      status: prodStatus,
      rating: editingProduct?.rating || 4.9,
      reviewsCount: editingProduct?.reviewsCount || 12,
      colors: editingProduct?.colors || ['Space Gray', 'Silver'],
      isNew: editingProduct?.isNew ?? true,
      specs: {
        'SKU': prodSKU || `IMM-${Math.floor(1000 + Math.random() * 9000)}`,
        'Processor': specProcessor || 'High Performance Chipset',
        'RAM': specRam || 'Unified System Memory',
        'Storage': specStorage || 'High Speed Storage',
        'Display': specDisplay || 'High Refresh Rate Display',
        'Battery': specBattery || 'Long Life Battery',
        'Warranty': specWarranty || '1 Year Official Warranty',
        'Condition': specCondition || 'Brand New Sealed',
        'SalePriceGHS': typeof prodSaleGHS === 'number' && prodSaleGHS > 0 ? String(prodSaleGHS) : ''
      }
    };

    setIsSavingProduct(true);

    try {
      if (editingProduct) {
        await onEditProduct(editingProduct.id, productPayload);
        
        // Update collections
        let colUpdates = [...customCollections];
        colUpdates = colUpdates.map(col => ({
          ...col,
          productIds: col.productIds.filter(pid => pid !== editingProduct.id)
        }));
        if (prodCollection) {
          colUpdates = colUpdates.map(col => {
            if (col.id === prodCollection) {
              return { ...col, productIds: [...new Set([...col.productIds, editingProduct.id])] };
            }
            return col;
          });
        }
        setCustomCollections(colUpdates);
        for (const col of colUpdates) {
          setDoc(doc(db, 'collections', col.id), col).catch(() => {});
        }
      } else {
        await onCreateProduct(productPayload);

        if (prodCollection) {
          const colUpdates = customCollections.map(col => {
            if (col.id === prodCollection) {
              return { ...col, productIds: [...new Set([...col.productIds, productPayload.id])] };
            }
            return col;
          });
          setCustomCollections(colUpdates);
          const activeCol = colUpdates.find(col => col.id === prodCollection);
          if (activeCol) {
            setDoc(doc(db, 'collections', activeCol.id), activeCol).catch(() => {});
          }
        }
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('An error occurred while publishing product.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Delete product permanently
  const handleDeleteProductConfirmed = async (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to permanently remove "${productName}" from the storefront? It will not reappear on reload.`)) {
      try {
        await onDeleteProduct(productId);
        
        const colUpdates = customCollections.map(col => ({
          ...col,
          productIds: col.productIds.filter(id => id !== productId)
        }));
        setCustomCollections(colUpdates);
        for (const col of colUpdates) {
          setDoc(doc(db, 'collections', col.id), col).catch(() => {});
        }
      } catch (err) {
        console.error('Delete product failed:', err);
        alert('Could not delete product.');
      }
    }
  };

  // Quick Inline Stock Update
  const handleQuickStock = async (productId: string, currentStock: number, delta: number) => {
    const nextStock = Math.max(0, currentStock + delta);
    try {
      await onUpdateStock(productId, nextStock);
    } catch (err) {
      console.error('Stock update error:', err);
    }
  };

  // Quick Inline Status Toggle
  const handleQuickToggleStatus = async (prod: Product) => {
    const nextStatus = prod.status === 'Published' ? 'Draft' : 'Published';
    try {
      await onEditProduct(prod.id, { status: nextStatus });
    } catch (err) {
      console.error('Status toggle error:', err);
    }
  };

  // Collection CRUD
  const handleCreateOrUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim()) return;

    try {
      if (selectedColId) {
        const updatedCols = customCollections.map(col => {
          if (col.id === selectedColId) {
            return {
              ...col,
              name: colName,
              description: colDesc,
              isFeaturedHome: colIsFeatured
            };
          }
          return col;
        });
        setCustomCollections(updatedCols);
        const active = updatedCols.find(c => c.id === selectedColId);
        if (active) {
          await setDoc(doc(db, 'collections', active.id), active);
        }
      } else {
        const id = `col-${colName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(100 + Math.random() * 900)}`;
        const payload: CollectionItem = {
          id,
          name: colName,
          description: colDesc,
          productIds: [],
          isFeaturedHome: colIsFeatured,
          createdAt: new Date().toISOString()
        };
        const updated = [...customCollections, payload];
        setCustomCollections(updated);
        await setDoc(doc(db, 'collections', id), payload);
      }

      setColName('');
      setColDesc('');
      setColIsFeatured(true);
      setSelectedColId(null);
    } catch (err) {
      console.error('Failed to sync collection:', err);
    }
  };

  const toggleProductInCollection = async (colId: string, productId: string) => {
    try {
      const updated = customCollections.map(col => {
        if (col.id === colId) {
          const exists = col.productIds.includes(productId);
          const nextProductIds = exists 
            ? col.productIds.filter(id => id !== productId)
            : [...col.productIds, productId];
          return { ...col, productIds: nextProductIds };
        }
        return col;
      });
      setCustomCollections(updated);
      
      const changedCol = updated.find(col => col.id === colId);
      if (changedCol) {
        await setDoc(doc(db, 'collections', colId), changedCol);
      }
    } catch (err) {
      console.error('Error toggling product in collection:', err);
    }
  };

  const handleDeleteCollection = async (colId: string) => {
    if (confirm('Delete this custom collection? The products will remain in store catalog.')) {
      try {
        setCustomCollections(prev => prev.filter(c => c.id !== colId));
        await deleteDoc(doc(db, 'collections', colId));
      } catch (err) {
        console.error('Delete collection error:', err);
      }
    }
  };

  // Save Store Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'store_config'), storeSettings);
      alert('Store settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  // Create Coupon
  const handleCreateNewCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const newCoupon: Coupon = {
        code: couponCode.trim().toUpperCase(),
        discountPercent: Number(couponDiscount) || 10,
        active: true,
        minSpendGHS: 0
      };
      await onCreateCoupon(newCoupon);
      setCouponCode('');
      alert(`Coupon code ${newCoupon.code} created successfully!`);
    } catch (err) {
      console.error('Failed creating coupon:', err);
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: any) => {
    try {
      await onUpdateOrder(orderId, newStatus);
    } catch (err) {
      console.error('Failed updating status:', err);
    }
  };

  // Filtered Products List
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.specs?.['SKU'] && p.specs['SKU'].toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || p.brand.toLowerCase() === selectedBrand.toLowerCase();
    
    let matchesStock = true;
    if (stockFilter === 'Low') matchesStock = p.stock > 0 && p.stock <= 5;
    else if (stockFilter === 'Out') matchesStock = p.stock === 0;

    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  const categoriesList = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const brandsList = ['All', ...Array.from(new Set(products.map(p => p.brand)))];

  const publishedCount = products.filter(p => p.status === 'Published' || !p.status).length;
  const lowStockCount = products.filter(p => p.stock <= 5 && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full h-full md:h-[92vh] md:max-w-7xl rounded-none md:rounded-2xl bg-white dark:bg-[#0c0c0e] border-0 md:border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* LOGIN GATE */}
        <AnimatePresence>
          {!isAuthenticated && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0a0c]/98 px-4"
            >
              <div className="w-full max-w-md bg-white dark:bg-[#121215] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-blue-600" />
                
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
                >
                  <X size={18} />
                </button>

                <div className="text-center mb-8">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 mb-4">
                    <ShieldCheck size={28} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Store Manager Terminal
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter admin credentials to manage store front inventory
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="admin"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-600 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Passcode
                    </label>
                    <div className="relative">
                      <input
                        ref={passwordInputRef}
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl pl-4 pr-10 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-600 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoginLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isLoginLoading ? 'Verifying...' : 'Access Dashboard'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER */}
        <header className="px-6 py-4 bg-white dark:bg-[#101014] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/20">
              IE
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-gray-900 dark:text-white">
                  Immortal Storefront Management
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" /> Live Store
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage inventory, custom collections, checkout orders & repairs
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleForceRefresh}
              disabled={isRefreshing}
              className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold flex items-center space-x-1.5 transition"
              title="Re-sync Storefront Database"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Sync Store</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
              title="Logout Admin"
            >
              <LogOut size={16} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* NAVIGATION TABS */}
        <div className="px-6 py-2.5 bg-gray-50/80 dark:bg-[#0e0e11] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between overflow-x-auto shrink-0">
          <div className="flex items-center space-x-1">
            {[
              { id: 'products', label: 'Storefront Products', icon: ShoppingBag, count: products.length },
              { id: 'collections', label: 'Custom Collections', icon: Layers, count: customCollections.length },
              { id: 'orders', label: 'Checkout Orders', icon: ShoppingCart, count: orders.length },
              { id: 'repairs', label: 'Repairs & Trade-Ins', icon: Wrench, count: repairs.length + tradeins.length },
              { id: 'settings', label: 'Store Settings & Coupons', icon: Settings, count: coupons.length }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleOpenAddProduct}
            className="hidden sm:flex px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition shrink-0"
          >
            <Plus size={16} />
            <span>Upload New Product</span>
          </button>
        </div>

        {/* MAIN CONTENT CANVAS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: PRODUCTS INVENTORY */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              
              {/* KPI STATS BAR */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Products</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{products.length}</div>
                  <div className="text-[11px] text-gray-500 mt-1">Live in store database</div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Published Online</div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{publishedCount}</div>
                  <div className="text-[11px] text-emerald-500 mt-1">Visible on storefront</div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Low Stock Warning</div>
                  <div className="text-2xl font-bold text-amber-500 mt-1">{lowStockCount}</div>
                  <div className="text-[11px] text-amber-500 mt-1">5 or fewer items left</div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Out of Stock</div>
                  <div className="text-2xl font-bold text-red-500 mt-1">{outOfStockCount}</div>
                  <div className="text-[11px] text-red-500 mt-1">Needs inventory refill</div>
                </div>
              </div>

              {/* FILTERS & UPLOAD ACTION */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="flex flex-1 flex-wrap gap-2 items-center">
                  <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search name, brand, SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:border-blue-600"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
                  >
                    {categoriesList.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                  </select>

                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
                  >
                    {brandsList.map(b => <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>)}
                  </select>

                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as any)}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
                  >
                    <option value="All">All Stock Levels</option>
                    <option value="Low">Low Stock (&le; 5)</option>
                    <option value="Out">Out of Stock (0)</option>
                  </select>
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition"
                >
                  <Plus size={16} />
                  <span>Upload Product</span>
                </button>
              </div>

              {/* PRODUCTS TABLE */}
              <div className="bg-white dark:bg-[#101014] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 uppercase font-mono text-[10px] tracking-wider border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Category / Brand</th>
                        <th className="px-4 py-3">Price (GHS / USD)</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800/60 font-sans">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                            No matching products found. Click "Upload Product" to add items to your store catalog.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map(prod => (
                          <tr key={prod.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={prod.image} 
                                  alt={prod.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shrink-0" 
                                />
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                    {prod.name}
                                  </div>
                                  <div className="text-[11px] text-gray-500 font-mono">
                                    SKU: {prod.specs?.['SKU'] || prod.id}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900 dark:text-white">{prod.category}</div>
                              <div className="text-[11px] text-gray-500">{prod.brand}</div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="font-bold text-gray-900 dark:text-white">
                                GH₵ {prod.priceGHS.toLocaleString()}
                              </div>
                              <div className="text-[11px] text-gray-500">
                                ${prod.priceUSD} USD
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-1.5">
                                <button
                                  onClick={() => handleQuickStock(prod.id, prod.stock, -1)}
                                  className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold"
                                  title="Decrease Stock"
                                >
                                  -
                                </button>
                                <span className={`px-2 py-1 rounded-md text-xs font-mono font-bold ${
                                  prod.stock === 0 ? 'bg-red-500/10 text-red-500' : prod.stock <= 5 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                                }`}>
                                  {prod.stock}
                                </span>
                                <button
                                  onClick={() => handleQuickStock(prod.id, prod.stock, 1)}
                                  className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold"
                                  title="Increase Stock"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleQuickToggleStatus(prod)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition ${
                                  prod.status === 'Draft' 
                                    ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                }`}
                              >
                                {prod.status || 'Published'}
                              </button>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 transition"
                                  title="Edit Product"
                                >
                                  <Edit2 size={15} />
                                </button>

                                <button
                                  onClick={() => handleDeleteProductConfirmed(prod.id, prod.name)}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition"
                                  title="Delete Product Permanently"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COLLECTIONS */}
          {activeTab === 'collections' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Create / Edit Collection Form */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#101014] border border-gray-200 dark:border-gray-800 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Layers size={16} className="text-blue-600" />
                    <span>{selectedColId ? 'Edit Collection' : 'Create Custom Collection'}</span>
                  </h3>

                  <form onSubmit={handleCreateOrUpdateCollection} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Collection Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Flagship Deals, Best Sellers"
                        value={colName}
                        onChange={(e) => setColName(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-blue-600 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Description</label>
                      <textarea
                        rows={2}
                        placeholder="Brief summary for storefront shoppers"
                        value={colDesc}
                        onChange={(e) => setColDesc(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-blue-600 text-gray-900 dark:text-white"
                      />
                    </div>

                    <label className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={colIsFeatured}
                        onChange={(e) => setColIsFeatured(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Feature on Storefront Homepage</span>
                    </label>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
                    >
                      {selectedColId ? 'Update Collection' : 'Save Collection'}
                    </button>

                    {selectedColId && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedColId(null);
                          setColName('');
                          setColDesc('');
                        }}
                        className="w-full py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      >
                        Cancel Editing
                      </button>
                    )}
                  </form>
                </div>

                {/* Collections List */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Active Collections</h3>
                  {customCollections.map(col => (
                    <div key={col.id} className="p-4 rounded-2xl bg-white dark:bg-[#101014] border border-gray-200 dark:border-gray-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white text-sm">{col.name}</div>
                          <div className="text-xs text-gray-500">{col.description} &bull; {col.productIds.length} products</div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setSelectedColId(col.id);
                              setColName(col.name);
                              setColDesc(col.description);
                              setColIsFeatured(col.isFeaturedHome);
                            }}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-blue-600"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCollection(col.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Product selector tags inside collection */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800/60">
                        <div className="text-[11px] font-semibold text-gray-500 mb-2">Toggle Products in this Collection:</div>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                          {products.map(p => {
                            const isSelected = col.productIds.includes(p.id);
                            return (
                              <button
                                key={p.id}
                                onClick={() => toggleProductInCollection(col.id, p.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition ${
                                  isSelected 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}{p.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: CHECKOUT ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Customer Storefront Orders</h3>
              <div className="bg-white dark:bg-[#101014] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Total Amount</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800/60">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No checkout orders placed yet. Orders from storefront checkout will appear here live.
                        </td>
                      </tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                          <td className="px-4 py-3 font-mono font-bold text-gray-900 dark:text-white">
                            {order.id}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900 dark:text-white">{order.customerName}</div>
                            <div className="text-[11px] text-gray-500">{order.customerPhone} &bull; {order.customerEmail}</div>
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                            GH₵ {order.totalGHS.toLocaleString()} (${order.totalUSD} USD)
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              order.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {order.paymentStatus || 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">
                            {order.status}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: REPAIRS & TRADE-INS */}
          {activeTab === 'repairs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Customer Repair Requests</h3>
                <div className="bg-white dark:bg-[#101014] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Device / Fault</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Quote (GHS)</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800/60">
                      {repairs.length === 0 ? (
                        <tr><td colSpan={4} className="p-4 text-center text-gray-500">No repair requests logged.</td></tr>
                      ) : (
                        repairs.map(rep => (
                          <tr key={rep.id}>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{rep.brand} {rep.model} - {rep.faultDescription}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{rep.customerName} ({rep.customerPhone})</td>
                            <td className="px-4 py-3 font-bold">GH₵ {rep.quotationGHS}</td>
                            <td className="px-4 py-3">{rep.status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Customer Trade-In Valuation Requests</h3>
                <div className="bg-white dark:bg-[#101014] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Device Offered</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Final Offer</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800/60">
                      {tradeins.length === 0 ? (
                        <tr><td colSpan={4} className="p-4 text-center text-gray-500">No trade-in submissions.</td></tr>
                      ) : (
                        tradeins.map(ti => (
                          <tr key={ti.id}>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{ti.brand} {ti.model} ({ti.condition})</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{ti.customerName} ({ti.customerPhone})</td>
                            <td className="px-4 py-3 font-bold">GH₵ {ti.finalOfferGHS || ti.valuationEstimateGHS}</td>
                            <td className="px-4 py-3">{ti.status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS & COUPONS */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Store Configuration */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#101014] border border-gray-200 dark:border-gray-800 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Storefront Contact & Configuration</h3>
                <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Store Name</label>
                    <input
                      type="text"
                      value={storeSettings.storeName}
                      onChange={(e) => setStoreSettings(s => ({ ...s, storeName: e.target.value }))}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Contact Phone</label>
                      <input
                        type="text"
                        value={storeSettings.contactPhone}
                        onChange={(e) => setStoreSettings(s => ({ ...s, contactPhone: e.target.value }))}
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">WhatsApp Number</label>
                      <input
                        type="text"
                        value={storeSettings.whatsappNumber}
                        onChange={(e) => setStoreSettings(s => ({ ...s, whatsappNumber: e.target.value }))}
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Accra Local Delivery Fee (GHS)</label>
                    <input
                      type="number"
                      value={storeSettings.accraDeliveryCostGHS}
                      onChange={(e) => setStoreSettings(s => ({ ...s, accraDeliveryCostGHS: Number(e.target.value) || 0 }))}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                  >
                    Save Configuration
                  </button>
                </form>
              </div>

              {/* Discount Coupons */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#101014] border border-gray-200 dark:border-gray-800 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Store Discount Coupons</h3>
                
                <form onSubmit={handleCreateNewCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code e.g. ACCRA10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 p-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl text-xs uppercase font-mono"
                  />
                  <input
                    type="number"
                    placeholder="% Off"
                    value={couponDiscount}
                    onChange={(e) => setCouponDiscount(Number(e.target.value))}
                    className="w-20 p-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shrink-0"
                  >
                    Add Coupon
                  </button>
                </form>

                <div className="space-y-2 pt-2">
                  {coupons.map(c => (
                    <div key={c.code} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-gray-900 dark:text-white">{c.code}</span>
                        <span className="ml-2 text-emerald-500 font-bold">{c.discountPercent}% OFF</span>
                      </div>
                      <span className="text-[10px] text-gray-500">{c.active ? 'Active' : 'Expired'}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* UPLOAD / EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {isProductModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#121216] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-2xl space-y-5 my-8"
            >
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {editingProduct ? 'Edit Storefront Product' : 'Upload New Product to Storefront'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Product will publish immediately to live storefront upon saving
                  </p>
                </div>

                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                
                {/* Title & Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. iPhone 16 Pro Max 256GB"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-blue-600 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Brand *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apple, Samsung, HP"
                      value={prodBrand}
                      onChange={(e) => setProdBrand(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-blue-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Category, Status & Collection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Category *</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl outline-none text-gray-900 dark:text-white"
                    >
                      {STORE_CATEGORIES.map(cat => <option key={cat.id} value={cat.label}>{cat.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Status</label>
                    <select
                      value={prodStatus}
                      onChange={(e) => setProdStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl outline-none text-gray-900 dark:text-white"
                    >
                      <option value="Published">Published (Visible)</option>
                      <option value="Draft">Draft (Hidden)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Collection</label>
                    <select
                      value={prodCollection}
                      onChange={(e) => setProdCollection(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl outline-none text-gray-900 dark:text-white"
                    >
                      <option value="">None (Standard Catalog)</option>
                      {customCollections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Price (GHS) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="18500"
                      value={prodPriceGHS}
                      onChange={(e) => handleGHSPriceChange(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg outline-none font-bold text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Price (USD)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="1233"
                      value={prodPriceUSD}
                      onChange={(e) => setProdPriceUSD(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Sale Discount (GHS)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 17500"
                      value={prodSaleGHS}
                      onChange={(e) => setProdSaleGHS(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Stock Qty *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="10"
                      value={prodStock}
                      onChange={(e) => setProdStock(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg outline-none font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Images upload & URL input */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Product Gallery Photos</label>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mb-2">
                    <label className="flex-1 p-2.5 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-xl flex items-center justify-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                      <Upload size={16} className="text-blue-600" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {isUploading ? uploadStatus : 'Upload Image File (Compressed & Saved)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={(e) => e.target.files?.[0] && compressAndUploadImage(e.target.files[0])}
                        className="hidden"
                      />
                    </label>

                    <div className="flex items-center space-x-1 sm:w-1/2">
                      <input
                        type="url"
                        placeholder="Or paste image URL"
                        value={prodImageUrlInput}
                        onChange={(e) => setProdImageUrlInput(e.target.value)}
                        className="flex-1 p-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-3 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Gallery Thumbnails */}
                  {prodImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {prodImages.map((img, idx) => (
                        <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                          <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-0.5 right-0.5 p-1 rounded-full bg-black/70 text-white opacity-90 hover:opacity-100"
                          >
                            <X size={10} />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-0 inset-x-0 bg-blue-600 text-white text-[8px] font-bold text-center py-0.5">
                              Main Photo
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Detailed Specifications */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Key Specifications</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Processor e.g. A18 Pro"
                      value={specProcessor}
                      onChange={(e) => setSpecProcessor(e.target.value)}
                      className="p-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="RAM e.g. 8GB Unified"
                      value={specRam}
                      onChange={(e) => setSpecRam(e.target.value)}
                      className="p-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Storage e.g. 256GB"
                      value={specStorage}
                      onChange={(e) => setSpecStorage(e.target.value)}
                      className="p-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Display e.g. 6.9-inch OLED"
                      value={specDisplay}
                      onChange={(e) => setSpecDisplay(e.target.value)}
                      className="p-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Battery e.g. All-Day Battery"
                      value={specBattery}
                      onChange={(e) => setSpecBattery(e.target.value)}
                      className="p-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="SKU Code"
                      value={prodSKU}
                      onChange={(e) => setProdSKU(e.target.value)}
                      className="p-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-lg font-mono"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Provide overview details for storefront buyers..."
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                  <label className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={prodIsFeatured}
                      onChange={(e) => setProdIsFeatured(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Highlight as Featured Item on Storefront</span>
                  </label>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsProductModalOpen(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-semibold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingProduct}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                    >
                      {isSavingProduct ? 'Publishing...' : (editingProduct ? 'Save Changes' : 'Publish Product')}
                    </button>
                  </div>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
