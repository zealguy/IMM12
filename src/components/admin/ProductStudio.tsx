/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit, Trash, Search, Filter, Sparkles, Code, 
  Settings, CheckCircle, Smartphone, Sliders, ArrowUpRight, Cpu, 
  Layers, Upload, Inbox, Eye, CheckSquare, Download, Terminal, AlertCircle,
  FileText, Globe, RefreshCw, Play, Check, AlertTriangle, EyeOff, LayoutGrid, Zap
} from 'lucide-react';
import { Product } from '../../types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { handleImageError } from '../../utils/imageFallback';

interface InjectionTemplate {
  name: string;
  brand: string;
  category: string;
  priceGHS: number;
  stock: number;
  image: string;
  description: string;
  specs: Record<string, string>;
}

const INJECTION_TEMPLATES: InjectionTemplate[] = [
  {
    name: "HP EliteBook 840 G8 Core i7",
    brand: "HP",
    category: "Computing",
    priceGHS: 8400,
    stock: 12,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600&auto=format&fit=crop",
    description: "Premium business-class laptop with Intel Core i7 11th Gen, 16GB RAM, and ultra-fast 512GB PCIe NVMe SSD. Features a gorgeous anti-glare display, premium aluminum chassis, and authorized local warranty.",
    specs: {
      'Processor': "Intel Core i7-1165G7 (Up to 4.7GHz)",
      'RAM': "16GB DDR4 Dual-Channel",
      'Storage': "512GB PCIe NVMe M.2 SSD",
      'Graphics': "Intel Iris Xe Graphics",
      'Screen Size': "14-inch Full HD (1920x1080) IPS",
      'OS': "Windows 11 Pro",
      'Battery': "53Wh Li-ion with Fast Charge",
      'Ports': "2x Thunderbolt 4, 2x USB-A, HDMI 2.0, Audio Combo",
      'Connectivity': "Intel Wi-Fi 6 + Bluetooth 5.0",
      'Warranty': "1 Year Authorized Local Warranty"
    }
  },
  {
    name: "iPhone 15 Pro Max (256GB)",
    brand: "Apple",
    category: "Smartphones",
    priceGHS: 14500,
    stock: 8,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop",
    description: "The absolute flagship iOS device. Featuring a gorgeous Titanium design, the elite A17 Pro Bionic chip, an advanced 48MP custom camera system, and USB-C speed support.",
    specs: {
      'Processor': "Apple A17 Pro Chip",
      'RAM': "8GB Unified Memory",
      'Storage': "256GB NVMe Storage",
      'Graphics': "Apple 6-Core GPU",
      'Screen Size': "6.7-inch Super Retina XDR OLED",
      'OS': "iOS 17 (Upgradable)",
      'Battery': "4441mAh with 25W Fast Charge",
      'Ports': "USB-C (USB 3.0 up to 10Gbps)",
      'Connectivity': "Wi-Fi 6E + Bluetooth 5.3 + Ultra Wideband",
      'Warranty': "1 Year Apple Authorized Warranty"
    }
  },
  {
    name: "MacBook Air 13-inch M3",
    brand: "Apple",
    category: "Computing",
    priceGHS: 11900,
    stock: 6,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop",
    description: "Incredibly thin and fast MacBook Air powered by the revolutionary Apple M3 chip. Delivers up to 18 hours of battery life, striking Liquid Retina display, and completely silent fanless cooling.",
    specs: {
      'Processor': "Apple M3 Chip (8-Core CPU / 10-Core GPU)",
      'RAM': "8GB Unified Memory",
      'Storage': "512GB Superfast SSD",
      'Graphics': "Integrated 10-Core Apple GPU",
      'Screen Size': "13.6-inch Liquid Retina with True Tone",
      'OS': "macOS Sonoma (Native)",
      'Battery': "52.6Wh Li-Polymer (Up to 18 Hours)",
      'Ports': "2x Thunderbolt 3 / USB 4, MagSafe 3, Headphone Jack",
      'Connectivity': "Wi-Fi 6E + Bluetooth 5.3",
      'Warranty': "1 Year Apple Authorized Hub Warranty"
    }
  },
  {
    name: "Samsung Galaxy S24 Ultra (512GB)",
    brand: "Samsung",
    category: "Smartphones",
    priceGHS: 13800,
    stock: 10,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop",
    description: "The ultimate Android flagship with Galaxy AI built-in. Features a premium Titanium framework, integrated S-Pen, and a spectacular 200MP camera system with unparalleled zoom capabilities.",
    specs: {
      'Processor': "Snapdragon 8 Gen 3 for Galaxy",
      'RAM': "12GB LPDDR5X",
      'Storage': "512GB UFS 4.0 Storage",
      'Graphics': "Adreno 750 (Ray-Tracing Support)",
      'Screen Size': "6.8-inch Dynamic AMOLED 2X 120Hz",
      'OS': "Android 14 with One UI 6.1",
      'Battery': "5000mAh with 45W Fast Charging",
      'Ports': "USB-C (USB 3.2 Gen 1)",
      'Connectivity': "Wi-Fi 7 + Bluetooth 5.3 + UWB + 5G LTE",
      'Warranty': "2 Years Authorized Samsung Warranty"
    }
  },
  {
    name: "Sony WH-1000XM5 ANC Headphones",
    brand: "Sony",
    category: "Accessories",
    priceGHS: 4200,
    stock: 15,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
    description: "Industry-leading active noise cancelling headphones. Features double processors controlling 8 microphones, exceptional hands-free calling, and long-lasting 30-hour battery life with smart touch controls.",
    specs: {
      'Processor': "Sony Integrated V1 + HD Noise Cancelling QN1",
      'RAM': "N/A",
      'Storage': "N/A",
      'Graphics': "N/A",
      'Screen Size': "N/A (Over-Ear Cups)",
      'OS': "Sony Headphones Connect App Integration",
      'Battery': "Up to 30 Hours (3 Min Charge = 3 Hours)",
      'Ports': "USB-C Charge Port, 3.5mm Stereo Audio Jack",
      'Connectivity': "Bluetooth 5.2 (LDAC + AAC + SBC High Res)",
      'Warranty': "1 Year Local Electronics Warranty"
    }
  },
  {
    name: "HP Victus 16 Gaming Laptop",
    brand: "HP",
    category: "Computing",
    priceGHS: 9800,
    stock: 5,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop",
    description: "High-performance gaming laptop with AMD Ryzen 7 processing power and NVIDIA RTX 4060 graphics. Designed for elite gaming, content creation, and fast multi-threaded operations.",
    specs: {
      'Processor': "AMD Ryzen 7-7840HS (8 Cores, Up to 5.1GHz)",
      'RAM': "16GB DDR5 5600MHz Dual-Channel",
      'Storage': "512GB Gen4 PCIe NVMe M.2 SSD",
      'Graphics': "NVIDIA GeForce RTX 4060 (8GB GDDR6)",
      'Screen Size': "16.1-inch FHD, 144Hz Refresh Rate IPS",
      'OS': "Windows 11 Home",
      'Battery': "70Wh Li-ion with Smart Fast Charge",
      'Ports': "1x USB-C (Power Delivery, DP), 3x USB-A, HDMI 2.1, RJ-45",
      'Connectivity': "Wi-Fi 6 (2x2) + Bluetooth 5.3",
      'Warranty': "1 Year HP Authorized West-Africa Warranty"
    }
  }
];

interface ProductStudioProps {
  products: Product[];
  currency: 'GHS' | 'USD';
  onUpdateStock: (productId: string, newStock: number) => Promise<Product>;
  onAddProduct: (newProduct: Product) => void | Promise<void>;
  onEditProduct: (productId: string, productData: Partial<Product>) => Promise<Product>;
  onDeleteProduct: (productId: string) => Promise<any>;
  initialIsAddingProduct?: boolean;
  initialIsImporterOpen?: boolean;
  initialSelectedCategory?: string;
  initialShowBulkActions?: boolean;
}

// Default specs for laptops
interface LaptopSpecs {
  processor: string;
  ram: string;
  storage: string;
  graphics: string;
  screenSize: string;
  os: string;
  battery: string;
  ports: string;
  connectivity: string;
  warranty: string;
}

