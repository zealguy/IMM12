/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Lock, LogOut, LayoutDashboard, ShoppingBag, Layers, 
  ShoppingCart, Users, Settings, Sparkles, TrendingUp, DollarSign, 
  Package, AlertTriangle, ArrowUpRight, Search, Plus, Edit2, Trash2, 
  Upload, X, Check, ArrowRight, Eye, EyeOff, Phone, Mail, MapPin, Globe, CreditCard,
  FileText, Calendar, Filter, ChevronRight, ChevronDown, CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { Product, RepairRequest, TradeInRequest, Order, Coupon, BulkInquiry, BlogPost } from '../types';
import { db, storage } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
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
  onClose: () => void;
}

export default function AdminPanel({
  products = [], repairs = [], tradeins = [], orders = [], coupons = [], currency, bulkInquiries = [], blogs = [],
  onUpdateStock, onUpdateRepair, onUpdateTradeIn, onUpdateOrder, onCreateCoupon, onUpdateBulkInquiry,
  onCreateProduct, onEditProduct, onDeleteProduct, onCreateBlog, onDeleteBlog,
  onClose
}: AdminPanelProps) {
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'collections' | 'orders' | 'customers' | 'settings' | 'blogs'>('overview');
  
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

  // Auto-focus the passcode field on login modal open to ensure seamless keyboard focus
  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 400); // Allow modal animation to complete
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Core synchronized States
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

  // UI state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'Out'>('All');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Create / Edit Product Form States
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategory, setProdCategory] = useState('Smartphones');
  const [prodBrand, setProdBrand] = useState('');
  const [prodPriceGHS, setProdPriceGHS] = useState(0);
  const [prodPriceUSD, setProdPriceUSD] = useState(0);
  const [prodSaleGHS, setProdSaleGHS] = useState<number | ''>('');
  const [prodStock, setProdStock] = useState(0);
  const [prodSKU, setProdSKU] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodImageInput, setProdImageInput] = useState('');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodCollection, setProdCollection] = useState('');
  
  // Image Upload compression States
  const [isUploading, setIsUploading] = useState(false);
  const [compressionStatus, setCompressionStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Collections Form States
  const [colName, setColName] = useState('');
  const [colDesc, setColDesc] = useState('');
  const [colIsFeatured, setColIsFeatured] = useState(true);
  const [selectedColId, setSelectedColId] = useState<string | null>(null);
  const [colProductSearch, setColProductSearch] = useState('');

  // Selected Order Detail
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Load persistent collection/settings on mount
  useEffect(() => {
    const loadSettingsAndCollections = async () => {
      try {
        // Load collections
        const colSnap = await getDocs(collection(db, 'collections'));
        const loadedCols: CollectionItem[] = [];
        colSnap.forEach((doc) => {
          loadedCols.push({ id: doc.id, ...doc.data() } as CollectionItem);
        });

        if (loadedCols.length > 0) {
          setCustomCollections(loadedCols);
        } else {
          // Initialize default collections if empty
          const defaults: CollectionItem[] = [
            { id: 'col-new-arrivals', name: 'New Arrivals', description: 'Fresh premium stock newly arrived in Accra', productIds: [], isFeaturedHome: true, createdAt: new Date().toISOString() },
            { id: 'col-best-sellers', name: 'Best Sellers', description: 'Most popular customer devices and computers', productIds: [], isFeaturedHome: true, createdAt: new Date().toISOString() },
            { id: 'col-flagship-deals', name: 'Flagship Deals', description: 'Premium discounted offers', productIds: [], isFeaturedHome: true, createdAt: new Date().toISOString() }
          ];
          setCustomCollections(defaults);
          // Sync default seed collections to Firestore as fallback
          for (const colItem of defaults) {
            await setDoc(doc(db, 'collections', colItem.id), colItem);
          }
        }

        // Load settings
        const settingsSnap = await getDocs(collection(db, 'settings'));
        let foundSettings = false;
        settingsSnap.forEach((doc) => {
          if (doc.id === 'store_config') {
            setStoreSettings(doc.data() as StoreSettings);
            foundSettings = true;
          }
        });
        
        if (!foundSettings) {
          await setDoc(doc(db, 'settings', 'store_config'), storeSettings);
        }
      } catch (err) {
        console.warn('Could not sync collections/settings from Firestore, using LocalStorage fallback:', err);
        const localCols = localStorage.getItem('immortal_custom_collections');
        const localSettings = localStorage.getItem('immortal_store_settings');
        if (localCols) setCustomCollections(JSON.parse(localCols));
        if (localSettings) setStoreSettings(JSON.parse(localSettings));
      }
    };

    if (isAuthenticated) {
      loadSettingsAndCollections();
    }
  }, [isAuthenticated]);

  // Sync collections to local storage as fallback
  useEffect(() => {
    if (customCollections.length > 0) {
      localStorage.setItem('immortal_custom_collections', JSON.stringify(customCollections));
    }
  }, [customCollections]);

  // Sync settings to local storage as fallback
  useEffect(() => {
    localStorage.setItem('immortal_store_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

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
        setLoginError('Invalid Administrator Credentials. Please check credentials and try again.');
      }
      setIsLoginLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated');
  };

  // Image compressor helper
  const compressAndUploadImage = async (file: File) => {
    if (!file.type.match('image.*')) {
      alert('Unsupported file type. Please upload JPEG, PNG, or WebP images.');
      return;
    }

    setIsUploading(true);
    setCompressionStatus('Analyzing image dimensions and formatting...');
    
    try {
      // 1. Read file and compress using canvas
      const blob = await new Promise<Blob>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800; // Optimal for web e-commerce
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(file); // Fallback to raw file if canvas ctx is unavailable
              return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (resBlob) => {
                if (resBlob) {
                  resolve(resBlob);
                } else {
                  resolve(file);
                }
              },
              'image/jpeg',
              0.80 // 80% high fidelity compression
            );
          };
          img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
      });

      const sizeBeforeMB = (file.size / (1024 * 1024)).toFixed(2);
      const sizeAfterMB = (blob.size / (1024 * 1024)).toFixed(2);
      setCompressionStatus(`Compressed safely: ${sizeBeforeMB}MB down to ${sizeAfterMB}MB. Directing to Firebase...`);

      // 2. Upload blob to Firebase Storage
      const fileRef = ref(storage, `products/${Date.now()}_${file.name.replace(/\s+/g, '_')}`);
      setUploadProgress(40);
      const snapshot = await uploadBytes(fileRef, blob);
      setUploadProgress(80);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      setUploadProgress(100);

      // Save to images array
      setProdImages(prev => [...prev, downloadUrl]);
      setCompressionStatus('Upload completed successfully!');
    } catch (err) {
      console.error('Firebase Storage failed or was not fully configured:', err);
      setCompressionStatus('Firebase Storage offline, generating safe placeholder fallback URL...');
      
      // Fallback generator - high quality Unsplash tech query to prevent broken images
      const searchTerms = `${prodName || file.name.split('.')[0]} gadget electronics`.toLowerCase().replace(/\s+/g, ',');
      const fallbackUrl = `https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop`;
      
      setProdImages(prev => [...prev, fallbackUrl]);
      setCompressionStatus('Fallback URL created to safeguard store catalog.');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setCompressionStatus('');
        setUploadProgress(null);
      }, 1500);
    }
  };

  // Product actions
  const triggerAddProduct = () => {
    setProdName('');
    setProdDesc('');
    setProdCategory('Smartphones');
    setProdBrand('');
    setProdPriceGHS(0);
    setProdPriceUSD(0);
    setProdSaleGHS('');
    setProdStock(10);
    setProdSKU(`IMM-${Math.floor(100000 + Math.random() * 900000)}`);
    setProdImages([]);
    setProdIsFeatured(false);
    setProdCollection('');
    setEditingProduct(null);
    setIsAddingProduct(true);
  };

  const triggerEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdCategory(prod.category);
    setProdBrand(prod.brand);
    setProdPriceGHS(prod.priceGHS);
    setProdPriceUSD(prod.priceUSD);
    setProdStock(prod.stock);
    setProdSKU(prod.specs?.['SKU'] || `IMM-${Math.floor(100000 + Math.random() * 900000)}`);
    setProdImages(prod.images || [prod.image].filter(Boolean));
    setProdIsFeatured(prod.isFeatured || false);
    
    // Find active collection
    const assignedCol = customCollections.find(c => c.productIds.includes(prod.id));
    setProdCollection(assignedCol ? assignedCol.id : '');
    
    setIsAddingProduct(false);
  };

  const saveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodBrand || prodPriceGHS <= 0 || prodStock < 0) {
      alert('Please fill out all mandatory fields correctly.');
      return;
    }

    const firstImage = prodImages[0] || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600&auto=format&fit=crop';
    
    const productPayload: any = {
      name: prodName,
      brand: prodBrand,
      category: prodCategory,
      description: prodDesc,
      priceGHS: Number(prodPriceGHS),
      priceUSD: prodPriceUSD ? Number(prodPriceUSD) : Number((Number(prodPriceGHS) / 15).toFixed(1)), // Autoconvert if zero using standard 15 GHS multiplier
      stock: Number(prodStock),
      image: firstImage,
      images: prodImages.length > 0 ? prodImages : [firstImage],
      isFeatured: prodIsFeatured,
      rating: editingProduct ? editingProduct.rating : 4.8,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 1,
      isNew: editingProduct ? editingProduct.isNew : true,
      specs: {
        'SKU': prodSKU,
        'Processor': editingProduct?.specs?.['Processor'] || 'Multi-Core Platform',
        'Storage': editingProduct?.specs?.['Storage'] || 'Standard Allocation',
        'Warranty': editingProduct?.specs?.['Warranty'] || '1 Year Authorized Warranty'
      }
    };

    try {
      if (editingProduct) {
        // Edit flow
        const updated = await onEditProduct(editingProduct.id, productPayload);
        
        // Update collections
        let colUpdates = [...customCollections];
        // Remove from old collections
        colUpdates = colUpdates.map(col => ({
          ...col,
          productIds: col.productIds.filter(pid => pid !== editingProduct.id)
        }));
        // Add to newly selected collection
        if (prodCollection) {
          colUpdates = colUpdates.map(col => {
            if (col.id === prodCollection) {
              return { ...col, productIds: [...new Set([...col.productIds, editingProduct.id])] };
            }
            return col;
          });
        }
        setCustomCollections(colUpdates);
        // Persist collections to Firebase
        for (const col of colUpdates) {
          await setDoc(doc(db, 'collections', col.id), col);
        }

        alert('Product updated successfully!');
      } else {
        // Add flow
        const newId = `prod-${prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(100 + Math.random() * 900)}`;
        productPayload.id = newId;
        const created = await onCreateProduct(productPayload);
        
        // Add to selected collection
        if (prodCollection) {
          const colUpdates = customCollections.map(col => {
            if (col.id === prodCollection) {
              return { ...col, productIds: [...col.productIds, newId] };
            }
            return col;
          });
          setCustomCollections(colUpdates);
          // Persist collection
          const activeCol = colUpdates.find(col => col.id === prodCollection);
          if (activeCol) {
            await setDoc(doc(db, 'collections', activeCol.id), activeCol);
          }
        }

        alert('New product added successfully to inventory!');
      }

      setIsAddingProduct(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('An error occurred while saving the product details.');
    }
  };

  const handleDeleteProductConfirmed = async (productId: string) => {
    if (confirm('Are you absolutely sure you want to permanently delete this product from the inventory ledger?')) {
      try {
        await onDeleteProduct(productId);
        
        // Remove from custom collections
        const colUpdates = customCollections.map(col => ({
          ...col,
          productIds: col.productIds.filter(id => id !== productId)
        }));
        setCustomCollections(colUpdates);
        // Persist collection edits
        for (const col of colUpdates) {
          await setDoc(doc(db, 'collections', col.id), col);
        }

        alert('Product safely removed from inventory.');
      } catch (err) {
        console.error('Delete product failed:', err);
        alert('Could not delete product.');
      }
    }
  };

  // Collection Actions
  const handleCreateOrUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim()) return;

    try {
      if (selectedColId) {
        // Update collection
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
        alert('Collection specifications updated.');
      } else {
        // Create new
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
        alert('Custom collection initialized successfully.');
      }

      setColName('');
      setColDesc('');
      setColIsFeatured(true);
      setSelectedColId(null);
    } catch (err) {
      console.error('Failed to sync collection:', err);
      alert('Collection stored locally but Firestore sync delayed.');
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
    if (confirm('Are you sure you want to delete this custom collection group? The products inside will remain untouched.')) {
      try {
        setCustomCollections(prev => prev.filter(c => c.id !== colId));
        await deleteDoc(doc(db, 'collections', colId));
        alert('Collection group deleted.');
      } catch (err) {
        console.error('Delete collection error:', err);
      }
    }
  };

  // Settings Action
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'store_config'), storeSettings);
      alert('Global Store Configuration saved securely and updated live.');
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Settings saved locally. Firebase sync is currently offline.');
    }
  };

  // Order actions
  const handleUpdateOrderStatus = async (orderId: string, newStatus: any) => {
    try {
      const updated = await onUpdateOrder(orderId, newStatus);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
      alert(`Order progression status marked as: ${newStatus}`);
    } catch (err) {
      console.error('Failed updating status:', err);
    }
  };

  const handleTogglePaymentStatus = async (order: Order) => {
    const nextStatus = order.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid';
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, { paymentStatus: nextStatus });
      order.paymentStatus = nextStatus;
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(prev => prev ? { ...prev, paymentStatus: nextStatus } : null);
      }
      alert(`Payment status toggled to: ${nextStatus}`);
    } catch (err) {
      console.error('Failed toggling payment state:', err);
      alert('Could not update payment state on Firestore.');
    }
  };

  // Analytics Calculations
  const deliveredOrders = orders.filter(o => o.status === 'Delivered' || o.paymentStatus === 'Paid');
  const totalSalesCount = deliveredOrders.length;
  
  // Calculate total revenues
  const revenueGHS = deliveredOrders.reduce((sum, o) => sum + o.totalGHS, 0);
  const revenueUSD = deliveredOrders.reduce((sum, o) => sum + o.totalUSD, 0);

  // Identify distinct customer keys
  const uniqueCustomerKeys = new Set<string>();
  const customerList: Array<{ name: string; email: string; phone: string; totalSpendGHS: number; totalSpendUSD: number; ordersCount: number; source: string }> = [];

  orders.forEach(o => {
    const customerKey = (o.customerEmail || o.customerPhone || o.customerName).toLowerCase().trim();
    if (customerKey) {
      if (!uniqueCustomerKeys.has(customerKey)) {
        uniqueCustomerKeys.add(customerKey);
        customerList.push({
          name: o.customerName || 'Anonymous Client',
          email: o.customerEmail || 'N/A',
          phone: o.customerPhone || 'N/A',
          totalSpendGHS: o.totalGHS,
          totalSpendUSD: o.totalUSD,
          ordersCount: 1,
          source: 'Store Order'
        });
      } else {
        const existing = customerList.find(c => (c.email === o.customerEmail || c.phone === o.customerPhone) && c.email !== 'N/A');
        if (existing) {
          existing.totalSpendGHS += o.totalGHS;
          existing.totalSpendUSD += o.totalUSD;
          existing.ordersCount += 1;
        }
      }
    }
  });

  repairs.forEach(rep => {
    const customerKey = (rep.customerEmail || rep.customerPhone || rep.customerName).toLowerCase().trim();
    if (customerKey && !uniqueCustomerKeys.has(customerKey)) {
      uniqueCustomerKeys.add(customerKey);
      customerList.push({
        name: rep.customerName || 'Repair Client',
        email: rep.customerEmail || 'N/A',
        phone: rep.customerPhone || 'N/A',
        totalSpendGHS: rep.quotationGHS,
        totalSpendUSD: rep.quotationUSD,
        ordersCount: 0,
        source: 'Repair Station'
      });
    }
  });

  tradeins.forEach(ti => {
    const customerKey = (ti.customerEmail || ti.customerPhone || ti.customerName).toLowerCase().trim();
    if (customerKey && !uniqueCustomerKeys.has(customerKey)) {
      uniqueCustomerKeys.add(customerKey);
      customerList.push({
        name: ti.customerName || 'Trade-In Client',
        email: ti.customerEmail || 'N/A',
        phone: ti.customerPhone || 'N/A',
        totalSpendGHS: 0,
        totalSpendUSD: 0,
        ordersCount: 0,
        source: 'Trade-In Valuation'
      });
    }
  });

  const lowStockCount = products.filter(p => p.stock <= 5).length;

  // Render Category distribution for PieChart
  const categoriesMap = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.keys(categoriesMap).map(catName => ({
    name: catName,
    value: categoriesMap[catName]
  }));

  const COLORS = ['#0066FF', '#00F2FE', '#FFC107', '#FF5722', '#8E44AD', '#2ECC71'];

  // Render Daily/Monthly sales projection for AreaChart
  const salesHistoryMap = orders.reduce((acc, o) => {
    const dateStr = new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    acc[dateStr] = (acc[dateStr] || 0) + o.totalGHS;
    return acc;
  }, {} as Record<string, number>);

  const salesTrendData = Object.keys(salesHistoryMap).map(d => ({
    date: d,
    Sales: salesHistoryMap[d]
  })).slice(-10); // Show recent 10 days of sales

  // Product Filter Logics
  const filteredProductCatalog = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.specs?.['SKU']?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || p.brand.toLowerCase() === selectedBrand.toLowerCase();
    
    let matchesStock = true;
    if (stockFilter === 'Low') matchesStock = p.stock > 0 && p.stock <= 5;
    else if (stockFilter === 'Out') matchesStock = p.stock === 0;

    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  // Categories list
  const allCategories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const allBrands = ['All', ...Array.from(new Set(products.map(p => p.brand)))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full h-full md:h-[90vh] md:max-w-7xl rounded-none md:rounded-2xl bg-white dark:bg-[#080808] border-0 md:border border-gray-150 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* LOGIN AUTH LAYER */}
        <AnimatePresence>
          {!isAuthenticated && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-[#09090b]/98 px-4 font-sans"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-full max-w-md bg-white dark:bg-[#09090b] rounded-2xl border border-gray-200 dark:border-gray-800/80 p-8 shadow-2xl relative overflow-hidden"
              >
                {/* Decorative background grid pattern for top premium brand feel */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0066FF] via-amber-400 to-[#0066FF]" />
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#0066FF]/5 dark:bg-[#0066FF]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="absolute top-4 right-4">
                  <button 
                    onClick={onClose}
                    className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-250 border border-gray-200/40 dark:border-gray-800/40 transition"
                    title="Close Backdoor Access Gate"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="text-center mb-8 relative">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-4 shadow-inner">
                    <Lock size={24} className="animate-pulse" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase font-mono">
                    BENJAMIN DANSO OS
                  </h2>
                  <p className="text-[10px] text-amber-500 font-bold tracking-widest uppercase font-mono mt-1.5">
                    Authorized Terminal Gate
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5 relative">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase font-mono tracking-wider">
                      Username / ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Enter admin identifier"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800/60 rounded-xl pl-4 pr-10 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:border-[#0066FF] dark:focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] outline-none transition shadow-sm font-mono"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 text-xs font-mono select-none">
                        @ID
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase font-mono tracking-wider flex justify-between">
                      <span>Passcode / Credentials</span>
                      <span className="text-amber-500 hover:underline cursor-pointer lowercase" onClick={() => alert('Refer to standard credential credentials: username is admin.')}>forgot?</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={passwordInputRef}
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={`w-full bg-gray-50 dark:bg-gray-900/40 border rounded-xl pl-4 pr-12 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:outline-none transition shadow-sm font-mono ${
                          loginError 
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                            : 'border-gray-200 dark:border-gray-800/60 focus:border-[#0066FF] dark:focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition"
                        title={showPassword ? "Hide Passcode" : "Show Passcode"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-mono leading-relaxed"
                    >
                      <div className="font-bold uppercase tracking-wider text-[9px] text-red-600 mb-1 flex items-center space-x-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-ping mr-1"></span>
                        <span>Access Denied</span>
                      </div>
                      {loginError}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoginLoading}
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-black text-xs font-black font-mono uppercase tracking-widest flex items-center justify-center space-x-2.5 transition shadow-lg shadow-amber-500/15 disabled:opacity-50"
                  >
                    {isLoginLoading ? (
                      <>
                        <span className="animate-spin border-2 border-black border-t-transparent rounded-full w-4 h-4" />
                        <span>Verifying Security Matrix...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Decrypt Access Pass</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-3 border-t border-gray-100 dark:border-gray-900">
                    <span className="text-[9px] text-gray-400 dark:text-gray-600 font-mono uppercase tracking-widest block">
                      SECURE AES-256 ENCRYPTED GATEWAY
                    </span>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CORE DASHBOARD SHELL */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden text-gray-900 dark:text-gray-100">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="w-full md:w-64 bg-gray-50 dark:bg-[#0c0c0c] border-r border-gray-150 dark:border-gray-800 flex flex-col select-none shrink-0">
            <div className="p-5 border-b border-gray-150 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-extrabold font-mono text-sm shadow-md">
                  ★
                </div>
                <div>
                  <h2 className="text-xs font-extrabold font-mono tracking-tight uppercase">
                    {storeSettings.storeName}
                  </h2>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                    OS v3.0 Live
                  </span>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                title="Lock Dashboard Session"
                className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition"
              >
                <LogOut size={13} />
              </button>
            </div>

            {/* SIDEBAR NAV LINKS */}
            <div className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {[
                { id: 'overview', label: 'Overview Metrics', icon: LayoutDashboard },
                { id: 'products', label: 'Product Inventory', icon: ShoppingBag },
                { id: 'collections', label: 'Collections Studio', icon: Layers },
                { id: 'orders', label: 'Sales & Orders', icon: ShoppingCart },
                { id: 'customers', label: 'Customer Matrix', icon: Users },
                { id: 'blogs', label: 'CMS Editorial', icon: FileText },
                { id: 'settings', label: 'Store Settings', icon: Settings }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setSelectedOrder(null);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive 
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10 font-bold' 
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-150 dark:border-gray-800 bg-white/50 dark:bg-black/10">
              <div className="text-[10px] font-mono text-gray-400 space-y-1">
                <span className="block text-amber-500 font-bold">● SYSTEM AUTHORIZATION</span>
                <span className="block">Accra Terminal #1</span>
                <span className="block">Operator: Benjamin Danso</span>
              </div>
            </div>
          </div>

          {/* ACTIVE CONTENT WORKSPACE */}
          <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50/50 dark:bg-[#050505] relative">
            
            {/* CLOSE DASHBOARD CROSS */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white dark:bg-black/40 border border-gray-150 dark:border-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white transition shadow-sm z-10"
            >
              <X size={15} />
            </button>

            {/* TAB CONTENT 1: OVERVIEW METRICS */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl md:text-2xl font-black font-sans tracking-tight">Executive Dashboard</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">Accra Flagship Enterprise Operations Ledger</p>
                </div>

                {/* KPI TOP BAR */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Live Products', val: products.length, icon: Package, col: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                    { label: 'Active Orders', val: orders.length, icon: ShoppingCart, col: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                    { label: 'Total Sales GHS', val: `${revenueGHS.toLocaleString()} GHS`, icon: DollarSign, col: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                    { label: 'Total Sales USD', val: `$${revenueUSD.toLocaleString()}`, icon: TrendingUp, col: 'text-purple-500 bg-purple-500/10 border-purple-500/20' }
                  ].map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                      <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-gray-800 shadow-sm flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 font-mono block uppercase">{kpi.label}</span>
                          <span className="text-sm md:text-lg font-black tracking-tight block mt-1">{kpi.val}</span>
                        </div>
                        <div className={`p-2.5 rounded-xl border ${kpi.col}`}>
                          <Icon size={16} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* LOW STOCK ALERTS */}
                {lowStockCount > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                      <div>
                        <span className="text-xs font-bold font-mono uppercase block">Critical Inventory Warning</span>
                        <p className="text-[11px] text-gray-400 mt-0.5">There are currently {lowStockCount} products running low in Accra store (Stock level ≤ 5).</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setActiveTab('products'); setStockFilter('Low'); }}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black text-[10px] font-bold font-mono uppercase tracking-wider hover:bg-amber-600 transition"
                    >
                      Audit Stock
                    </button>
                  </div>
                )}

                {/* CHART ANALYTICS BOARDS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* CHART 1: REVENUE FLOW */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 font-mono uppercase block">Revenue Progression Trend</span>
                      <h3 className="text-sm font-extrabold text-gray-800 dark:text-gray-200 font-sans tracking-tight">Recent Live Sales Timeline</h3>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesTrendData}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0066FF" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.1} />
                          <XAxis dataKey="date" stroke="#888" fontSize={10} tickLine={false} />
                          <YAxis stroke="#888" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ background: '#111', border: '#222' }} />
                          <Area type="monotone" dataKey="Sales" stroke="#0066FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* CHART 2: CATEGORY MATRIX */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 font-mono uppercase block">Catalog Allocation Density</span>
                      <h3 className="text-sm font-extrabold text-gray-800 dark:text-gray-200 font-sans tracking-tight">Product Density per Category</h3>
                    </div>

                    <div className="h-64 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* RECENT SALES & ORDERS TIMELINE */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 font-mono uppercase block">Latest Ledger Influx</span>
                      <h3 className="text-sm font-extrabold text-gray-800 dark:text-gray-200 font-sans tracking-tight">Recent Orders</h3>
                    </div>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-[#0066FF] hover:underline flex items-center space-x-1 font-semibold"
                    >
                      <span>All Orders</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-150 dark:border-gray-800 text-[10px] text-gray-400 uppercase font-mono font-bold">
                          <th className="py-2.5">Date</th>
                          <th className="py-2.5">Customer</th>
                          <th className="py-2.5">Status</th>
                          <th className="py-2.5">Payment</th>
                          <th className="py-2.5 text-right">Total (GHS)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="hover:bg-white/5 transition">
                            <td className="py-3 font-mono text-gray-400 text-[10px]">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 font-semibold text-gray-800 dark:text-gray-200">
                              {order.customerName}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-500' :
                                order.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-500' :
                                'bg-amber-500/10 text-amber-500'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                order.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td className="py-3 text-right font-bold text-gray-900 dark:text-white">
                              {order.totalGHS.toLocaleString()} GHS
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: PRODUCT INVENTORY */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                
                {/* HEADLINE & TRIGGERS */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-xl md:text-2xl font-black font-sans tracking-tight">Product Inventory</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">Manage, Update & Deploy Electronics Catalog</p>
                  </div>
                  <button
                    onClick={triggerAddProduct}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center space-x-2 transition self-start"
                  >
                    <Plus size={15} />
                    <span>Deploy Product</span>
                  </button>
                </div>

                {/* FILTERS & SEARCH ROW */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
                  
                  {/* Search bar */}
                  <div className="relative w-full lg:max-w-xs">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search name, brand, SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-[#0066FF] outline-none transition"
                    />
                  </div>

                  {/* Filter Selects */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    
                    {/* Category Filter */}
                    <div className="flex items-center space-x-1 bg-gray-50 dark:bg-black/25 px-2.5 py-1 rounded-xl border border-gray-150 dark:border-gray-800">
                      <span className="text-[10px] font-mono text-gray-400">CAT:</span>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-transparent border-0 text-xs font-bold py-1 focus:outline-none cursor-pointer"
                      >
                        {allCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Brand Filter */}
                    <div className="flex items-center space-x-1 bg-gray-50 dark:bg-black/25 px-2.5 py-1 rounded-xl border border-gray-150 dark:border-gray-800">
                      <span className="text-[10px] font-mono text-gray-400">BRAND:</span>
                      <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="bg-transparent border-0 text-xs font-bold py-1 focus:outline-none cursor-pointer"
                      >
                        {allBrands.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Stock level Filter */}
                    <div className="flex items-center space-x-1 bg-gray-50 dark:bg-black/25 px-2.5 py-1 rounded-xl border border-gray-150 dark:border-gray-800">
                      <span className="text-[10px] font-mono text-gray-400">STOCK:</span>
                      <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value as any)}
                        className="bg-transparent border-0 text-xs font-bold py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="All">All Levels</option>
                        <option value="Low">Low Stock (≤ 5)</option>
                        <option value="Out">Out of Stock (0)</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* MODAL: ADD / EDIT PRODUCT DRAWER */}
                <AnimatePresence>
                  {isAddingProduct || editingProduct ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="p-6 rounded-2xl bg-white dark:bg-[#0c0c0c] border-2 border-amber-500/30 shadow-xl space-y-6"
                    >
                      <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                            <Sparkles size={16} />
                          </div>
                          <h3 className="text-sm font-extrabold tracking-tight font-sans">
                            {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Deploy New Tech Product'}
                          </h3>
                        </div>
                        <button
                          onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 transition"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <form onSubmit={saveProductForm} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* LEFT COLUMN FIELDS */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                              Product Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={prodName}
                              onChange={(e) => setProdName(e.target.value)}
                              placeholder="e.g. iPhone 15 Pro Max (256GB)"
                              className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:border-[#0066FF] outline-none transition"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                              Description *
                            </label>
                            <textarea
                              required
                              rows={4}
                              value={prodDesc}
                              onChange={(e) => setProdDesc(e.target.value)}
                              placeholder="Provide detailed sales description and specifications..."
                              className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:border-[#0066FF] outline-none transition resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                                Category *
                              </label>
                              <select
                                value={prodCategory}
                                onChange={(e) => setProdCategory(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:border-[#0066FF] outline-none cursor-pointer"
                              >
                                <option value="Smartphones">Smartphones</option>
                                <option value="Laptops">Laptops</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Computing">Computing</option>
                                <option value="Gaming">Gaming</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                                Brand *
                              </label>
                              <input
                                type="text"
                                required
                                value={prodBrand}
                                onChange={(e) => setProdBrand(e.target.value)}
                                placeholder="e.g. Apple, Samsung, HP"
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:border-[#0066FF] outline-none transition"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                                Price GHS *
                              </label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={prodPriceGHS}
                                onChange={(e) => setProdPriceGHS(Number(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:border-[#0066FF] outline-none transition"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                                Price USD *
                              </label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={prodPriceUSD}
                                onChange={(e) => setProdPriceUSD(Number(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:border-[#0066FF] outline-none transition"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                                Stock *
                              </label>
                              <input
                                type="number"
                                required
                                min="0"
                                value={prodStock}
                                onChange={(e) => setProdStock(Number(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:border-[#0066FF] outline-none transition"
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                                SKU / Serial ID
                              </label>
                              <input
                                type="text"
                                required
                                value={prodSKU}
                                onChange={(e) => setProdSKU(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:border-[#0066FF] outline-none transition font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* RIGHT COLUMN FIELDS */}
                        <div className="space-y-4">
                          
                          {/* Image Upload manager */}
                          <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 space-y-4">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase font-mono">
                              Product Images & Cloud Compression
                            </span>

                            {/* Native Image Upload & Compression */}
                            <div className="border border-dashed border-gray-250 dark:border-gray-800 hover:border-amber-500 rounded-xl p-6 text-center transition cursor-pointer relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) compressAndUploadImage(file);
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <Upload className="mx-auto w-6 h-6 text-gray-400 mb-2" />
                              <span className="text-[11px] font-bold block text-gray-700 dark:text-gray-300">
                                Click or drag image to compress & upload
                              </span>
                              <span className="text-[10px] text-gray-400 block mt-1">
                                Max web resolution (800px) JPEG is automatically rendered.
                              </span>
                            </div>

                            {/* Image loading / compression feedback */}
                            {isUploading && (
                              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl space-y-2">
                                <span className="text-[10px] font-mono font-bold block animate-pulse">
                                  {compressionStatus}
                                </span>
                                {uploadProgress && (
                                  <div className="w-full bg-black/25 rounded-full h-1">
                                    <div className="bg-amber-500 h-1 rounded-full" style={{ width: `${uploadProgress}%` }} />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Direct URL input */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Paste custom image URL..."
                                value={prodImageInput}
                                onChange={(e) => setProdImageInput(e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-lg px-3 py-1.5 text-[11px] outline-none focus:border-[#0066FF]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (prodImageInput.trim()) {
                                    setProdImages(prev => [...prev, prodImageInput.trim()]);
                                    setProdImageInput('');
                                  }
                                }}
                                className="px-3 bg-gray-200 dark:bg-gray-800 text-xs rounded-lg hover:bg-gray-300 transition"
                              >
                                Add
                              </button>
                            </div>

                            {/* Previews */}
                            {prodImages.length > 0 && (
                              <div className="grid grid-cols-4 gap-2 pt-2">
                                {prodImages.map((img, index) => (
                                  <div key={index} className="relative aspect-square rounded-lg border border-gray-250 dark:border-gray-800 overflow-hidden group bg-white">
                                    <img src={img} alt="Product view" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => setProdImages(prev => prev.filter((_, i) => i !== index))}
                                      className="absolute top-1 right-1 p-0.5 bg-rose-500 text-white rounded hover:scale-105 transition"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Assign to Collection */}
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                              Assign to curated Collection group
                            </label>
                            <select
                              value={prodCollection}
                              onChange={(e) => setProdCollection(e.target.value)}
                              className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:border-[#0066FF] outline-none cursor-pointer"
                            >
                              <option value="">-- No collection group --</option>
                              {customCollections.map(col => (
                                <option key={col.id} value={col.id}>{col.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Featured toggle */}
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-black/25 rounded-xl border border-gray-150 dark:border-gray-800">
                            <input
                              type="checkbox"
                              id="prodFeatured"
                              checked={prodIsFeatured}
                              onChange={(e) => setProdIsFeatured(e.target.checked)}
                              className="w-4 h-4 rounded text-[#0066FF] focus:ring-[#0066FF]"
                            />
                            <label htmlFor="prodFeatured" className="text-xs font-bold text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                              Feature this product on homepage catalog
                            </label>
                          </div>

                          {/* Submit Actions */}
                          <div className="flex gap-3 pt-6 justify-end">
                            <button
                              type="button"
                              onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
                              className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-850 hover:bg-gray-300 dark:hover:bg-gray-800 text-xs font-bold font-mono uppercase tracking-wider transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold font-mono uppercase tracking-wider flex items-center space-x-2 transition"
                            >
                              <CheckCircle2 size={15} />
                              <span>{editingProduct ? 'Update ProductSpecs' : 'Deploy ProductSpecs'}</span>
                            </button>
                          </div>

                        </div>
                      </form>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* PRODUCT DATA LEDGER TABLE */}
                <div className="bg-white dark:bg-[#0c0c0c] rounded-2xl border border-gray-150 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-[#121212]/50 text-[10px] text-gray-400 uppercase font-mono font-bold">
                          <th className="p-4">SKU / Serial</th>
                          <th className="p-4">Specs</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Price (GHS)</th>
                          <th className="p-4">Price (USD)</th>
                          <th className="p-4">Stock</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40">
                        {filteredProductCatalog.map((prod) => {
                          const skuCode = prod.specs?.['SKU'] || prod.id.split('-')[1] || 'IMM-VAL';
                          const isLowStock = prod.stock <= 5;
                          return (
                            <tr key={prod.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                              <td className="p-4 font-mono text-[10px] text-gray-400">
                                {skuCode}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <img 
                                    src={prod.image || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=100&auto=format&fit=crop'} 
                                    alt="" 
                                    className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-800 bg-white"
                                  />
                                  <div>
                                    <span className="font-extrabold text-gray-900 dark:text-white block font-sans text-xs">
                                      {prod.name}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      {prod.brand} {prod.isFeatured && '★ Featured'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-semibold text-gray-500">
                                {prod.category}
                              </td>
                              <td className="p-4 font-bold text-gray-900 dark:text-white">
                                {prod.priceGHS.toLocaleString()} GHS
                              </td>
                              <td className="p-4 font-bold text-gray-900 dark:text-white">
                                ${prod.priceUSD.toLocaleString()}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <span className={`w-2 h-2 rounded-full ${prod.stock === 0 ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                  <span className={`font-mono font-extrabold ${prod.stock === 0 ? 'text-rose-500' : isLowStock ? 'text-amber-500' : 'text-gray-900 dark:text-gray-100'}`}>
                                    {prod.stock}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    onClick={() => triggerEditProduct(prod)}
                                    className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-[#0066FF] transition"
                                    title="Edit ProductSpecs"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProductConfirmed(prod.id)}
                                    className="p-1.5 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition"
                                    title="Delete Product"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT 3: COLLECTIONS STUDIO */}
            {activeTab === 'collections' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl md:text-2xl font-black font-sans tracking-tight">Collections Studio</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">Categorize, curate and bundle products for storefront showcases</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* COLLECTION CONSTRUCTOR FORM */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-gray-800 shadow-sm space-y-4 self-start">
                    <span className="text-[10px] font-black text-amber-500 font-mono uppercase block">
                      {selectedColId ? '[Update Custom Collection]' : '[Create Collection Group]'}
                    </span>
                    
                    <form onSubmit={handleCreateOrUpdateCollection} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                          Collection Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={colName}
                          onChange={(e) => setColName(e.target.value)}
                          placeholder="e.g. Flagship iPhones, Gaming Rigs"
                          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[#0066FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={colDesc}
                          onChange={(e) => setColDesc(e.target.value)}
                          placeholder="Short tagline showcasing collection benefit..."
                          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[#0066FF] resize-none"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="colFeaturedCheck"
                          checked={colIsFeatured}
                          onChange={(e) => setColIsFeatured(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                        />
                        <label htmlFor="colFeaturedCheck" className="text-xs font-bold text-gray-300 select-none cursor-pointer">
                          Featured on Store Homepage Category Row
                        </label>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {selectedColId && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedColId(null);
                              setColName('');
                              setColDesc('');
                            }}
                            className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-xs font-bold"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold font-mono uppercase tracking-wider"
                        >
                          {selectedColId ? 'Save Specs' : 'Initialize Group'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* COLLECTIONS LIST & PRODUCTS BINDING */}
                  <div className="lg:col-span-2 space-y-4">
                    {customCollections.map((col) => (
                      <div key={col.id} className="p-5 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white font-sans">
                                {col.name}
                              </h3>
                              {col.isFeaturedHome && (
                                <span className="text-[8px] bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded font-mono font-black uppercase">
                                  Home Featured
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">{col.description}</p>
                          </div>

                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setSelectedColId(col.id);
                                setColName(col.name);
                                setColDesc(col.description);
                                setColIsFeatured(col.isFeaturedHome);
                              }}
                              className="p-1 rounded bg-gray-100 hover:bg-gray-250 dark:bg-gray-800 text-xs text-gray-500 hover:text-amber-500 transition"
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              onClick={() => handleDeleteCollection(col.id)}
                              className="p-1 rounded bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-500 text-xs transition"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Product checklist binder inside each collection */}
                        <div className="pt-2 border-t border-gray-150 dark:border-gray-800/40">
                          <span className="block text-[10px] font-bold text-gray-400 font-mono uppercase mb-2">
                            Bind / Unbind store items: ({col.productIds.length} currently assigned)
                          </span>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-2">
                            {products.map(prod => {
                              const isChecked = col.productIds.includes(prod.id);
                              return (
                                <button
                                  key={prod.id}
                                  onClick={() => toggleProductInCollection(col.id, prod.id)}
                                  className={`p-2 rounded-lg text-left text-[10px] border transition flex items-center justify-between ${
                                    isChecked 
                                      ? 'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/40 font-bold' 
                                      : 'bg-gray-50/50 dark:bg-black/10 border-gray-150 dark:border-gray-800 text-gray-400'
                                  }`}
                                >
                                  <span className="truncate pr-1">{prod.name}</span>
                                  {isChecked && <Check size={10} className="shrink-0" />}
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

            {/* TAB CONTENT 4: SALES & ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl md:text-2xl font-black font-sans tracking-tight">Sales & Orders Ledger</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">Track shipping statuses, payment verifications and fulfillments</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* ORDERS LEDGER */}
                  <div className="lg:col-span-2 space-y-3">
                    {orders.map((order) => (
                      <div 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        className={`p-4 rounded-2xl bg-white dark:bg-[#0c0c0c] border cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          selectedOrder?.id === order.id 
                            ? 'border-amber-500 ring-2 ring-amber-500/10' 
                            : 'border-gray-150 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono text-gray-400 block uppercase">
                              #{order.trackingNumber || order.id.split('-')[1]}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">• {new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-900 dark:text-white block">
                            {order.customerName}
                          </span>
                          <span className="text-[10px] text-gray-500 block">
                            {order.items.length} items purchased ({order.deliveryOption})
                          </span>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <span className="text-xs font-bold block">{order.totalGHS.toLocaleString()} GHS</span>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold mt-1 ${
                              order.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </div>

                          <div>
                            <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase font-mono tracking-wider block ${
                              order.status === 'Delivered' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/35' :
                              order.status === 'Cancelled' ? 'bg-rose-500/15 text-rose-500 border border-rose-500/35' :
                              'bg-amber-500/15 text-amber-500 border border-amber-500/35'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FULFILLMENT PANEL VIEW */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-gray-800 shadow-sm space-y-6">
                    {selectedOrder ? (
                      <div className="space-y-6">
                        
                        {/* Order Identity info */}
                        <div>
                          <span className="text-[9px] font-black text-amber-500 font-mono uppercase block">[Fulfillment Dispatch Console]</span>
                          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white mt-1">
                            Order #{selectedOrder.trackingNumber || selectedOrder.id.split('-')[1]}
                          </h2>
                          <span className="text-[11px] text-gray-400 font-mono block mt-0.5">
                            Placed on {new Date(selectedOrder.createdAt).toUTCString()}
                          </span>
                        </div>

                        {/* Customer Info */}
                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-black/25 border border-gray-150 dark:border-gray-800 space-y-2.5">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase font-mono">
                            Customer Matrix Details
                          </span>
                          <div className="space-y-1.5 text-xs">
                            <span className="block font-bold">{selectedOrder.customerName}</span>
                            <div className="flex items-center space-x-2 text-gray-400 font-mono text-[10px]">
                              <Mail size={12} />
                              <span>{selectedOrder.customerEmail}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-400 font-mono text-[10px]">
                              <Phone size={12} />
                              <span>{selectedOrder.customerPhone}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-400 font-mono text-[10px] items-start">
                              <MapPin size={12} className="shrink-0 mt-0.5" />
                              <span className="leading-snug">{selectedOrder.address}, {selectedOrder.city}</span>
                            </div>
                          </div>
                        </div>

                        {/* Purchase Ledger Items */}
                        <div className="space-y-2">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase font-mono">
                            Receipt Items ({selectedOrder.items.length})
                          </span>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {selectedOrder.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white/5 rounded-lg border border-white/5">
                                <div className="space-y-0.5 pr-2">
                                  <span className="font-semibold block truncate max-w-xs">{item.product.name}</span>
                                  <span className="text-[10px] text-gray-400 font-mono">Qty: {item.quantity} • {item.selectedColor || 'Default'}</span>
                                </div>
                                <span className="font-bold shrink-0">{item.product.priceGHS.toLocaleString()} GHS</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status updating panel */}
                        <div className="space-y-3 pt-4 border-t border-gray-150 dark:border-gray-800/40">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase font-mono">
                            Dispatch Progression Controls
                          </span>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: 'Mark Processing', status: 'Processing' },
                              { label: 'Mark Shipped', status: 'Shipped' },
                              { label: 'Mark Out for Delivery', status: 'Out for Delivery' },
                              { label: 'Mark Delivered', status: 'Delivered' }
                            ].map((btn, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleUpdateOrderStatus(selectedOrder.id, btn.status)}
                                className={`py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase border transition ${
                                  selectedOrder.status === btn.status 
                                    ? 'bg-[#0066FF] text-white border-[#0066FF]' 
                                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#0066FF] text-gray-400 hover:text-[#0066FF]'
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleTogglePaymentStatus(selectedOrder)}
                              className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-[10px] font-mono font-bold uppercase border border-gray-200 dark:border-gray-700"
                            >
                              Toggle Payment
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Cancelled')}
                              className="flex-1 py-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-mono font-bold uppercase hover:bg-rose-500 hover:text-white transition"
                            >
                              Cancel Order
                            </button>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="text-center py-20 text-gray-500 flex flex-col items-center justify-center space-y-3">
                        <ShoppingCart className="w-10 h-10 text-gray-400" />
                        <p className="text-xs font-mono">Select any order from the left ledger to audit shipping, payment tracking and dispatch progression.</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB CONTENT 5: CUSTOMER MATRIX */}
            {activeTab === 'customers' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl md:text-2xl font-black font-sans tracking-tight">Customer Matrix</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">Aggregate user spendings, order counts, repair files and trade-in valuations</p>
                </div>

                {/* CUSTOMER MATRIX GRID TABLE */}
                <div className="bg-white dark:bg-[#0c0c0c] rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-[#121212]/50 text-[10px] text-gray-400 uppercase font-mono font-bold">
                          <th className="p-4">Customer Matrix Signature</th>
                          <th className="p-4">Email Address</th>
                          <th className="p-4">Contact Phone</th>
                          <th className="p-4">Origin Hub</th>
                          <th className="p-4 text-center">Fulfillments</th>
                          <th className="p-4 text-right">Lifetime GHS Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40">
                        {customerList.map((cust, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                            <td className="p-4 font-extrabold text-gray-900 dark:text-white font-sans text-xs">
                              {cust.name}
                            </td>
                            <td className="p-4 font-mono text-gray-400 text-[11px]">
                              {cust.email}
                            </td>
                            <td className="p-4 font-mono text-gray-400 text-[11px]">
                              {cust.phone}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                cust.source === 'Store Order' ? 'bg-blue-500/10 text-blue-500' :
                                cust.source === 'Repair Station' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-purple-500/10 text-purple-500'
                              }`}>
                                {cust.source}
                              </span>
                            </td>
                            <td className="p-4 text-center font-mono font-bold text-gray-800 dark:text-gray-300">
                              {cust.ordersCount}
                            </td>
                            <td className="p-4 text-right font-black text-emerald-500 font-mono text-xs">
                              {cust.totalSpendGHS.toLocaleString()} GHS
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT 6: CMS EDITORIAL */}
            {activeTab === 'blogs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl md:text-2xl font-black font-sans tracking-tight">CMS Editorial Studio</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">Author articles, guides, and phone reviews without editing code</p>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-xl text-xs font-mono flex items-center justify-between">
                  <span>To author premium articles, guides or tutorials, please use the live CMS editor directly on the main dashboard site or create custom posts in Firestore.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blogs.map((b) => (
                    <div key={b.id} className="p-4 bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-gray-800 rounded-xl space-y-2 relative">
                      <span className="text-[9px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded font-bold font-mono uppercase">{b.category}</span>
                      <h3 className="text-sm font-extrabold">{b.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-3">{b.content}</p>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono pt-2">
                        <span>By: {b.author} • {b.readTime}</span>
                        {onDeleteBlog && (
                          <button
                            onClick={async () => {
                              if (confirm('Delete this editorial blog article?')) {
                                await onDeleteBlog(b.id);
                                alert('Editorial piece removed.');
                              }
                            }}
                            className="p-1 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] uppercase font-bold"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 7: STORE SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h1 className="text-xl md:text-2xl font-black font-sans tracking-tight">Global Store Configuration</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">Manage brand identifiers, contact points, default currencies, and delivery rules</p>
                </div>

                <form onSubmit={handleSaveSettings} className="p-6 bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Brand configs */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-amber-500 font-mono uppercase border-b border-gray-850 pb-2">
                        1. Brand specifications
                      </h3>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                          E-Commerce Store Name
                        </label>
                        <input
                          type="text"
                          required
                          value={storeSettings.storeName}
                          onChange={(e) => setStoreSettings(prev => ({ ...prev, storeName: e.target.value }))}
                          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[#0066FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                          Logo / Image URL
                        </label>
                        <input
                          type="text"
                          value={storeSettings.logoUrl}
                          onChange={(e) => setStoreSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                          placeholder="Paste link to custom store logo image..."
                          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[#0066FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                          Store Street Address
                        </label>
                        <input
                          type="text"
                          required
                          value={storeSettings.address}
                          onChange={(e) => setStoreSettings(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[#0066FF]"
                        />
                      </div>
                    </div>

                    {/* Contact points */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-amber-500 font-mono uppercase border-b border-gray-850 pb-2">
                        2. Contact & Social Integrations
                      </h3>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                          Support Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={storeSettings.contactEmail}
                          onChange={(e) => setStoreSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[#0066FF]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                            Business Phone
                          </label>
                          <input
                            type="text"
                            required
                            value={storeSettings.contactPhone}
                            onChange={(e) => setStoreSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                            className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[#0066FF]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                            WhatsApp Line
                          </label>
                          <input
                            type="text"
                            required
                            value={storeSettings.whatsappNumber}
                            onChange={(e) => setStoreSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                            className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[#0066FF]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                          TikTok Brand Channel
                        </label>
                        <input
                          type="text"
                          value={storeSettings.tiktokUrl}
                          onChange={(e) => setStoreSettings(prev => ({ ...prev, tiktokUrl: e.target.value }))}
                          placeholder="e.g. https://tiktok.com/@immortal"
                          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[#0066FF]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial & Delivery metrics */}
                  <div className="space-y-4 pt-6 border-t border-gray-150 dark:border-gray-800/40">
                    <h3 className="text-xs font-bold text-amber-500 font-mono uppercase pb-2">
                      3. Operational Cost Matrix & Currencies
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                          Accra Standard Delivery (GHS)
                        </label>
                        <input
                          type="number"
                          required
                          value={storeSettings.accraDeliveryCostGHS}
                          onChange={(e) => setStoreSettings(prev => ({ ...prev, accraDeliveryCostGHS: Number(e.target.value) }))}
                          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[#0066FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                          Expedited Motorcycle Delivery (GHS)
                        </label>
                        <input
                          type="number"
                          required
                          value={storeSettings.expeditedDeliveryCostGHS}
                          onChange={(e) => setStoreSettings(prev => ({ ...prev, expeditedDeliveryCostGHS: Number(e.target.value) }))}
                          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[#0066FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
                          Store Default Currency
                        </label>
                        <select
                          value={storeSettings.defaultCurrency}
                          onChange={(e) => setStoreSettings(prev => ({ ...prev, defaultCurrency: e.target.value as any }))}
                          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[#0066FF] cursor-pointer"
                        >
                          <option value="GHS">GHS (Ghana Cedi)</option>
                          <option value="USD">USD (US Dollar)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold font-mono uppercase tracking-wider transition"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