export default function ProductStudio({ 
  products, 
  currency, 
  onUpdateStock, 
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  initialIsAddingProduct = false,
  initialIsImporterOpen = false,
  initialSelectedCategory = 'All',
  initialShowBulkActions = false
}: ProductStudioProps) {
  const [localProducts, setLocalProducts] = useState<Product[]>([...products]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialSelectedCategory);

  useEffect(() => {
    setLocalProducts([...products]);
  }, [products]);
  
  // Create / Edit states
  const [isAddingProduct, setIsAddingProduct] = useState(initialIsAddingProduct);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeCreationMethod, setActiveCreationMethod] = useState<'inject' | 'manual' | 'bulk' | 'ai' | 'sync'>('inject');
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState<number>(0);

  const applyTemplate = (tpl: typeof INJECTION_TEMPLATES[0]) => {
    setName(tpl.name);
    setBrand(tpl.brand);
    setCategory(tpl.category);
    setSellingPrice(tpl.priceGHS);
    setCostPrice(Math.round(tpl.priceGHS * 0.7));
    setDiscountPrice(Math.round(tpl.priceGHS * 0.95));
    setStock(tpl.stock);
    setUploadedMain(tpl.image);
    setUploadedGallery([tpl.image]);
    setDescription(tpl.description);
    setSku(`SKU-${tpl.brand.slice(0, 3).toUpperCase()}-${tpl.category.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`);
    setBarcode(`779${Math.floor(100000000 + Math.random() * 900000000)}`);
    setLaptopSpecs({
      processor: tpl.specs['Processor'] || 'Intel Core i7',
      ram: tpl.specs['RAM'] || '16GB DDR4',
      storage: tpl.specs['Storage'] || '512GB SSD',
      graphics: tpl.specs['Graphics'] || 'Intel Iris Xe',
      screenSize: tpl.specs['Screen Size'] || '14-inch FHD',
      os: tpl.specs['OS'] || 'Windows 11 Pro',
      battery: tpl.specs['Battery'] || '53Wh Fast-Charge',
      ports: tpl.specs['Ports'] || 'Thunderbolt 4, USB-A, HDMI',
      connectivity: tpl.specs['Connectivity'] || 'Wi-Fi 6 + Bluetooth',
      warranty: tpl.specs['Warranty'] || '1 Year Warranty'
    });
  };

  useEffect(() => {
    if (activeCreationMethod === 'inject' && INJECTION_TEMPLATES[selectedTemplateIdx]) {
      applyTemplate(INJECTION_TEMPLATES[selectedTemplateIdx]);
    }
  }, [selectedTemplateIdx, activeCreationMethod]);
  
  // --- METHOD 1: MANUAL FORM FIELDS ---
  const [productType, setProductType] = useState<'single' | 'variable' | 'bundle' | 'digital' | 'subscription'>('single');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('HP');
  const [category, setCategory] = useState('Computing');
  const [modelNumber, setModelNumber] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [productStatus, setProductStatus] = useState<'Draft' | 'Published' | 'Scheduled'>('Published');
  const [isBestSeller, setIsBestSeller] = useState<boolean>(false);
  const [isNewArrival, setIsNewArrival] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [description, setDescription] = useState('');

  // Pricing (Cost, Selling, Discount, Tax, Profit Margin)
  const [costPrice, setCostPrice] = useState<number>(6500);
  const [sellingPrice, setSellingPrice] = useState<number>(10800);
  const [discountPrice, setDiscountPrice] = useState<number>(9999);
  const [taxPercent, setTaxPercent] = useState<number>(15); // GHA Standard VAT

  // Inventory
  const [stock, setStock] = useState<number>(5);
  const [warehouse, setWarehouse] = useState<string>('Accra Headquarters (Ebony)');
  const [lowStockAlert, setLowStockAlert] = useState<number>(3);

  // Specifications (Laptop defaults)
  const [laptopSpecs, setLaptopSpecs] = useState<LaptopSpecs>({
    processor: 'AMD Ryzen 7 5800H',
    ram: '16GB DDR4 Dual-Channel',
    storage: '512GB PCIe NVMe M.2 SSD',
    graphics: 'NVIDIA GeForce RTX 3060 (6GB GDDR6)',
    screenSize: '16.1-inch FHD, 144Hz IPS',
    os: 'Windows 11 Home',
    battery: '83Wh Fast-Charge Li-ion',
    ports: '3x USB-A, 1x USB-C (DP), 1x HDMI 2.1, RJ-45, Audio Combo',
    connectivity: 'Wi-Fi 6 (2x2) + Bluetooth 5.2',
    warranty: '1 Year Local Warranty by Immortal Tech'
  });

  // Image upload simulator states
  const [uploadedMain, setUploadedMain] = useState<string>('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop');
  const [uploadedGallery, setUploadedGallery] = useState<string[]>([
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=600&auto=format&fit=crop'
  ]);
  const [uploaded360, setUploaded360] = useState<string[]>([
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=600&auto=format&fit=crop'
  ]);
  const [uploadedVideo, setUploadedVideo] = useState<string>('https://assets.mixkit.co/videos/preview/mixkit-animation-of-a-laptop-screen-31908-large.mp4');
  const [galleryUrlInput, setGalleryUrlInput] = useState<string>('');
  const [imageCompressionLogs, setImageCompressionLogs] = useState<string[]>([]);
  const [isCompilingImages, setIsCompilingImages] = useState(false);

  // Firebase Storage upload states
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [firebaseUploadError, setFirebaseUploadError] = useState<string | null>(null);

  // SEO auto-computed values
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoSlug, setSeoSlug] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // --- APPROVAL WORKFLOW STATUS ---
  // Steps: 1: Upload, 2: AI Processing, 3: Validation, 4: Duplicate Check, 5: Preview, 6: Owner Approval, 7: Publish
  const [approvalStep, setApprovalStep] = useState<number>(1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [duplicateCheckPassed, setDuplicateCheckPassed] = useState<boolean | null>(null);
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);

  // --- METHOD 2: BULK SPREADSHEET FIELDS ---
  const [bulkFile, setBulkFile] = useState<string | null>(null);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkProducts, setBulkProducts] = useState<Array<{
    id: number;
    name: string;
    brand: string;
    priceGHS: number;
    stock: number;
    image: string;
    specs?: Record<string, string>;
  }>>([
    { id: 1, name: 'HP Omen Gaming Laptop 16-c0009ne', brand: 'HP', priceGHS: 10800, stock: 5, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop' },
    { id: 2, name: 'iPhone 15 Pro Max', brand: 'Apple', priceGHS: 14500, stock: 8, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop' }
  ]);

  // --- METHOD 3: AI MANAGER (GEMINI) ---
  const [aiDocType, setAiDocType] = useState<'image' | 'brochure' | 'pdf' | 'excel'>('image');
  const [aiUploadedFile, setAiUploadedFile] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiLogs, setAiLogs] = useState<string[]>([]);
  const [aiGeneratedResult, setAiGeneratedResult] = useState<any | null>(null);

  // --- METHOD 4: SUPPLIER SYNC ---
  const [suppliers, setSuppliers] = useState([
    { id: 'sup-1', name: 'HP Distributor Ghana', status: 'Connected', lastSync: 'Today, 08:30 AM', itemsSynced: 42, autoSync: true },
    { id: 'sup-2', name: 'Apple Authorized Wholesale West Africa', status: 'Connected', lastSync: 'Today, 02:15 AM', itemsSynced: 18, autoSync: true },
    { id: 'sup-3', name: 'Samsung Ghana Hub (Circle)', status: 'Disconnected', lastSync: '3 days ago', itemsSynced: 0, autoSync: false }
  ]);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Bulk operation triggers
  const [showBulkActions, setShowBulkActions] = useState(initialShowBulkActions);

  // Auto-calculated variables
  const profitGHS = sellingPrice - costPrice;
  const profitMarginPercent = sellingPrice > 0 ? Math.round((profitGHS / sellingPrice) * 100) : 0;

  useEffect(() => {
    setIsAddingProduct(initialIsAddingProduct);
  }, [initialIsAddingProduct]);

  useEffect(() => {
    setSelectedCategory(initialSelectedCategory);
  }, [initialSelectedCategory]);

  useEffect(() => {
    setShowBulkActions(initialShowBulkActions);
  }, [initialShowBulkActions]);

  useEffect(() => {
    setLocalProducts([...products]);
  }, [products]);

  // Auto update SEO when Name/Brand/Category changes
  useEffect(() => {
    if (name) {
      setSeoTitle(`${name} | Original ${brand} at Immortal Electronics`);
      setSeoDesc(`Buy authentic ${name} in Ghana. Cost-effective ${category} with local warranty, free delivery, and premium after-sales support.`);
      setSeoSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
      setSeoKeywords(`${name.toLowerCase()}, ${brand.toLowerCase()} ghana, buy ${category.toLowerCase()} accra`);
    }
  }, [name, brand, category]);

  // Reset/Initialize fields to safe empty defaults when creating a brand-new product
  useEffect(() => {
    if (isAddingProduct && !editingProduct) {
      setName('');
      setBrand('HP');
      setCategory('Computing');
      setModelNumber('');
      setSku('');
      setBarcode('');
      setDescription('');
      setCostPrice(0);
      setSellingPrice(0);
      setDiscountPrice(0);
      setStock(5);
      setUploadedMain('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop');
      setUploadedGallery(['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=600&auto=format&fit=crop']);
      setUploadedVideo('');
      setLaptopSpecs({
        processor: 'AMD Ryzen 5',
        ram: '8GB DDR4',
        storage: '512GB SSD',
        graphics: 'Integrated Graphics',
        screenSize: '15.6-inch FHD',
        os: 'Windows 11',
        battery: '3-cell Li-ion',
        ports: 'USB-C, USB-A, HDMI',
        connectivity: 'Wi-Fi + Bluetooth',
        warranty: '1 Year Warranty'
      });
      setValidationErrors([]);
      setDuplicateCheckPassed(null);
      setApprovalStep(1);
    }
  }, [isAddingProduct, editingProduct]);

  // Generate SKUs instantly
  const handleGenerateSku = () => {
    const computedSku = `SKU-${brand.slice(0, 3).toUpperCase()}-${category.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    setSku(computedSku);
    const computedBarcode = `779${Math.floor(100000000 + Math.random() * 900000000)}`;
    setBarcode(computedBarcode);
    
    // Log to simulated compression consoling
    setImageCompressionLogs(prev => [...prev, `[IDENTIFIER] Auto-generated SKU: ${computedSku}, Barcode: ${computedBarcode}`]);
  };

  // Firebase Storage Upload Handler
  const uploadImageToFirebase = async (file: File, isMain: boolean) => {
    setFirebaseUploadError(null);
    if (isMain) {
      setIsUploadingMain(true);
    } else {
      setIsUploadingGallery(true);
    }

    try {
      // Create a clean, unique file path in the bucket
      const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const path = `product_images/${cleanFileName}`;
      const storageRef = ref(storage, path);
      
      // Perform the upload
      const snapshot = await uploadBytes(storageRef, file);
      
      // Retrieve download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      if (isMain) {
        setUploadedMain(downloadUrl);
        setImageCompressionLogs(prev => [...prev, `[FIREBASE STORAGE] Main thumbnail uploaded successfully: ${cleanFileName} ✅`]);
      } else {
        if (uploadedGallery.length >= 10) {
          alert('You can only have up to 10 gallery images.');
          return;
        }
        setUploadedGallery(prev => [...prev, downloadUrl]);
        setImageCompressionLogs(prev => [...prev, `[FIREBASE STORAGE] Gallery image uploaded successfully: ${cleanFileName} ✅`]);
      }
    } catch (err: any) {
      console.error("Firebase Storage Upload Error:", err);
      const msg = err.message || 'Failed to upload image to Firebase Storage.';
      setFirebaseUploadError(msg);
      setImageCompressionLogs(prev => [...prev, `[FIREBASE STORAGE ERROR] ${msg} ❌`]);
    } finally {
      if (isMain) {
        setIsUploadingMain(false);
      } else {
        setIsUploadingGallery(false);
      }
    }
  };

  // Firebase Storage Gallery Batch Upload Handler
  const uploadGalleryImagesToFirebase = async (files: FileList) => {
    setFirebaseUploadError(null);
    setIsUploadingGallery(true);
    setImageCompressionLogs(prev => [...prev, `[FIREBASE STORAGE] Starting batch upload of ${files.length} images...`]);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (uploadedGallery.length >= 10) {
          alert('Maximum gallery limit (10) reached.');
          break;
        }

        const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const path = `product_images/${cleanFileName}`;
        const storageRef = ref(storage, path);
        
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        setUploadedGallery(prev => [...prev, downloadUrl]);
        setImageCompressionLogs(prev => [...prev, `[FIREBASE STORAGE] Uploaded gallery item ${i + 1}/${files.length}: ${cleanFileName} ✅`]);
      }
    } catch (err: any) {
      console.error("Firebase Storage Gallery Batch Upload Error:", err);
      const msg = err.message || 'Failed to upload gallery images to Firebase Storage.';
      setFirebaseUploadError(msg);
      setImageCompressionLogs(prev => [...prev, `[FIREBASE STORAGE ERROR] ${msg} ❌`]);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  // Simulating the Drag & Drop compression engine
  const handleImageFileDrop = (type: 'main' | 'gallery' | '360' | 'video') => {
    setIsCompilingImages(true);
    setImageCompressionLogs(prev => [...prev, `[WEBP ENGINE] Intercepted raw upload stream...`]);
    
    setTimeout(() => {
      setImageCompressionLogs(prev => [...prev, `[WEBP ENGINE] Converting layout to .webp standard (Quality: 82%)`]);
    }, 400);

    setTimeout(() => {
      if (type === 'main') {
        setImageCompressionLogs(prev => [...prev, `[WEBP ENGINE] Main image compressed: original 4.8MB -> webp 280KB (-94.2%) ✅`]);
        setUploadedMain('https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop'); // HP Omen img
      } else if (type === 'gallery') {
        setImageCompressionLogs(prev => [...prev, `[WEBP ENGINE] Multi-gallery batch optimized. Total footprint reduced by 88.5% ✅`]);
        setUploadedGallery(old => [...old, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600&auto=format&fit=crop']);
      } else if (type === '360') {
        setImageCompressionLogs(prev => [...prev, `[360 RENDERER] Compiled 36-frame coordinate carousel. Ready for touch drag. ✅`]);
        setUploaded360(old => [...old, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop']);
      } else {
        setImageCompressionLogs(prev => [...prev, `[FFMPEG STREAM] Re-encoding video container to H.264 MP4 wrapper. Bitrate capped at 2.4Mbps. ✅`]);
      }
      setIsCompilingImages(false);
      setApprovalStep(2); // Auto advance to AI Processing / Spec check step
    }, 1500);
  };

  // Run duplicate check & structural validation
  const handleRunValidationAndDuplicateCheck = () => {
    setApprovalStep(3); // Validation stage
    const errors: string[] = [];
    if (!name) errors.push("Product title is required.");
    if (sellingPrice <= 0) errors.push("Selling price must be greater than 0 GHS.");
    if (costPrice >= sellingPrice) errors.push("Warning: Cost price exceeds selling price (Negative Margin).");
    if (!sku) errors.push("SKU identifier is empty (Recommended to click generate).");

    setValidationErrors(errors);

    setTimeout(() => {
      setApprovalStep(4); // Duplicate Check stage
      const hasDuplicate = localProducts.some(p => p.name.toLowerCase() === name.toLowerCase());
      setDuplicateCheckPassed(!hasDuplicate);
    }, 1000);

    setTimeout(() => {
      setApprovalStep(5); // Preview stage
    }, 2000);
  };

  // Save freshly registered or modified catalog item
  const handleDeployProduct = async () => {
    if (!name || !sellingPrice) return;
    
    setIsProcessingApproval(true);
    setApprovalStep(6); // Owner Approval

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name,
      description: description || `Original ${brand} ${name} backed by authorized warranty and corporate support.`,
      priceGHS: Number(sellingPrice),
      priceUSD: Math.round(Number(sellingPrice) / 14.5),
      category,
      brand,
      image: uploadedMain,
      images: [uploadedMain, ...uploadedGallery.filter(url => url && url.trim() !== '')].slice(0, 10),
      rating: editingProduct ? editingProduct.rating : 4.9,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 0,
      stock: Number(stock),
      specs: {
        'SKU': sku || (editingProduct?.specs?.SKU || `SKU-${Date.now().toString().slice(-6)}`),
        'Processor': laptopSpecs.processor,
        'RAM': laptopSpecs.ram,
        'Storage': laptopSpecs.storage,
        'Graphics': laptopSpecs.graphics,
        'Screen Size': laptopSpecs.screenSize,
        'OS': laptopSpecs.os,
        'Warranty': laptopSpecs.warranty,
        'Model No': modelNumber || 'N/A'
      },
      colors: editingProduct ? editingProduct.colors : ['Titanium Charcoal', 'Aurora Silver'],
      isNew: editingProduct ? editingProduct.isNew : true,
      video: uploadedVideo || undefined,
      status: productStatus as any,
      isBestSeller: isBestSeller,
      isNewArrival: isNewArrival,
      isFeatured: isFeatured
    };

    if (editingProduct) {
      await onEditProduct(editingProduct.id, productPayload);
      setLocalProducts(prev => prev.map(p => p.id === editingProduct.id ? productPayload : p));
    } else {
      await onAddProduct(productPayload);
      setLocalProducts(prev => [productPayload, ...prev]);
    }

    setApprovalStep(7); // Publish
    setIsProcessingApproval(false);

    // Flash success
    setTimeout(() => {
      setIsAddingProduct(false);
      setEditingProduct(null);
      // Clear manual state
      setName('');
      setSku('');
      setBarcode('');
      setDescription('');
      setUploadedMain('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop');
      setUploadedGallery(['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=600&auto=format&fit=crop']);
      setUploadedVideo('');
      setApprovalStep(1);
      setImageCompressionLogs([]);
    }, 1000);
  };

  // Save freshly registered or modified catalog item instantly bypassing simulated steps
  const handleQuickPublish = async () => {
    if (!name || !name.trim()) {
      alert("Product name is required!");
      return;
    }
    if (!sellingPrice || Number(sellingPrice) <= 0) {
      alert("Selling price must be greater than 0 GHS!");
      return;
    }

    setIsProcessingApproval(true);
    setApprovalStep(6); // Set directly to owner approval step

    // Auto compute SKU & Barcode if empty
    let finalSku = sku;
    if (!finalSku) {
      finalSku = `SKU-${brand.slice(0, 3).toUpperCase()}-${category.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      setSku(finalSku);
    }
    let finalBarcode = barcode;
    if (!finalBarcode) {
      finalBarcode = `779${Math.floor(100000000 + Math.random() * 900000000)}`;
      setBarcode(finalBarcode);
    }

    // Auto set cost price if cost exceeds selling price
    let finalCost = costPrice;
    if (finalCost >= sellingPrice) {
      finalCost = Math.round(sellingPrice * 0.7);
      setCostPrice(finalCost);
    }

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name,
      description: description || `Original ${brand} ${name} backed by authorized warranty and corporate support.`,
      priceGHS: Number(sellingPrice),
      priceUSD: Math.round(Number(sellingPrice) / 14.5),
      category,
      brand,
      image: uploadedMain,
      images: [uploadedMain, ...uploadedGallery.filter(url => url && url.trim() !== '')].slice(0, 10),
      rating: editingProduct ? editingProduct.rating : 4.9,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 0,
      stock: Number(stock),
      specs: {
        'SKU': finalSku,
        'Processor': laptopSpecs.processor,
        'RAM': laptopSpecs.ram,
        'Storage': laptopSpecs.storage,
        'Graphics': laptopSpecs.graphics,
        'Screen Size': laptopSpecs.screenSize,
        'OS': laptopSpecs.os,
        'Warranty': laptopSpecs.warranty,
        'Model No': modelNumber || 'N/A'
      },
      colors: editingProduct ? editingProduct.colors : ['Titanium Charcoal', 'Aurora Silver'],
      isNew: editingProduct ? editingProduct.isNew : true,
      video: uploadedVideo || undefined,
      status: productStatus as any,
      isBestSeller: isBestSeller,
      isNewArrival: isNewArrival,
      isFeatured: isFeatured
    };

    if (editingProduct) {
      await onEditProduct(editingProduct.id, productPayload);
      setLocalProducts(prev => prev.map(p => p.id === editingProduct.id ? productPayload : p));
    } else {
      await onAddProduct(productPayload);
      setLocalProducts(prev => [productPayload, ...prev]);
    }

    setApprovalStep(7); // Publish
    setIsProcessingApproval(false);

    // Close and reset immediately
    setIsAddingProduct(false);
    setEditingProduct(null);
    setName('');
    setSku('');
    setBarcode('');
    setDescription('');
    setApprovalStep(1);
    setValidationErrors([]);
    setDuplicateCheckPassed(null);
  };

  // --- SPREADSHEET IMPORT ---
  const handleImportSpreadsheet = () => {
    setIsBulkImporting(true);
    setTimeout(() => {
      bulkProducts.forEach((item) => {
        const newProduct: Product = {
          id: `prod-bulk-${item.id}-${Date.now()}`,
          name: item.name,
          description: `Bulk Upload Verified: Premium ${item.brand} catalog listing registered automatically.`,
          priceGHS: item.priceGHS,
          priceUSD: Math.round(item.priceGHS / 14.5),
          category: item.brand === 'HP' ? 'Computing' : 'Smartphones',
          brand: item.brand,
          image: item.image,
          images: [item.image],
          rating: 4.7,
          reviewsCount: 3,
          stock: item.stock,
          specs: { 'SKU': `SKU-BULK-${Math.floor(100 + Math.random() * 900)}` },
          colors: ['Standard'],
          isNew: true
        };
        onAddProduct(newProduct);
        setLocalProducts(prev => [newProduct, ...prev]);
      });

      setIsBulkImporting(false);
      setBulkFile(null);
      setIsAddingProduct(false);
    }, 2000);
  };

  // --- GEMINI AI OPTIMIZER ---
  const handleRunGeminiAiImport = () => {
    setIsAiProcessing(true);
    setAiLogs([
      '[Gemini-3.5-Flash] Initiating deep multimodal parsing pipeline...',
      '[Gemini-3.5-Flash] Running OCR scan on supplier document / brochure image...'
    ]);

    setTimeout(() => {
      setAiLogs(old => [...old, '[Gemini-3.5-Flash] Product detected: "HP Omen Gaming Laptop 16-c0009ne"']);
    }, 800);

    setTimeout(() => {
      setAiLogs(old => [...old, '[Gemini-3.5-Flash] Extracted specifications: AMD Ryzen 7, 16GB RAM, RTX 3060, 16.1" display.']);
    }, 1500);

    setTimeout(() => {
      setAiLogs(old => [...old, '[Gemini-3.5-Flash] Composing SEO Title, description, and auto-optimizing keywords.']);
    }, 2200);

    setTimeout(() => {
      setAiLogs(old => [...old, '[Gemini-3.5-Flash] Structured markup compiled: schema.org/Product structured JSON-LD created.']);
      
      setAiGeneratedResult({
        name: 'HP Omen Gaming Laptop 16-c0009ne',
        brand: 'HP',
        category: 'Computing',
        priceGHS: 10800,
        stock: 5,
        specs: {
          processor: 'AMD Ryzen 7 5800H',
          ram: '16GB DDR4',
          storage: '512GB PCIe SSD',
          graphics: 'NVIDIA RTX 3060',
          screenSize: '16.1-inch 144Hz',
          os: 'Windows 11'
        },
        seoTitle: 'HP Omen Gaming Laptop 16-c0009ne | Buy Online at Immortal Accra',
        seoDesc: 'Get the HP Omen 16" Gaming laptop with Ryzen 7 & RTX 3060 at Immortal Electronics. Original high performance computing with verified West African warranty.',
        description: 'Conquer any virtual battlefield with the HP Omen Gaming Laptop 16. Immersive high-refresh rate displays, elite-grade heat dispersal architecture, and optimized multi-core processing to unlock ultimate frames-per-second values.'
      });

      // Auto fill manual forms with AI recommendations for easy manual tuning
      setName('HP Omen Gaming Laptop 16-c0009ne');
      setBrand('HP');
      setCategory('Computing');
      setSellingPrice(10800);
      setCostPrice(7200);
      setStock(5);
      setDescription('Conquer any virtual battlefield with the HP Omen Gaming Laptop 16. Immersive high-refresh rate displays, elite-grade heat dispersal architecture, and optimized multi-core processing.');
      setLaptopSpecs({
        processor: 'AMD Ryzen 7 5800H',
        ram: '16GB DDR4',
        storage: '512GB PCIe NVMe',
        graphics: 'NVIDIA RTX 3060',
        screenSize: '16.1-inch 144Hz',
        os: 'Windows 11',
        battery: '83Wh Fast-Charge',
        ports: '3x USB-A, 1x HDMI',
        connectivity: 'Wi-Fi 6',
        warranty: '1 Year Warranty'
      });
      handleGenerateSku();

      setIsAiProcessing(false);
    }, 3200);
  };

  // --- SUPPLIER CRON SYNC ---
  const handleTriggerSupplierSync = () => {
    setIsSyncingAll(true);
    setSyncLogs([
      `[CRON ENGINE] Booting local sync task at ${new Date().toLocaleTimeString()}...`,
      `[CRON ENGINE] Querying "HP Distributor Ghana" secure catalog database...`
    ]);

    setTimeout(() => {
      setSyncLogs(old => [...old, `[HP-SYNC] Parsed 42 items. Updated inventory levels for 14 models.`]);
    }, 1000);

    setTimeout(() => {
      setSyncLogs(old => [...old, `[APPLE-SYNC] Connected to Apple West Africa. Verified trade-in SKU listings.`]);
    }, 2000);

    setTimeout(() => {
      setSyncLogs(old => [...old, `[CRON ENGINE] Core Database update complete. Added 0 duplicates. Synced 60/60 records successfully.`]);
      setIsSyncingAll(false);
      
      // Update supplier status dates
      setSuppliers(prev => prev.map(s => s.status === 'Connected' ? { ...s, lastSync: 'Just Now', itemsSynced: s.itemsSynced + Math.floor(Math.random() * 5) } : s));
    }, 3000);
  };

  // Perform bulk pricing increases for selected brands
  const handleBulkPriceAdjustment = (brandName: string, percent: number) => {
    setLocalProducts(prev => prev.map(p => {
      if (p.brand === brandName || brandName === 'All') {
        const adjustedGHS = Math.round(p.priceGHS * (1 + percent / 100));
        return {
          ...p,
          priceGHS: adjustedGHS,
          priceUSD: Math.round(adjustedGHS / 14.5)
        };
      }
      return p;
    }));
    setShowBulkActions(false);
  };

  // Rich text editor syntax triggers
  const handleAppendText = (tags: string) => {
    setDescription(old => old + ' ' + tags);
  };

  const filteredProducts = localProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and action controllers */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
        <div className="flex-1 flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search products by brand, SKU, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-mono"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 text-xs rounded-xl font-bold"
          >
            <option value="All">All Categories</option>
            <option value="Computing">Computing</option>
            <option value="Smartphones">Smartphones</option>
            <option value="Accessories">Accessories</option>
            <option value="Gaming">Gaming</option>
            <option value="Smart Home">Smart Home</option>
          </select>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={() => setShowBulkActions(!showBulkActions)}
            className="px-3.5 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5 shrink-0"
          >
            <Sliders size={13} />
            <span>Bulk Actions</span>
          </button>
          
          <button
            onClick={() => {
              setIsAddingProduct(true);
              setActiveCreationMethod('ai');
            }}
            className="px-3.5 py-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 hover:bg-indigo-500/20"
          >
            <Sparkles size={13} className="animate-pulse" />
            <span>AI Product Manager</span>
          </button>

          <button
            onClick={() => {
              setIsAddingProduct(true);
              setActiveCreationMethod('sync');
            }}
            className="px-3.5 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 hover:bg-emerald-500/20"
          >
            <Globe size={13} />
            <span>Supplier Sync Hub</span>
          </button>

          <button
            onClick={() => {
              setIsAddingProduct(true);
              setActiveCreationMethod('manual');
            }}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 shadow-lg shadow-amber-500/10"
          >
            <Plus size={14} />
            <span>Add Catalog Item</span>
          </button>
        </div>
      </div>

      {/* Bulk actions options box */}
      {showBulkActions && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50/50 dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl flex flex-wrap gap-3 items-center"
        >
          <span className="text-[10px] font-bold uppercase font-mono text-gray-400 mr-2">Bulk Pricing Modifiers:</span>
          <button
            onClick={() => handleBulkPriceAdjustment('HP', 10)}
            className="px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black rounded-lg text-xs font-mono font-bold"
          >
            HP Prices (+10%)
          </button>
          <button
            onClick={() => handleBulkPriceAdjustment('Apple', 8)}
            className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-black rounded-lg text-xs font-mono font-bold"
          >
            Apple Prices (+8%)
          </button>
          <button
            onClick={() => handleBulkPriceAdjustment('All', -5)}
            className="px-3 py-1.5 bg-rose-500/15 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-black rounded-lg text-xs font-mono font-bold"
          >
            Storewide Promo (-5%)
          </button>
        </motion.div>
      )}

      {/* Products table list */}
      <div className="bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 bg-gray-50/50 dark:bg-black/10 border-b border-gray-150 dark:border-gray-800 flex justify-between items-center">
          <span className="text-xs font-black uppercase font-mono text-gray-500">Live Catalog Index ({filteredProducts.length})</span>
          <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded font-mono font-bold">ACCRA CENTRAL GATEWAY</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/20 dark:bg-black/5 border-b border-gray-100 dark:border-gray-900 text-[10px] font-bold uppercase font-mono text-gray-400">
                <th className="p-4">Item Details</th>
                <th className="p-4">Brand / Category</th>
                <th className="p-4">Retail Price</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4 text-right">Adjust Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900 text-xs">
              {filteredProducts.map((p) => {
                const isLowStock = p.stock < 5;
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.image} className="w-11 h-11 object-cover rounded-xl border border-gray-150 dark:border-gray-800/80" alt={p.name} onError={handleImageError} />
                      <div>
                        <h5 className="font-extrabold text-gray-900 dark:text-white leading-tight">{p.name}</h5>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[9px] font-mono bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-gray-800 text-gray-400 px-1.5 py-0.5 rounded uppercase">{p.id.split('-').pop()?.toUpperCase()}</span>
                          {p.specs?.SKU && (
                            <span className="text-[9px] font-mono text-gray-400">SKU: {p.specs.SKU}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold block text-gray-800 dark:text-gray-200">{p.brand}</span>
                      <span className="text-[10px] font-mono text-gray-400 block">{p.category}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-gray-900 dark:text-white">
                      {currency === 'GHS' ? `GHS ${p.priceGHS.toLocaleString()}` : `$${(p.priceUSD || Math.round(p.priceGHS / 14.5)).toLocaleString()}`}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isLowStock ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className={`font-mono font-extrabold ${isLowStock ? 'text-rose-500' : 'text-gray-400'}`}>
                          {p.stock} Units
                        </span>
                        {isLowStock && <span className="text-[9px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase">LOW ALERT</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <input
                          type="number"
                          key={`${p.id}-stock-${p.stock}`}
                          defaultValue={p.stock}
                          onBlur={async (e) => {
                            const val = Number(e.target.value);
                            if (val >= 0) {
                              const updated = await onUpdateStock(p.id, val);
                              setLocalProducts(prev => prev.map(old => old.id === p.id ? { ...old, stock: val } : old));
                            }
                          }}
                          className="w-14 text-center p-1.5 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-lg font-mono text-[11px]"
                        />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setName(p.name);
                            setBrand(p.brand || 'HP');
                            setCategory(p.category || 'Computing');
                            setModelNumber(p.specs?.['Model No'] || p.specs?.['Model Number'] || '');
                            setSku(p.specs?.SKU || '');
                            setBarcode(p.specs?.Barcode || '');
                            setDescription(p.description || '');
                            setCostPrice(p.specs?.Cost ? Number(p.specs.Cost) : Math.round(p.priceGHS * 0.65));
                            setSellingPrice(p.priceGHS);
                            setDiscountPrice(p.priceGHS * 0.95);
                            setStock(p.stock);
                            setUploadedMain(p.image);
                            setUploadedGallery(p.images || [p.image]);
                            setUploadedVideo(p.video || '');
                            setProductStatus(p.status || 'Published');
                            setIsBestSeller(p.isBestSeller || false);
                            setIsNewArrival(p.isNewArrival || false);
                            setIsFeatured(p.isFeatured || false);
                            if (p.specs) {
                              setLaptopSpecs({
                                processor: p.specs.Processor || 'AMD Ryzen 7 5800H',
                                ram: p.specs.RAM || '16GB DDR4 Dual-Channel',
                                storage: p.specs.Storage || '512GB PCIe NVMe M.2 SSD',
                                graphics: p.specs.Graphics || 'NVIDIA GeForce RTX 3060 (6GB GDDR6)',
                                screenSize: p.specs['Screen Size'] || '16.1-inch FHD, 144Hz IPS',
                                os: p.specs.OS || 'Windows 11 Home',
                                battery: p.specs.Battery || '83Wh Fast-Charge Li-ion',
                                ports: p.specs.Ports || '3x USB-A, 1x USB-C (DP), 1x HDMI 2.1, RJ-45, Audio Combo',
                                connectivity: p.specs.Connectivity || 'Wi-Fi 6 (2x2) + Bluetooth 5.2',
                                warranty: p.specs.Warranty || '1 Year Local Warranty by Immortal Tech'
                              });
                            }
                            setIsAddingProduct(true);
                            setActiveCreationMethod('manual');
                          }}
                          className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg border border-blue-500/20 transition-all"
                          title="Edit Product"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                              await onDeleteProduct(p.id);
                              setLocalProducts(prev => prev.filter(old => old.id !== p.id));
                            }
                          }}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg border border-rose-500/20 transition-all"
                          title="Delete Product"
                        >
                          <Trash size={13} />
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

      {/* FULL-SCREEN ADDMEMBER/PRODUCT DRAWER */}
      <AnimatePresence>
        {isAddingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="bg-white dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-800 p-6 rounded-3xl w-full max-w-4xl space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              {editingProduct ? (
                /* --- CLEAN, HIGH-CONTRAST DEDICATED EDITING INTERFACE --- */
                <div className="space-y-5">
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Edit className="w-4.5 h-4.5 text-blue-500" />
                        <span>Edit Product: {editingProduct.name}</span>
                      </h3>
                      <p className="text-xs text-gray-400">Modify the retail parameters, inventory levels, and specification metrics for this catalog item.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingProduct(null);
                        setIsAddingProduct(false);
                      }} 
                      className="px-2.5 py-1 text-[10px] font-mono border border-gray-150 dark:border-gray-800 rounded-lg text-gray-400 hover:text-white"
                    >
                      CANCEL EDIT
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left Column: Form Fields */}
                    <div className="md:col-span-8 space-y-4">
                      {/* Basic Info */}
                      <div className="p-4 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider font-mono text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1.5">Basic Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Product Name</label>
                            <input 
                              type="text" 
                              placeholder="E.g., HP Omen Gaming Laptop 16"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-950 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Brand</label>
                            <select 
                              value={brand}
                              onChange={(e) => setBrand(e.target.value)}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-950 dark:text-white"
                            >
                              <option value="HP">HP</option>
                              <option value="Apple">Apple</option>
                              <option value="Samsung">Samsung</option>
                              <option value="Google">Google</option>
                              <option value="Sony">Sony</option>
                              <option value="Dell">Dell</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Category</label>
                            <select 
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-950 dark:text-white"
                            >
                              <option value="Computing">Computing</option>
                              <option value="Smartphones">Smartphones</option>
                              <option value="Accessories">Accessories</option>
                              <option value="Gaming">Gaming</option>
                              <option value="Smart Home">Smart Home</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Model Number</label>
                            <input 
                              type="text" 
                              placeholder="Model Number"
                              value={modelNumber}
                              onChange={(e) => setModelNumber(e.target.value)}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-mono text-gray-950 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Stock */}
                      <div className="p-4 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider font-mono text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1.5">Pricing & Inventory</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Retail Selling Price (GHS)</label>
                            <input 
                              type="number" 
                              value={sellingPrice}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setSellingPrice(val);
                                setCostPrice(Math.round(val * 0.7));
                                setDiscountPrice(Math.round(val * 0.95));
                              }}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold font-mono text-gray-950 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Quantity in Stock</label>
                            <input 
                              type="number" 
                              value={stock}
                              onChange={(e) => setStock(Number(e.target.value))}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold font-mono text-gray-950 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">SKU Identifier</label>
                            <input 
                              type="text" 
                              value={sku}
                              onChange={(e) => setSku(e.target.value)}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-mono text-gray-950 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Specifications (Conditional) */}
                      <div className="p-4 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider font-mono text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1.5">Technical Specifications</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-400">Processor</label>
                            <input 
                              type="text" 
                              value={laptopSpecs.processor}
                              onChange={(e) => setLaptopSpecs({...laptopSpecs, processor: e.target.value})}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-gray-950 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-400">RAM</label>
                            <input 
                              type="text" 
                              value={laptopSpecs.ram}
                              onChange={(e) => setLaptopSpecs({...laptopSpecs, ram: e.target.value})}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-gray-950 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-400">Storage Size</label>
                            <input 
                              type="text" 
                              value={laptopSpecs.storage}
                              onChange={(e) => setLaptopSpecs({...laptopSpecs, storage: e.target.value})}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-gray-950 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-400">Graphics GPU</label>
                            <input 
                              type="text" 
                              value={laptopSpecs.graphics}
                              onChange={(e) => setLaptopSpecs({...laptopSpecs, graphics: e.target.value})}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-gray-950 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-400">Warranty</label>
                            <input 
                              type="text" 
                              value={laptopSpecs.warranty}
                              onChange={(e) => setLaptopSpecs({...laptopSpecs, warranty: e.target.value})}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-gray-950 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-400">OS</label>
                            <input 
                              type="text" 
                              value={laptopSpecs.os}
                              onChange={(e) => setLaptopSpecs({...laptopSpecs, os: e.target.value})}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-gray-950 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="p-4 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-2">
                        <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Product Description</label>
                        <textarea 
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs text-gray-950 dark:text-white"
                          placeholder="Write a clear, enticing description of the product features..."
                        />
                      </div>
                    </div>

                    {/* Right Column: Image Preview & Publish */}
                    <div className="md:col-span-4 space-y-4 flex flex-col justify-between">
                      <div className="p-4 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider font-mono text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1.5">Product Asset</h4>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Primary Image URL</label>
                          <input 
                            type="text" 
                            value={uploadedMain}
                            onChange={(e) => setUploadedMain(e.target.value)}
                            className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-mono text-gray-950 dark:text-white"
                          />
                        </div>
                        <div className="aspect-video w-full relative rounded-xl overflow-hidden border border-gray-150 dark:border-gray-800">
                          <img src={uploadedMain} className="w-full h-full object-cover" alt="Product thumbnail preview" referrerPolicy="no-referrer" onError={handleImageError} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={handleQuickPublish}
                          disabled={isProcessingApproval || !name}
                          className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 text-white text-xs font-black rounded-xl transition shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
                        >
                          {isProcessingApproval ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>💾 Save Changes & Re-publish Live</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(null);
                            setIsAddingProduct(false);
                          }}
                          className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-black/40 dark:hover:bg-black/60 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400"
                        >
                          Discard Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* --- DEDICATED ADD NEW PRODUCT WORKFLOW --- */
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <LayoutGrid className="w-4.5 h-4.5 text-amber-500" />
                        <span>Deploy Next-Gen Product Listing</span>
                      </h3>
                      <p className="text-xs text-gray-400">Complete enterprise specification metrics, leverage Gemini AI copywriting, or synchronize supplier bulk catalogs.</p>
                    </div>
                    <button 
                      onClick={() => setIsAddingProduct(false)} 
                      className="px-2.5 py-1 text-[10px] font-mono border border-gray-150 dark:border-gray-800 rounded-lg text-gray-400 hover:text-white"
                    >
                      ESC CLOSE
                    </button>
                  </div>

                  {/* Method Selection Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 border-b border-gray-100 dark:border-gray-800 pb-4">
                    {[
                      { id: 'inject', label: '⚡ Quick Injector', icon: Zap, color: 'text-amber-500' },
                      { id: 'manual', label: 'Manual Editor', icon: Edit, color: 'text-blue-500' },
                      { id: 'bulk', label: 'Bulk Upload', icon: FileText, color: 'text-indigo-500' },
                      { id: 'ai', label: 'AI Manager', icon: Sparkles, color: 'text-violet-500' },
                      { id: 'sync', label: 'Supplier Sync', icon: Globe, color: 'text-emerald-500' }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isCurrent = activeCreationMethod === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveCreationMethod(item.id as any)}
                          className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold tracking-tight transition-all ${
                            isCurrent 
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' 
                              : 'bg-transparent border-gray-150 dark:border-gray-850 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* PRODUCT APPROVAL WORKFLOW STATUS PROGRESS BAR (Only shown in Manual tab to keep other views clean) */}
                  {activeCreationMethod === 'manual' && (
                    <div className="p-3.5 bg-gray-50 dark:bg-black/30 border border-gray-150 dark:border-gray-800 rounded-2xl space-y-2.5">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase font-mono text-gray-400">
                        <span>Product Lifecycle Approval Gateways</span>
                        <span className="text-[#0066FF] flex items-center gap-1">
                          <Zap className="w-3 h-3 text-blue-500 animate-bounce" />
                          <span>Automatic Compliance Checking</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {[
                          { step: 1, label: 'Upload' },
                          { step: 2, label: 'AI processing' },
                          { step: 3, label: 'Validation' },
                          { step: 4, label: 'Duplicate Check' },
                          { step: 5, label: 'Preview' },
                          { step: 6, label: 'Owner Approval' },
                          { step: 7, label: 'Publish' }
                        ].map((gate) => {
                          const isDone = approvalStep >= gate.step;
                          const isCurrent = approvalStep === gate.step;
                          return (
                            <div key={gate.step} className="flex flex-col items-center">
                              <div className={`w-full h-1.5 rounded-full transition-colors ${
                                isDone 
                                  ? 'bg-emerald-500' 
                                  : isCurrent 
                                    ? 'bg-blue-500 animate-pulse' 
                                    : 'bg-gray-200 dark:bg-gray-800'
                              }`} />
                              <span className={`text-[8px] font-mono mt-1 ${isCurrent ? 'text-blue-500 font-bold' : isDone ? 'text-emerald-500' : 'text-gray-500'}`}>
                                {gate.step}. {gate.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* METHOD 0: QUICK PRODUCT TEMPLATE INJECTOR */}
                  {activeCreationMethod === 'inject' && (
                    <div className="space-y-5 text-gray-950 dark:text-white">
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                        <div className="space-y-1 text-center sm:text-left">
                          <span className="font-extrabold text-gray-900 dark:text-white block flex items-center gap-1.5 justify-center sm:justify-start">
                            <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            <span>⚡ Simple & Friendly Product Template Injector</span>
                          </span>
                          <p className="text-gray-400">Select one of our premium, pre-configured product templates below. We will instantly pre-fill all specifications, Unsplash images, and descriptions. Adjust the price and stock, and post it live in 1 click!</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {INJECTION_TEMPLATES.map((tpl, idx) => {
                          const isSelected = selectedTemplateIdx === idx;
                          return (
                            <button
                              key={tpl.name}
                              onClick={() => setSelectedTemplateIdx(idx)}
                              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 h-[150px] relative overflow-hidden ${
                                isSelected 
                                  ? 'bg-amber-500/15 border-amber-500 text-amber-500 ring-2 ring-amber-500/20' 
                                  : 'bg-white dark:bg-[#121212]/30 border-gray-150 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5'
                              }`}
                            >
                              <div className="absolute inset-0 opacity-10">
                                <img src={tpl.image} className="w-full h-full object-cover animate-pulse" alt="" referrerPolicy="no-referrer" onError={handleImageError} />
                              </div>
                              <div className="relative z-10 space-y-1">
                                <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 bg-black/40 rounded text-gray-300">
                                  {tpl.brand}
                                </span>
                                <h5 className="text-[11px] font-black leading-tight text-gray-900 dark:text-white line-clamp-2 mt-1">
                                  {tpl.name}
                                </h5>
                              </div>
                              <div className="relative z-10 flex justify-between items-end">
                                <span className="text-[10px] font-bold font-mono text-emerald-500">
                                  GHS {tpl.priceGHS.toLocaleString()}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* ACTIVE INJECTION CARD PREVIEW & ADJUSTMENTS */}
                      {INJECTION_TEMPLATES[selectedTemplateIdx] && (
                        <div className="p-5 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/40 rounded-2xl space-y-4 shadow-inner">
                          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                            <h4 className="text-xs font-black font-mono text-amber-500 uppercase flex items-center gap-1.5">
                              <Sparkles size={14} className="animate-pulse" />
                              <span>Selected Injection Blueprint: {INJECTION_TEMPLATES[selectedTemplateIdx].name}</span>
                            </h4>
                            <span className="text-[10px] font-mono text-gray-400">Spec sheet auto-populated with {Object.keys(INJECTION_TEMPLATES[selectedTemplateIdx].specs).length} points</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                            {/* Adjustments Form */}
                            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Product Title</label>
                                <input 
                                  type="text" 
                                  value={name} 
                                  onChange={(e) => setName(e.target.value)}
                                  className="w-full p-2 bg-gray-50 dark:bg-black/30 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-950 dark:text-white"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Selling Price (GHS)</label>
                                  <input 
                                    type="number" 
                                    value={sellingPrice} 
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setSellingPrice(val);
                                      setCostPrice(Math.round(val * 0.7));
                                      setDiscountPrice(Math.round(val * 0.95));
                                    }}
                                    className="w-full p-2 bg-gray-50 dark:bg-black/30 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold font-mono text-emerald-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Stock Inventory</label>
                                  <input 
                                    type="number" 
                                    value={stock} 
                                    onChange={(e) => setStock(Number(e.target.value))}
                                    className="w-full p-2 bg-gray-50 dark:bg-black/30 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold font-mono text-gray-950 dark:text-white"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1 col-span-1 sm:col-span-2">
                                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Image Asset URL</label>
                                <input 
                                  type="text" 
                                  value={uploadedMain} 
                                  onChange={(e) => setUploadedMain(e.target.value)}
                                  className="w-full p-2 bg-gray-50 dark:bg-black/30 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-mono text-gray-950 dark:text-white"
                                />
                              </div>
                              <div className="space-y-1 col-span-1 sm:col-span-2">
                                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Description</label>
                                <textarea 
                                  rows={2}
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                  className="w-full p-2 bg-gray-50 dark:bg-black/30 border border-gray-150 dark:border-gray-800 rounded-xl text-xs text-gray-950 dark:text-white"
                                />
                              </div>
                            </div>

                            {/* Visual Card Preview */}
                            <div className="md:col-span-4 p-3 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-2xl flex flex-col justify-between">
                              <div className="space-y-2">
                                <span className="text-[9px] font-mono uppercase font-bold text-gray-400 block">STOREFRONT LISTING PREVIEW</span>
                                <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-150 dark:border-gray-850 relative">
                                  <img src={uploadedMain} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" onError={handleImageError} />
                                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                                    {brand}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <h6 className="text-[11px] font-extrabold text-gray-900 dark:text-white line-clamp-1">{name || 'Unnamed Product'}</h6>
                                  <div className="flex justify-between items-center font-mono">
                                    <span className="text-xs font-black text-emerald-500">GHS {sellingPrice.toLocaleString()}</span>
                                    <span className="text-[9px] text-gray-400">{stock} units available</span>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-3">
                                <button
                                  onClick={handleQuickPublish}
                                  disabled={isProcessingApproval || !name}
                                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-800 text-black text-xs font-black rounded-xl transition shadow-lg shadow-amber-500/15 flex items-center justify-center gap-1.5"
                                >
                                  <Check className="w-3.5 h-3.5 text-black" />
                                  <span>🚀 Instantly Publish to Storefront</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* METHOD 1: MANUAL PRODUCT EDITOR */}
                  {activeCreationMethod === 'manual' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Form Fields */}
                  <div className="md:col-span-8 space-y-4">
                    {/* Basic Info */}
                    <div className="p-4 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider font-mono text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1.5">Basic Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Product Name</label>
                          <input 
                            type="text" 
                            placeholder="E.g., HP Omen Gaming Laptop 16-c0009ne"
                            value={name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setName(val);
                              if (!sku) {
                                const computedSku = `SKU-${brand.slice(0, 3).toUpperCase()}-${category.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
                                setSku(computedSku);
                              }
                              if (!barcode) {
                                setBarcode(`779${Math.floor(100000000 + Math.random() * 900000000)}`);
                              }
                            }}
                            className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Brand</label>
                          <select 
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold"
                          >
                            <option value="HP">HP</option>
                            <option value="Apple">Apple</option>
                            <option value="Samsung">Samsung</option>
                            <option value="Google">Google</option>
                            <option value="Sony">Sony</option>
                            <option value="Dell">Dell</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Category</label>
                          <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold"
                          >
                            <option value="Computing">Computing</option>
                            <option value="Smartphones">Smartphones</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Smart Home">Smart Home</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Model Number</label>
                          <input 
                            type="text" 
                            placeholder="16-c0009ne"
                            value={modelNumber}
                            onChange={(e) => setModelNumber(e.target.value)}
                            className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">SKU (Auto-Generated)</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Click Generate SKU"
                              value={sku}
                              readOnly
                              className="flex-1 p-2 bg-gray-100 dark:bg-black/40 text-gray-400 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-mono"
                            />
                            <button 
                              onClick={handleGenerateSku}
                              className="px-3 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold"
                            >
                              Generate
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Barcode</label>
                          <input 
                            type="text" 
                            value={barcode}
                            readOnly
                            placeholder="Barcode"
                            className="w-full p-2 bg-gray-100 dark:bg-black/40 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-mono text-gray-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pricing, Cost, Margin, Tax */}
                    <div className="p-4 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-1.5">
                        <h4 className="text-xs font-black uppercase tracking-wider font-mono text-gray-900 dark:text-white">Pricing & Financial Ledger</h4>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">PROFIT ENGINE</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1 col-span-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Cost Price (GHS)</label>
                          <input 
                            type="number" 
                            value={costPrice}
                            onChange={(e) => setCostPrice(Number(e.target.value))}
                            className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold font-mono"
                          />
                        </div>
                        <div className="space-y-1 col-span-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Selling Price (GHS)</label>
                          <input 
                            type="number" 
                            value={sellingPrice}
                            onChange={(e) => {
                              const price = Number(e.target.value);
                              setSellingPrice(price);
                              if (costPrice === 0 || costPrice >= price) {
                                setCostPrice(Math.round(price * 0.7));
                              }
                              if (discountPrice === 0 || discountPrice >= price) {
                                setDiscountPrice(Math.round(price * 0.95));
                              }
                            }}
                            className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold font-mono"
                          />
                        </div>
                        <div className="space-y-1 col-span-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Discount Price (GHS)</label>
                          <input 
                            type="number" 
                            value={discountPrice}
                            onChange={(e) => setDiscountPrice(Number(e.target.value))}
                            className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold font-mono text-emerald-500"
                          />
                        </div>
                        <div className="space-y-1 col-span-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">GHA Standard Tax (VAT %)</label>
                          <input 
                            type="number" 
                            value={taxPercent}
                            onChange={(e) => setTaxPercent(Number(e.target.value))}
                            className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs">
                          <span className="text-gray-400 text-[10px] block font-mono uppercase">Calculated Gross Profit</span>
                          <span className="text-base font-black text-emerald-500 font-mono">GHS {profitGHS.toLocaleString()}</span>
                        </div>
                        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-xs">
                          <span className="text-gray-400 text-[10px] block font-mono uppercase">Profit Margin Percent</span>
                          <span className="text-base font-black text-blue-500 font-mono">{profitMarginPercent}% Margin</span>
                        </div>
                      </div>
                    </div>

                    {/* Inventory & Stock Limits */}
                    <div className="p-4 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider font-mono text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1.5">Inventory Operations</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Quantity in Stock</label>
                          <input 
                            type="number" 
                            value={stock}
                            onChange={(e) => setStock(Number(e.target.value))}
                            className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Low Stock Alert Threshold</label>
                          <input 
                            type="number" 
                            value={lowStockAlert}
                            onChange={(e) => setLowStockAlert(Number(e.target.value))}
                            className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold font-mono text-rose-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Assigned Warehouse</label>
                          <select
                            value={warehouse}
                            onChange={(e) => setWarehouse(e.target.value)}
                            className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold"
                          >
                            <option value="Accra Headquarters (Ebony)">Accra Headquarters (Ebony)</option>
                            <option value="Circle Tech Workbench Depot">Circle Tech Workbench Depot</option>
                            <option value="Kumasi Central Hub">Kumasi Central Hub</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Specifications (Laptop Section) */}
                    {category === 'Computing' && (
                      <div className="p-4 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-1.5">
                          <h4 className="text-xs font-black uppercase tracking-wider font-mono text-gray-900 dark:text-white">Laptop Hardware Specifications</h4>
                          <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold uppercase font-mono">SPEC BUILDER</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-400">Processor</label>
                            <input 
                              type="text" 
                              value={laptopSpecs.processor}
                              onChange={(e) => setLaptopSpecs({...laptopSpecs, processor: e.target.value})}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-400">RAM</label>
                            <input 
                              type="text" 
                              value={laptopSpecs.ram}
                              onChange={(e) => setLaptopSpecs({...laptopSpecs, ram: e.target.value})}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-400">Storage Size</label>
                            <input 
                              type="text" 
                              value={laptopSpecs.storage}
                              onChange={(e) => setLaptopSpecs({...laptopSpecs, storage: e.target.value})}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-400">Graphics GPU</label>
                            <input 
                              type="text" 
                              value={laptopSpecs.graphics}
                              onChange={(e) => setLaptopSpecs({...laptopSpecs, graphics: e.target.value})}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-400">Screen Size & Frame Rates</label>
                            <input 
                              type="text" 
                              value={laptopSpecs.screenSize}
                              onChange={(e) => setLaptopSpecs({...laptopSpecs, screenSize: e.target.value})}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-400">Operating System (OS)</label>
                            <input 
                              type="text" 
                              value={laptopSpecs.os}
                              onChange={(e) => setLaptopSpecs({...laptopSpecs, os: e.target.value})}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-400">Battery Life</label>
                            <input 
                              type="text" 
                              value={laptopSpecs.battery}
                              onChange={(e) => setLaptopSpecs({...laptopSpecs, battery: e.target.value})}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-400">Warranty Details</label>
                            <input 
                              type="text" 
                              value={laptopSpecs.warranty}
                              onChange={(e) => setLaptopSpecs({...laptopSpecs, warranty: e.target.value})}
                              className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rich Text Editor */}
                    <div className="p-4 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                        <label className="text-xs font-black uppercase tracking-wider font-mono text-gray-900 dark:text-white">Rich Text Description Editor</label>
                        <span className="text-[10px] text-gray-400">Live HTML/Markdown Wrapper</span>
                      </div>

                      {/* Toolbars */}
                      <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-black/45 p-1.5 rounded-xl border border-gray-150 dark:border-gray-850">
                        <button onClick={() => handleAppendText('<h1>Product Highlight</h1>')} className="px-2 py-1 text-[10px] font-mono font-bold hover:bg-gray-200 dark:hover:bg-white/5 rounded border border-gray-200 dark:border-gray-800">H1</button>
                        <button onClick={() => handleAppendText('<h2>Tech Specs</h2>')} className="px-2 py-1 text-[10px] font-mono font-bold hover:bg-gray-200 dark:hover:bg-white/5 rounded border border-gray-200 dark:border-gray-800">H2</button>
                        <button onClick={() => handleAppendText('<ul>\n  <li>Dual Heat dispersal pipes</li>\n  <li>Aura light keys</li>\n</ul>')} className="px-2 py-1 text-[10px] font-mono font-bold hover:bg-gray-200 dark:hover:bg-white/5 rounded border border-gray-200 dark:border-gray-800">Bullets</button>
                        <button onClick={() => handleAppendText('<table class="w-full border">\n  <tr>\n    <td class="border p-2 font-bold">Standard Metric</td>\n    <td class="border p-2">Premium Rating</td>\n  </tr>\n</table>')} className="px-2 py-1 text-[10px] font-mono font-bold hover:bg-gray-200 dark:hover:bg-white/5 rounded border border-gray-200 dark:border-gray-800">Table</button>
                        <button onClick={() => handleAppendText('<iframe width="100%" height="315" src="https://www.youtube.com/embed/xxxx" />')} className="px-2 py-1 text-[10px] font-mono font-bold hover:bg-gray-200 dark:hover:bg-white/5 rounded border border-gray-200 dark:border-gray-800">Embed Video</button>
                        <button onClick={() => handleAppendText('<img src="https://images.unsplash.com/photo-1603302576837-37561b2e2302" class="w-full h-auto rounded-xl" />')} className="px-2 py-1 text-[10px] font-mono font-bold hover:bg-gray-200 dark:hover:bg-white/5 rounded border border-gray-200 dark:border-gray-800">Insert Image</button>
                      </div>

                      <textarea
                        rows={5}
                        placeholder="Write a highly engaging product description..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Right Column: Upload, SEO, Review */}
                  <div className="md:col-span-4 space-y-4">
                    {/* Status & Options */}
                    <div className="p-4 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider font-mono text-gray-900 dark:text-white">Publishing Status</h4>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        {['Draft', 'Scheduled', 'Published'].map((st) => (
                          <button
                            key={st}
                            onClick={() => setProductStatus(st as any)}
                            className={`py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase border ${
                              productStatus === st 
                                ? 'bg-amber-500 border-amber-600 text-black' 
                                : 'bg-transparent border-gray-150 dark:border-gray-800 text-gray-400'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Flags / Options */}
                    <div className="p-4 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider font-mono text-gray-900 dark:text-white">Product Badges / Flags</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-mono text-gray-700 dark:text-gray-300 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isBestSeller} 
                            onChange={(e) => setIsBestSeller(e.target.checked)}
                            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                          />
                          <span>Best Seller Badge</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-mono text-gray-700 dark:text-gray-300 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isNewArrival} 
                            onChange={(e) => setIsNewArrival(e.target.checked)}
                            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                          />
                          <span>New Arrival Badge</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-mono text-gray-700 dark:text-gray-300 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isFeatured} 
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                          />
                          <span>Featured Product Flag</span>
                        </label>
                      </div>
                    </div>
                              {/* Drag-and-drop assets & Live Url Inputs */}
                    <div className="p-4 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-1.5">
                        <h4 className="text-xs font-black uppercase tracking-wider font-mono text-gray-900 dark:text-white">Multimodal Asset Hub</h4>
                        {(isCompilingImages || isUploadingMain || isUploadingGallery) && <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
                      </div>

                      {firebaseUploadError && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2 text-rose-500">
                          <AlertCircle size={14} className="shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[9px] uppercase font-mono tracking-wider">Firebase Upload Error</p>
                            <p className="text-[10px] leading-relaxed mt-0.5">{firebaseUploadError}</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setFirebaseUploadError(null)} 
                            className="text-rose-500 hover:text-rose-700 font-bold font-mono text-[9px] shrink-0"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}

                      {/* URL Inputs with Previews */}
                      <div className="space-y-4 text-xs">
                        {/* Main Thumbnail Selection & Upload */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase flex justify-between items-center">
                            <span>Main Thumbnail Image</span>
                            <span className="text-[8px] text-amber-500 font-extrabold font-mono uppercase">Direct Firebase Storage</span>
                          </label>

                          {/* File Input Component */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                id="firebase-main-upload-input"
                                className="hidden"
                                disabled={isUploadingMain}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    await uploadImageToFirebase(file, true);
                                  }
                                }}
                              />
                              <label
                                htmlFor="firebase-main-upload-input"
                                className={`cursor-pointer h-full min-h-[38px] flex items-center justify-center gap-2 px-3 py-2 border border-dashed rounded-xl transition-all text-xs font-bold ${
                                  isUploadingMain
                                    ? 'bg-amber-500/5 border-amber-500/30 text-amber-500 cursor-not-allowed'
                                    : 'bg-gray-50/50 dark:bg-black/10 border-gray-250 dark:border-gray-800 hover:border-amber-500/40 text-gray-600 dark:text-gray-300'
                                }`}
                              >
                                {isUploadingMain ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Uploading to Firebase...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Upload Main Image</span>
                                  </>
                                )}
                              </label>
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={uploadedMain}
                                onChange={(e) => setUploadedMain(e.target.value)}
                                placeholder="Or paste image URL directly..."
                                className="flex-1 p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-mono"
                              />
                              {uploadedMain && (
                                <img src={uploadedMain} className="w-8 h-8 rounded-lg object-cover border border-gray-200" alt="Preview" onError={handleImageError} />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Gallery URLs list - supporting up to 10 images */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase flex justify-between items-center">
                            <span>Gallery Images ({uploadedGallery.length}/10)</span>
                            <span className="text-[8px] text-amber-500 font-extrabold font-mono uppercase">Batch Firebase Upload</span>
                          </label>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                id="firebase-gallery-upload-input"
                                className="hidden"
                                disabled={isUploadingGallery}
                                onChange={async (e) => {
                                  const files = e.target.files;
                                  if (files && files.length > 0) {
                                    await uploadGalleryImagesToFirebase(files);
                                  }
                                }}
                              />
                              <label
                                htmlFor="firebase-gallery-upload-input"
                                className={`cursor-pointer h-full min-h-[38px] flex items-center justify-center gap-2 px-3 py-2 border border-dashed rounded-xl transition-all text-xs font-bold ${
                                  isUploadingGallery
                                    ? 'bg-amber-500/5 border-amber-500/30 text-amber-500 cursor-not-allowed'
                                    : 'bg-gray-50/50 dark:bg-black/10 border-gray-250 dark:border-gray-800 hover:border-amber-500/40 text-gray-600 dark:text-gray-300'
                                }`}
                              >
                                {isUploadingGallery ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Uploading Batch...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Upload Gallery Images</span>
                                  </>
                                )}
                              </label>
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={galleryUrlInput}
                                onChange={(e) => setGalleryUrlInput(e.target.value)}
                                placeholder="Or paste gallery URL..."
                                className="flex-1 p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!galleryUrlInput.trim()) return;
                                  if (uploadedGallery.length >= 10) {
                                    alert('You can only have up to 10 gallery images.');
                                    return;
                                  }
                                  setUploadedGallery(prev => [...prev, galleryUrlInput.trim()]);
                                  setGalleryUrlInput('');
                                }}
                                className="px-3 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition shrink-0"
                              >
                                Add URL
                              </button>
                            </div>
                          </div>

                          {/* Gallery Preview list */}
                          {uploadedGallery.length > 0 && (
                            <div className="grid grid-cols-5 gap-1.5 mt-2 bg-gray-50/50 dark:bg-black/25 p-2 rounded-xl border border-gray-100 dark:border-gray-900">
                              {uploadedGallery.map((url, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white">
                                  <img src={url} className="w-full h-full object-cover" alt={`Gallery ${idx}`} onError={handleImageError} />
                                  <button
                                    type="button"
                                    onClick={() => setUploadedGallery(prev => prev.filter((_, i) => i !== idx))}
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Product Video Walkthrough URL */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Walkthrough Video URL (MP4)</label>
                          <input
                            type="text"
                            value={uploadedVideo}
                            onChange={(e) => setUploadedVideo(e.target.value)}
                            placeholder="https://example.com/walkthrough.mp4"
                            className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-mono"
                          />
                          {uploadedVideo && (
                            <div className="mt-1.5 rounded-xl overflow-hidden border border-gray-200 aspect-video max-h-32 bg-black">
                              <video src={uploadedVideo} controls className="w-full h-full object-contain" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-850 pt-3">
                        <span className="text-[9px] text-gray-400 block font-mono uppercase mb-2">Or Use Local File Drag Simulator</span>
                        <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                          {/* Main Image Drop */}
                          <div 
                            onClick={() => handleImageFileDrop('main')}
                            className="border border-dashed border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 p-2 bg-gray-50/50 dark:bg-black/10 rounded-xl cursor-pointer transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5 mx-auto text-gray-400 mb-0.5" />
                            <span className="font-bold block text-gray-900 dark:text-white">Main Mock</span>
                          </div>

                          {/* Gallery Drop */}
                          <div 
                            onClick={() => handleImageFileDrop('gallery')}
                            className="border border-dashed border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 p-2 bg-gray-50/50 dark:bg-black/10 rounded-xl cursor-pointer transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 mx-auto text-gray-400 mb-0.5" />
                            <span className="font-bold block text-gray-900 dark:text-white">Gallery Batch</span>
                          </div>
                        </div>
                      </div>

                      {/* WebP Processing terminal output */}
                      {imageCompressionLogs.length > 0 && (
                        <div className="p-2.5 bg-black/40 dark:bg-black/80 rounded-xl border border-gray-150 dark:border-gray-900 font-mono text-[9px] text-gray-400 space-y-1 max-h-24 overflow-y-auto">
                          <span className="text-amber-500 block">✦ WEB-OPTIMIZER ENGINE DIALOGS:</span>
                          {imageCompressionLogs.map((lg, idx) => (
                            <span key={idx} className="block">{lg}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SEO Block */}
                    <div className="p-4 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-1.5">
                        <h4 className="text-xs font-black uppercase tracking-wider font-mono text-gray-900 dark:text-white">Search Engine Optimization (SEO)</h4>
                        <span className="text-[8px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1.5 py-0.5 rounded font-bold uppercase font-mono">SERP</span>
                      </div>

                      {name ? (
                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 bg-gray-50 dark:bg-black/20 rounded-xl space-y-1 font-mono">
                            <span className="text-[8px] text-gray-400 uppercase font-bold block">Google Snippet Preview</span>
                            <span className="text-[#0066FF] font-bold underline text-[11px] block leading-snug truncate">{seoTitle}</span>
                            <span className="text-emerald-500 text-[10px] block leading-none truncate">https://immortal.com.gh/products/{seoSlug}</span>
                            <span className="text-gray-400 text-[10px] leading-snug block">{seoDesc}</span>
                          </div>

                          <div className="space-y-1 font-mono text-[9px]">
                            <span className="text-gray-400 font-bold block uppercase">Meta Keywords:</span>
                            <span className="text-gray-500 block truncate">{seoKeywords}</span>
                          </div>

                          <div className="space-y-1 font-mono text-[9px] pt-1 border-t border-gray-100 dark:border-gray-850">
                            <span className="text-blue-500 font-bold block uppercase">Schema.org JSON-LD Markup:</span>
                            <pre className="p-2 bg-black/45 dark:bg-black/80 rounded border border-gray-800 text-gray-400 text-[8px] leading-normal overflow-x-auto max-h-32">
{`{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "${name}",
  "brand": {
    "@type": "Brand",
    "name": "${brand}"
  },
  "sku": "${sku}",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "GHS",
    "price": "${sellingPrice}"
  }
}`}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic block">Enter a product name to generate Google SEO previews and sitemap markup formats.</span>
                      )}
                    </div>

                    {/* Pre-flight Checks & Deploy button */}
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
                      <button
                        onClick={handleQuickPublish}
                        disabled={isProcessingApproval || !name}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 disabled:from-amber-800 disabled:to-yellow-800 text-black text-xs font-black rounded-xl transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                      >
                        {isProcessingApproval ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-black" />
                        )}
                        <span>⚡ Quick Instant Publish (Bypass Gateways)</span>
                      </button>

                      <div className="text-center py-1">
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest font-mono">— OR STANDARD COMPLIANCE LIFECYCLE —</span>
                      </div>

                      <button 
                        onClick={handleRunValidationAndDuplicateCheck}
                        className="w-full py-2 bg-gray-900 text-white rounded-xl text-xs font-bold font-mono transition border border-gray-850 hover:bg-black"
                      >
                        Run Pre-Flight Gateways
                      </button>

                      {validationErrors.length > 0 && (
                        <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1">
                          <span className="text-rose-500 text-[9px] font-bold block uppercase">Pre-flight Failures detected:</span>
                          {validationErrors.map((err, idx) => (
                            <span key={idx} className="text-rose-400 text-[9px] block">• {err}</span>
                          ))}
                        </div>
                      )}

                      {duplicateCheckPassed === true && (
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[9px] font-bold uppercase flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>No duplicate listing found in catalog index.</span>
                        </div>
                      )}

                      {duplicateCheckPassed === false && (
                        <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[9px] font-bold uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Duplicate Title detected! Alter title or merge stock ledger.</span>
                        </div>
                      )}

                      <button
                        onClick={handleDeployProduct}
                        disabled={isProcessingApproval || !name}
                        className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-2"
                      >
                        {isProcessingApproval ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        <span>Run Full Compliance Approval & Publish</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 2: BULK UPLOAD SPREADSHEETS */}
              {activeCreationMethod === 'bulk' && (
                <div className="space-y-5">
                  <div className="p-6 border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-black/5 rounded-3xl text-center space-y-3">
                    <FileText className="w-10 h-10 mx-auto text-amber-500 animate-pulse" />
                    <div>
                      <span className="text-xs font-black text-gray-900 dark:text-white block">Drop spreadsheet or import from Google Sheets</span>
                      <span className="text-[10px] text-gray-400 block">Accepted formats: .xlsx, .csv, Google Sheets credentials sync.</span>
                    </div>

                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => setBulkFile('catalog_july_accra.csv')}
                        className="px-3.5 py-1.5 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-gray-800 hover:border-amber-500 text-xs font-bold rounded-lg"
                      >
                        Select Sample spreadsheet.csv
                      </button>
                      <button 
                        onClick={() => setBulkFile('HP_West_Africa_Catalog.xlsx')}
                        className="px-3.5 py-1.5 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-gray-800 hover:border-amber-500 text-xs font-bold rounded-lg"
                      >
                        HP_West_Africa_Catalog.xlsx
                      </button>
                    </div>

                    {bulkFile && (
                      <span className="text-[10px] font-mono text-emerald-500 block">
                        ● Ready to import: <strong className="underline">{bulkFile}</strong>
                      </span>
                    )}
                  </div>

                  {/* Interactive Spreadsheet Preview Grid */}
                  <div className="border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl overflow-hidden">
                    <div className="p-3 bg-gray-50 dark:bg-black/10 border-b border-gray-150 dark:border-gray-800 flex justify-between items-center text-[10px] font-bold uppercase font-mono">
                      <span>Parsed Raw Spreadsheet Rows (Editable Preview)</span>
                      <span className="text-amber-500">2 matching headers detected</span>
                    </div>

                    <div className="overflow-x-auto font-mono text-[11px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-black/20 text-gray-400 uppercase text-[9px] border-b border-gray-150 dark:border-gray-800">
                            <th className="p-3">Product Title</th>
                            <th className="p-3">Brand</th>
                            <th className="p-3">Price (GHS)</th>
                            <th className="p-3">Stock Units</th>
                            <th className="p-3">Image Path</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-900 text-gray-300">
                          {bulkProducts.map((row, index) => (
                            <tr key={row.id} className="hover:bg-gray-50/10">
                              <td className="p-3">
                                <input 
                                  type="text" 
                                  value={row.name}
                                  onChange={(e) => {
                                    const updated = [...bulkProducts];
                                    updated[index].name = e.target.value;
                                    setBulkProducts(updated);
                                  }}
                                  className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-amber-500 w-full"
                                />
                              </td>
                              <td className="p-3">
                                <input 
                                  type="text" 
                                  value={row.brand}
                                  onChange={(e) => {
                                    const updated = [...bulkProducts];
                                    updated[index].brand = e.target.value;
                                    setBulkProducts(updated);
                                  }}
                                  className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-amber-500 w-24"
                                />
                              </td>
                              <td className="p-3">
                                <input 
                                  type="number" 
                                  value={row.priceGHS}
                                  onChange={(e) => {
                                    const updated = [...bulkProducts];
                                    updated[index].priceGHS = Number(e.target.value);
                                    setBulkProducts(updated);
                                  }}
                                  className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-amber-500 w-20 text-amber-500"
                                />
                              </td>
                              <td className="p-3">
                                <input 
                                  type="number" 
                                  value={row.stock}
                                  onChange={(e) => {
                                    const updated = [...bulkProducts];
                                    updated[index].stock = Number(e.target.value);
                                    setBulkProducts(updated);
                                  }}
                                  className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-amber-500 w-16"
                                />
                              </td>
                              <td className="p-3 text-gray-500 block truncate max-w-xs">{row.image.split('/').pop()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <button
                    onClick={handleImportSpreadsheet}
                    disabled={isBulkImporting || !bulkFile}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-800 text-black text-xs font-black rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {isBulkImporting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    <span>Import and Ingest Listings ({bulkProducts.length} items)</span>
                  </button>
                </div>
              )}

              {/* METHOD 3: AI PRODUCT MANAGER (GEMINI) */}
              {activeCreationMethod === 'ai' && (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                    <Sparkles className="w-8 h-8 text-indigo-500 animate-spin" style={{ animationDuration: '4s' }} />
                    <div className="text-center md:text-left text-xs space-y-1">
                      <span className="font-extrabold text-gray-900 dark:text-white block">Gemini-3.5-Flash Multimodal Assistant</span>
                      <p className="text-gray-400">Upload manufacturer brochures, raw PDF catalogs, or HP Omen photos. Gemini automatically detects specifications, writes copy, formats SEO, and optimises images instantly.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Panel: Upload file input */}
                    <div className="p-5 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl space-y-3">
                      <span className="text-[10px] font-bold uppercase font-mono text-gray-400 block">Select AI Source Document Type</span>
                      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
                        {['image', 'brochure', 'pdf', 'excel'].map((dt) => (
                          <button
                            key={dt}
                            onClick={() => {
                              setAiDocType(dt as any);
                              setAiUploadedFile(null);
                            }}
                            className={`py-1.5 rounded-lg border uppercase font-bold ${
                              aiDocType === dt 
                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                                : 'bg-transparent border-gray-150 dark:border-gray-800 text-gray-400'
                            }`}
                          >
                            {dt}
                          </button>
                        ))}
                      </div>

                      {/* Dropzone mockup */}
                      <div 
                        onClick={() => setAiUploadedFile(aiDocType === 'image' ? 'omen_photo_Accra.jpg' : 'HP_Omen_Datasheet_16.pdf')}
                        className="border border-dashed border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 p-6 bg-gray-50/50 dark:bg-black/10 rounded-2xl cursor-pointer text-center space-y-2 transition-colors"
                      >
                        <Upload className="w-8 h-8 mx-auto text-indigo-500 animate-bounce" />
                        <span className="text-xs font-bold text-gray-900 dark:text-white block">Upload document file / photograph</span>
                        <span className="text-[9px] text-gray-400 block">Click to select files. Large assets converted to lightweight WebP.</span>
                      </div>

                      {aiUploadedFile && (
                        <div className="p-2.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-center justify-between text-xs">
                          <span className="font-mono text-indigo-400">{aiUploadedFile} (Ready for analysis)</span>
                          <button 
                            onClick={handleRunGeminiAiImport}
                            disabled={isAiProcessing}
                            className="px-3 py-1 bg-indigo-500 text-white font-bold rounded-lg text-[10px]"
                          >
                            {isAiProcessing ? 'Analyzing...' : 'Run Gemini Optimizer'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right Panel: Live Terminal Logs */}
                    <div className="p-5 border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl flex flex-col justify-between">
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold uppercase font-mono text-gray-400 block">Gemini Sync Terminal Output</span>
                        
                        <div className="p-3 bg-black/50 dark:bg-black/90 rounded-2xl border border-gray-150 dark:border-gray-900 font-mono text-[10px] text-gray-400 space-y-1.5 min-h-[140px] max-h-[180px] overflow-y-auto">
                          {aiLogs.length > 0 ? (
                            aiLogs.map((lg, idx) => (
                              <span key={idx} className="block leading-relaxed">{lg}</span>
                            ))
                          ) : (
                            <span className="text-gray-600 block italic">// Upload a file and run Gemini to populate OCR, spec extraction, description composing, and category mapping.</span>
                          )}
                        </div>
                      </div>

                      {aiGeneratedResult && (
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-800/60 mt-3 space-y-2 text-xs">
                          <span className="text-emerald-500 font-bold font-mono block">✔ PARSED AND STRUCTURED SUCCESSFULLY</span>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-400">
                            <span>Title: {aiGeneratedResult.name}</span>
                            <span>Cost: GHS {aiGeneratedResult.priceGHS.toLocaleString()}</span>
                            <span>Brand: {aiGeneratedResult.brand}</span>
                            <span>Category: {aiGeneratedResult.category}</span>
                          </div>
                          <button
                            onClick={() => {
                              setActiveCreationMethod('manual');
                              setApprovalStep(5); // Advance to preview
                            }}
                            className="w-full py-1.5 bg-indigo-500 text-white font-bold rounded-xl text-[10px] tracking-tight uppercase"
                          >
                            Review full fields in Manual Editor
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 4: SUPPLIER SYNC HUB */}
              {activeCreationMethod === 'sync' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center text-xs">
                    <div className="space-y-1 text-center md:text-left">
                      <span className="font-extrabold text-gray-900 dark:text-white block">Supplier Database Live Gateway API</span>
                      <p className="text-gray-400">Connect directly with certified distribution lines (HP Distributor, Samsung West Africa) for real-time stock Level and pricing cron jobs.</p>
                    </div>

                    <button
                      onClick={handleTriggerSupplierSync}
                      disabled={isSyncingAll}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-black font-black rounded-xl flex items-center gap-1.5"
                    >
                      {isSyncingAll ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Globe className="w-3.5 h-3.5" />
                      )}
                      <span>Synchronize All Suppliers</span>
                    </button>
                  </div>

                  {/* Supplier mapping table */}
                  <div className="border border-gray-150 dark:border-gray-800 bg-white dark:bg-[#121212]/30 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-black/20 text-gray-400 uppercase font-mono text-[10px] border-b border-gray-150 dark:border-gray-800">
                            <th className="p-3">Partner Distributor</th>
                            <th className="p-3">Sync Frequency</th>
                            <th className="p-3">Last Sync Time</th>
                            <th className="p-3">Synced Catalog Count</th>
                            <th className="p-3">Active Pipeline</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-900 text-gray-300">
                          {suppliers.map((sup, index) => (
                            <tr key={sup.id} className="hover:bg-gray-50/10">
                              <td className="p-3 font-bold text-gray-900 dark:text-white">{sup.name}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded text-[10px] font-mono">Daily (04:00 AM GHA)</span>
                              </td>
                              <td className="p-3 text-gray-400 font-mono">{sup.lastSync}</td>
                              <td className="p-3 font-mono font-bold text-amber-500">{sup.itemsSynced} items</td>
                              <td className="p-3">
                                <button
                                  onClick={() => {
                                    const updated = [...suppliers];
                                    updated[index].autoSync = !updated[index].autoSync;
                                    setSuppliers(updated);
                                  }}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition-colors ${
                                    sup.autoSync 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}
                                >
                                  {sup.autoSync ? 'ACTIVE PIPELINE' : 'MUTED SYNC'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sync Logs terminal */}
                  {syncLogs.length > 0 && (
                    <div className="p-3.5 bg-black/60 rounded-2xl border border-gray-150 dark:border-gray-900 font-mono text-[10px] text-gray-400 space-y-1.5 max-h-36 overflow-y-auto">
                      <span className="text-emerald-500 block">✦ DISTRIBUTION INTEGRATION SYNC LOGGER:</span>
                      {syncLogs.map((lg, idx) => (
                        <span key={idx} className="block leading-relaxed">{lg}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
