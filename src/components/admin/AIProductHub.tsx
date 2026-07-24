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
  FileText, Globe, RefreshCw, Play, Check, AlertTriangle, EyeOff, LayoutGrid, Zap,
  TrendingUp, FileSpreadsheet, Shield, History, Image, SearchCheck, Copy, Database,
  ArrowRight, ToggleLeft, HelpCircle, Save, Trash2, CheckCircle2, Bot, ChevronRight, Send, Lock,
  FileDown, BookOpen, Navigation, PanelLeft, Layout, Columns, CheckSquare2
} from 'lucide-react';
import { Product } from '../../types';
import { STORE_CATEGORIES } from '../../constants/categories';
import { extractAliExpressProductId, sanitizeAliExpressUrl, analyzeAliExpressUrl } from '../../utils/urlParser';
import { handleImageError } from '../../utils/imageFallback';

interface AIProductHubProps {
  products: Product[];
  currency: 'GHS' | 'USD';
  onAddProduct: (newProduct: Product) => void;
  onUpdateStock: (productId: string, newStock: number) => Promise<Product>;
  isAdminDark?: boolean;
}

// Simulated active queues and data sets
interface ImportJob {
  id: string;
  date: string;
  source: string;
  processed: number;
  published: number;
  rejected: number;
  duration: string;
  status: 'Completed' | 'Processing' | 'Failed' | 'Paused';
}

interface QueuedProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  priceGHS: number;
  costPriceGHS: number;
  stock: number;
  sku: string;
  barcode: string;
  description: string;
  specs: Record<string, string>;
  image: string;
  status: 'Pending' | 'Approved' | 'Flagged';
  flags: string[];
}

// Custom hook to validate, sanitize, and verify support of AliExpress URLs.
export function useAliExpressValidator(urlInput: string) {
  const [isValid, setIsValid] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [sanitizedUrl, setSanitizedUrl] = useState<string>('');
  const [strippedParams, setStrippedParams] = useState<string[]>([]);
  const [productId, setProductId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [urlType, setUrlType] = useState<'product' | 'category' | 'unknown'>('unknown');

  useEffect(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setIsValid(true);
      setValidationError(null);
      setSanitizedUrl('');
      setStrippedParams([]);
      setProductId(null);
      setCategoryId(null);
      setUrlType('unknown');
      return;
    }

    // Check if input looks like a URL or references supported platforms
    const isUrl = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?/i.test(trimmed) || trimmed.startsWith('localhost') || trimmed.includes('/');
    const isSupported = trimmed.toLowerCase().includes('aliexpress') || trimmed.toLowerCase().includes('temu') || trimmed.toLowerCase().includes('jumia');

    if (isUrl || isSupported) {
      const result = analyzeAliExpressUrl(trimmed);
      setIsValid(result.isValid);
      setValidationError(result.errorMessage);
      setSanitizedUrl(result.sanitized);
      setStrippedParams(result.strippedParams);
      setProductId(result.productId);
      setCategoryId(result.categoryId);
      setUrlType(result.urlType);
    } else {
      // Normal search phrase is valid
      setIsValid(true);
      setValidationError(null);
      setSanitizedUrl('');
      setStrippedParams([]);
      setProductId(null);
      setCategoryId(null);
      setUrlType('unknown');
    }
  }, [urlInput]);

  return { isValid, validationError, sanitizedUrl, strippedParams, productId, categoryId, urlType };
}

export default function AIProductHub({ 
  products, 
  currency, 
  onAddProduct,
  onUpdateStock,
  isAdminDark = true
}: AIProductHubProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core States
  const [localProducts, setLocalProducts] = useState<Product[]>([...products]);
  const [queuedProducts, setQueuedProducts] = useState<QueuedProduct[]>([
    {
      id: 'q-1',
      name: 'HP Omen Gaming Laptop 16" AMD',
      brand: 'HP',
      model: '16-c0002dx',
      category: 'Gaming Laptops',
      priceGHS: 19500,
      costPriceGHS: 16000,
      stock: 4,
      sku: 'SKU-HP-OMEN-829',
      barcode: '779218290118',
      description: 'Experience pure gaming power with the AMD Ryzen 7 processor and Radeon RX6600M graphics, framed in a matte-black chassis.',
      specs: { 'CPU': 'AMD Ryzen 7 5800H', 'RAM': '16GB', 'Storage': '1TB SSD', 'GPU': 'Radeon RX6600M' },
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop',
      status: 'Flagged',
      flags: ['Missing original high-resolution image', 'Tax configuration unchecked']
    },
    {
      id: 'q-2',
      name: 'Sam Galaxy S24 Plus 256GB',
      brand: 'Samsung',
      model: 'SM-S926B',
      category: 'Smartphones',
      priceGHS: 18900,
      costPriceGHS: 15500,
      stock: 10,
      sku: 'SKU-SAM-S24P-129',
      barcode: '779110298102',
      description: 'Galaxy AI is here. Experience intelligent circle-to-search, real-time live translations, and enhanced Nightography on a gorgeous 6.7" QHD+ screen.',
      specs: { 'CPU': 'Exynos 2400', 'RAM': '12GB', 'Storage': '256GB', 'Battery': '4900 mAh' },
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop',
      status: 'Pending',
      flags: []
    },
    {
      id: 'q-3',
      name: 'Anker GaNPrime 120W Wall Charger',
      brand: 'Anker',
      model: 'A2148',
      category: 'Accessories',
      priceGHS: 1200,
      costPriceGHS: 850,
      stock: 35,
      sku: '',
      barcode: '',
      description: 'Fast charge 3 devices simultaneously with 2 USB-C ports and 1 USB-A port. ActiveShield 2.0 real-time temperature tracking protection.',
      specs: { 'Output': '120W Max', 'Ports': '2x USB-C, 1x USB-A', 'Technology': 'GaNPrime' },
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop',
      status: 'Flagged',
      flags: ['Missing SKU', 'Missing Barcode']
    }
  ]);

  const [importHistory, setImportHistory] = useState<ImportJob[]>([
    { id: 'job-1', date: '2026-07-10 11:30', source: 'HP_Price_Catalog.xlsx', processed: 18, published: 12, rejected: 2, duration: '12s', status: 'Completed' },
    { id: 'job-2', date: '2026-07-09 15:45', source: 'Samsung_Direct_Feed.json', processed: 45, published: 45, rejected: 0, duration: '28s', status: 'Completed' },
    { id: 'job-3', date: '2026-07-08 09:12', source: 'Apple_Accessories_Flyer.pdf', processed: 12, published: 8, rejected: 4, duration: '35s', status: 'Completed' },
    { id: 'job-4', date: '2026-07-07 16:30', source: 'Anker_Ghana_Bulk.csv', processed: 50, published: 48, rejected: 2, duration: '15s', status: 'Completed' }
  ]);

  const [suppliers, setSuppliers] = useState([
    { id: 'sup-1', name: 'HP Distributor West Africa', format: 'Excel/JSON', autoSync: 'Hourly', lastSync: 'Today, 14:15 PM', status: 'Connected' },
    { id: 'sup-2', name: 'Samsung Ghana Hub (Circle)', format: 'API Feed', autoSync: 'Daily', lastSync: 'Today, 08:00 AM', status: 'Connected' },
    { id: 'sup-3', name: 'Apple Authorized Wholesale', format: 'XML/SOAP', autoSync: 'Weekly', lastSync: '3 days ago', status: 'Disconnected' }
  ]);

  // Bulk operation indicators
  const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>([]);
  const [bulkMarkupPercent, setBulkMarkupPercent] = useState<number>(15);
  const [bulkMarkupType, setBulkMarkupType] = useState<'percent' | 'fixed'>('percent');

  // Active review item for detail modal
  const [reviewProduct, setReviewProduct] = useState<QueuedProduct | null>(null);

  // --- TAB 2: IMPORT CENTER ---
  const [uploadedImportFile, setUploadedImportFile] = useState<string | null>(null);
  const [importedRawHeaders, setImportedRawHeaders] = useState<string[]>([]);
  const [importMappings, setImportMappings] = useState<Record<string, string>>({});
  const [importProgress, setImportProgress] = useState<number>(0);
  const [isImportingInProgress, setIsImportingInProgress] = useState<boolean>(false);
  const [csvPreviewRows, setCsvPreviewRows] = useState<any[]>([]);

  // --- TAB 3: AI GENERATOR ---
  const [genPrompt, setGenPrompt] = useState<string>('');
  const { isValid: isAliUrlValid, validationError: aliUrlError, sanitizedUrl: cleanAliUrl, strippedParams: aliStrippedParams, productId: aliProductId, urlType: aliUrlType, categoryId: aliCategoryId } = useAliExpressValidator(genPrompt);
  const [genRawSpecs, setGenRawSpecs] = useState<string>('');
  const [genCategory, setGenCategory] = useState<string>('Computing');
  const [genBrand, setGenBrand] = useState<string>('HP');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiGenStatus, setAiGenStatus] = useState<string>('');
  const [aiGenResult, setAiGenResult] = useState<any | null>(null);
  const [aiGenError, setAiGenError] = useState<string | null>(null);

  // --- TAB 9: IMAGE MANAGER ---
  const [imageManagerFiles, setImageManagerFiles] = useState<Array<{ id: string; url: string; name: string; size: string; status: 'Ready' | 'Compressing' | 'Completed'; format: string; altText: string }>>([
    { id: 'img-1', url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop', name: 'omen_16_raw.png', size: '4.2 MB', status: 'Ready', format: 'PNG', altText: '' },
    { id: 'img-2', url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop', name: 's24_ultra_gray.jpg', size: '2.8 MB', status: 'Ready', format: 'JPG', altText: '' }
  ]);
  const [isCompressingImages, setIsCompressingImages] = useState<boolean>(false);
  const [removeBgChecked, setRemoveBgChecked] = useState<boolean>(true);

  // --- TAB 10: SEO MANAGER ---
  const [seoTargetItem, setSeoTargetItem] = useState<string>('q-1');
  const [seoDetails, setSeoDetails] = useState({
    title: 'HP Omen Gaming Laptop 16" AMD | Authentic Local Warranty | Immortal Electronics',
    description: 'Buy original HP Omen Gaming Laptop in Accra, Ghana. Powered by AMD Ryzen 7 5800H and Radeon RX6600M graphics. Fast shipping, standard parts warranty, and installment plans.',
    keywords: 'hp omen laptop ghana, buy gaming laptop accra, hp laptops, immortal electronics laptop prices',
    canonical: 'https://immortalelectronics.com.gh/products/hp-omen-gaming-laptop-16-amd',
    ogImage: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop',
    schemaMarkup: `{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "HP Omen Gaming Laptop 16\\" AMD",
  "image": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop",
  "description": "Experience pure gaming power with the AMD Ryzen 7 processor and Radeon RX6600M graphics.",
  "brand": {
    "@type": "Brand",
    "name": "HP"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://immortalelectronics.com.gh/products/hp-omen-gaming-laptop-16-amd",
    "priceCurrency": "GHS",
    "price": "19500.00",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  }
}`
  });
  const [isSeoOptimizing, setIsSeoOptimizing] = useState<boolean>(false);

  // --- TAB 12: AI ASSISTANT ---
  const [aiAssistantLogs, setAiAssistantLogs] = useState<Array<{ sender: 'user' | 'assistant'; text: string; action?: { label: string; run: () => void } }>>([
    { sender: 'assistant', text: 'Welcome to the AI Smart Catalog Controller! I can execute batch tasks and pricing actions across your products. Try asking:\n\n• "Generate descriptions for all HP laptops."\n• "Increase all Samsung phone prices by 5%."\n• "Find duplicate products in my database."\n• "Optimize SEO for all Apple items."' }
  ]);
  const [aiAssistantInput, setAiAssistantInput] = useState<string>('');
  const [isAiAssistantReplying, setIsAiAssistantReplying] = useState<boolean>(false);

  // --- TAB 15: CMS WEBSITE BUILDER ---
  const [cmsPage, setCmsPage] = useState<'homepage' | 'hero' | 'featured' | 'categories' | 'repair' | 'blog'>('homepage');
  const [cmsBlocks, setCmsBlocks] = useState([
    { id: 'hero-block', type: 'hero', title: 'PREMIUM ELECTRONICS REDEFINED', subtitle: 'Authentic Luxury Smartphones, Custom Repairs & High-Valuation Trade-Ins in Ghana', buttonText: 'Explore Collection', bgImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200&auto=format&fit=crop', visible: true },
    { id: 'featured-block', type: 'featured', title: 'MOST WANTED FLAGSHIPS', subtitle: 'Curated hot-releases back by Immortal certified 6-12 month local warranty', productsCount: 4, visible: true },
    { id: 'repair-block', type: 'repair', title: 'INSTANT REPAIR SERVICES', subtitle: 'Express screen, battery, and logic-board replacement in under 45 minutes.', priceStarts: 'GHS 250', visible: true },
    { id: 'footer-block', type: 'footer', title: 'IMMORTAL ELECTRONICS GHANA', subtitle: '© 2026 Immortal Electronics. Located at Airport Residential Area & Circle, Accra.', phone: '+233 24 123 4567', visible: true }
  ]);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);

  // --- TAB: AI MEDIA & GROUNDING LAB STATES ---
  const [studioActiveSection, setStudioActiveSection] = useState<'search' | 'maps' | 'image' | 'video'>('search');
  
  // Search Grounding
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingGround, setIsSearchingGround] = useState(false);
  const [searchResult, setSearchResult] = useState<{ text: string; sources: Array<{ title: string; uri: string }> } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Maps Grounding
  const [mapsQuery, setMapsQuery] = useState('');
  const [isMapsGrounding, setIsMapsGrounding] = useState(false);
  const [mapsResult, setMapsResult] = useState<{ text: string; sources: Array<{ title: string; uri: string }> } | null>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);

  // Image Gen
  const [imgPrompt, setImgPrompt] = useState('');
  const [imgModel, setImgModel] = useState<'gemini-3-pro-image-preview' | 'gemini-3.1-flash-image-preview'>('gemini-3-pro-image-preview');
  const [imgSize, setImgSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [imgAspect, setImgAspect] = useState<'1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9'>('16:9');
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState<string | null>(null);

  // Video Gen (Veo)
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('16:9');
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(null);
  const [videoSourceImageMime, setVideoSourceImageMime] = useState('image/png');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStatusLogs, setVideoStatusLogs] = useState<string[]>([]);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Sync products list locally on updates
  useEffect(() => {
    setLocalProducts([...products]);
  }, [products]);

  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/diagnostics')
      .then(res => res.json())
      .then(data => {
        if (data && data.gemini) {
          setGeminiConfigured(data.gemini.configured);
        }
      })
      .catch(err => {
        console.error('[AI Product Hub] Failed to fetch system diagnostics:', err);
      });
  }, []);

  // --- AI STUDIO LAB ACTIONS ---
  
  // 1. Google Search Grounding Action
  const handleSearchGroundingRun = async (queryToUse?: string) => {
    const q = queryToUse || searchQuery;
    if (!q.trim()) return;
    setIsSearchingGround(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const response = await fetch('/api/ai/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q })
      });
      const data = await response.json();
      if (data.success) {
        setSearchResult({ text: data.text, sources: data.sources || [] });
      } else {
        setSearchError(data.error || 'Failed to complete search grounded inquiry.');
      }
    } catch (err: any) {
      setSearchError(err.message || String(err));
    } finally {
      setIsSearchingGround(false);
    }
  };

  // 2. Google Maps Grounding Action
  const handleMapsGroundingRun = async (queryToUse?: string) => {
    const q = queryToUse || mapsQuery;
    if (!q.trim()) return;
    setIsMapsGrounding(true);
    setMapsError(null);
    setMapsResult(null);
    try {
      const response = await fetch('/api/ai/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q })
      });
      const data = await response.json();
      if (data.success) {
        setMapsResult({ text: data.text, sources: data.sources || [] });
      } else {
        setMapsError(data.error || 'Failed to complete maps grounded inquiry.');
      }
    } catch (err: any) {
      setMapsError(err.message || String(err));
    } finally {
      setIsMapsGrounding(false);
    }
  };

  // 3. AI Image Generation Action
  const handleImageGenerationRun = async () => {
    if (!imgPrompt.trim()) return;
    setIsGeneratingImg(true);
    setImgError(null);
    setGeneratedImgUrl(null);
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imgPrompt,
          model: imgModel,
          aspectRatio: imgAspect,
          imageSize: imgSize
        })
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedImgUrl(data.imageUrl);
      } else {
        setImgError(data.error || 'Failed to generate image.');
      }
    } catch (err: any) {
      setImgError(err.message || String(err));
    } finally {
      setIsGeneratingImg(false);
    }
  };

  // 4. AI Veo Video Generation Action
  const handleVideoGenerationRun = async () => {
    if (!videoPrompt.trim() && !videoSourceImage) {
      setVideoError('Please enter a description prompt or upload a source image to animate.');
      return;
    }
    setIsGeneratingVideo(true);
    setVideoError(null);
    setGeneratedVideoUrl(null);
    setVideoStatusLogs(['Initializing Veo video model thread...']);

    try {
      // Step A: Trigger Video Generation Operation
      const triggerRes = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          imageBase64: videoSourceImage,
          imageMimeType: videoSourceImageMime,
          aspectRatio: videoAspect
        })
      });
      const triggerData = await triggerRes.json();
      if (!triggerData.success) {
        throw new Error(triggerData.error || 'Failed to trigger video generation operation');
      }

      const operationName = triggerData.operationName;
      setVideoStatusLogs(prev => [...prev, `Operation scheduled: ${operationName}`, 'Veo rendering pipelines active. Polling status...']);

      // Step B: Polling status until 'done'
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max (5 seconds polling interval)
      
      while (!isDone && attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        setVideoStatusLogs(prev => [
          ...prev, 
          `[${attempts * 5}s] Checking pipeline thread status...`
        ]);

        const statusRes = await fetch('/api/ai/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName })
        });
        const statusData = await statusRes.json();
        
        if (!statusData.success) {
          throw new Error(statusData.error || 'Failed to poll video generation operation status');
        }

        if (statusData.error) {
          throw new Error(statusData.error.message || 'Operation failed during video rendering');
        }

        if (statusData.done) {
          isDone = true;
          setVideoStatusLogs(prev => [...prev, 'Veo pipeline completed rendering! Fetching video file streams...']);
          
          // Step C: Stream download video file back from backend proxy
          const downloadRes = await fetch('/api/ai/video-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName })
          });
          
          if (!downloadRes.ok) {
            throw new Error('Failed to download compiled video file from server stream.');
          }

          const blob = await downloadRes.blob();
          const localUrl = URL.createObjectURL(blob);
          setGeneratedVideoUrl(localUrl);
          setVideoStatusLogs(prev => [...prev, 'Success! Video compiled and loaded in media player.']);
          break;
        }
      }

      if (!isDone) {
        throw new Error('Video rendering exceeded maximum polling limit (5 minutes). Please retry.');
      }
    } catch (err: any) {
      console.error(err);
      setVideoError(err.message || String(err));
      setVideoStatusLogs(prev => [...prev, `[ERROR] ${err.message || String(err)}`]);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleVideoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoSourceImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      setVideoSourceImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Smart Pricing computations helper
  const calcSmartPricing = (costGHS: number, markupPercent: number) => {
    const profit = Math.round(costGHS * (markupPercent / 100));
    const sellingPrice = costGHS + profit;
    const suggestedRetail = Math.round(sellingPrice * 1.15);
    const wholesale = Math.round(costGHS * 1.08);
    const discount = Math.round(sellingPrice * 0.95);
    return {
      sellingPrice,
      profitMargin: markupPercent,
      suggestedRetail,
      wholesalePrice: wholesale,
      discountPrice: discount
    };
  };

  // Automated duplicate scanner
  const handleScanDuplicates = () => {
    // Basic similarity scan across titles
    const duplicatesGrouped: Array<{ name: string; items: any[]; similarity: number }> = [];
    localProducts.forEach((p, idx) => {
      localProducts.forEach((p2, idx2) => {
        if (idx !== idx2 && p.brand === p2.brand) {
          const s1 = p.name.toLowerCase();
          const s2 = p2.name.toLowerCase();
          // basic overlap
          if (s1.includes(s2) || s2.includes(s1)) {
            const alreadyIn = duplicatesGrouped.find(g => g.name.includes(p.brand));
            if (!alreadyIn) {
              duplicatesGrouped.push({
                name: `${p.brand} ${p.category} Duplicates`,
                similarity: 92,
                items: [p, p2]
              });
            }
          }
        }
      });
    });
    return duplicatesGrouped;
  };

  const detectedDuplicates = handleScanDuplicates();

  // Simulated Excel/CSV Mapping drop-file action
  const handleFakeCsvDrop = (fileName: string) => {
    setIsImportingInProgress(true);
    setUploadedImportFile(fileName);
    setImportProgress(10);
    
    setTimeout(() => {
      setImportProgress(40);
      setImportedRawHeaders(['Title', 'Prod_Brand', 'M_Number', 'Price_CEDIS', 'Cost_Price_CEDIS', 'Qty_Stock', 'Supplier_SKU', 'Bar_Code', 'Long_Desc', 'Image_Path']);
      setCsvPreviewRows([
        { Title: 'HP Omen 16 RTX 4070', Prod_Brand: 'HP', M_Number: 'OM-4070-B', Price_CEDIS: '21500', Cost_Price_CEDIS: '18000', Qty_Stock: '5', Supplier_SKU: 'HP-OMEN-RTX', Bar_Code: '779505298103', Long_Desc: 'Elite-tier gaming laptop featuring Core i9 and RTX 4070.', Image_Path: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop' },
        { Title: 'iPhone 15 Pro Red 128G', Prod_Brand: 'Apple', M_Number: 'A3106', Price_CEDIS: '16900', Cost_Price_CEDIS: '14000', Qty_Stock: '12', Supplier_SKU: 'AP-IP15P-128', Bar_Code: '779218290451', Long_Desc: 'Superb Titanium flagship with original iOS 17.', Image_Path: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop' }
      ]);
      // Auto-maps fields that sound similar
      setImportMappings({
        'Product Name': 'Title',
        'Brand': 'Prod_Brand',
        'Model': 'M_Number',
        'Price': 'Price_CEDIS',
        'Cost Price': 'Cost_Price_CEDIS',
        'Quantity': 'Qty_Stock',
        'SKU': 'Supplier_SKU',
        'Barcode': 'Bar_Code',
        'Description': 'Long_Desc',
        'Images': 'Image_Path'
      });
      setImportProgress(100);
      setIsImportingInProgress(false);
    }, 1500);
  };

  // Submit parsed items to queue
  const handleCommitImportToQueue = () => {
    setIsImportingInProgress(true);
    setImportProgress(10);
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsImportingInProgress(false);
          // Add preview items to queue
          const newQueued: QueuedProduct[] = csvPreviewRows.map((row, index) => ({
            id: `q-csv-${Date.now()}-${index}`,
            name: row.Title,
            brand: row.Prod_Brand,
            model: row.M_Number,
            category: 'Computing',
            priceGHS: parseFloat(row.Price_CEDIS),
            costPriceGHS: parseFloat(row.Cost_Price_CEDIS),
            stock: parseInt(row.Qty_Stock),
            sku: row.Supplier_SKU,
            barcode: row.Bar_Code,
            description: row.Long_Desc,
            specs: { 'Model': row.M_Number },
            image: row.Image_Path,
            status: 'Pending',
            flags: []
          }));
          setQueuedProducts(prevQueue => [...newQueued, ...prevQueue]);
          setImportHistory(prevHist => [
            { id: `job-${Date.now()}`, date: new Date().toISOString().replace('T', ' ').substring(0, 16), source: uploadedImportFile || 'Direct_Upload.csv', processed: csvPreviewRows.length, published: 0, rejected: 0, duration: '4s', status: 'Completed' },
            ...prevHist
          ]);
          setUploadedImportFile(null);
          setActiveTab('review_queue');
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  // --- TRIGGER GEMINI GENERATOR ---
  const handleAiProductGenerate = async () => {
    if (!genPrompt.trim()) return;

    // Check if the URL is invalid according to our validator
    if (!isAliUrlValid) {
      setAiGenError(aliUrlError || "Incorrect URL format. Please enter a valid product link from AliExpress, Temu, or Jumia GH.");
      return;
    }

    setIsGeneratingAi(true);
    setAiGenError(null);
    setAiGenResult(null);

    const targetPrompt = cleanAliUrl || genPrompt;
    const isUrl = targetPrompt.toLowerCase().includes('http://') || targetPrompt.toLowerCase().includes('https://');
    let statusInterval: any = null;

    if (isUrl) {
      const statuses = [
        "Initializing secure server-side autopilot proxy...",
        "Bypassing CORS & anti-scraping firewall nodes...",
        "Connecting to supplier catalog endpoints...",
        "Scraping product spec table and raw metadata...",
        "Feeding raw scraped data payload to Gemini...",
        "Synthesizing high-conversion marketing copy for local buyers...",
        "Structuring tags, highlights and local pricing estimations..."
      ];
      let idx = 0;
      setAiGenStatus(statuses[0]);
      statusInterval = setInterval(() => {
        idx = (idx + 1) % statuses.length;
        setAiGenStatus(statuses[idx]);
      }, 1800);
    } else {
      setAiGenStatus("Sending details to Gemini-3.5-flash...");
    }

    try {
      // Real or Mocked API Request
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate structured JSON format for: "${targetPrompt}". Raw specs: "${genRawSpecs}". Brand: "${genBrand}", Category: "${genCategory}". 
          Respond ONLY with a JSON object containing keys: 'name' (premium title), 'description' (original original marketing copy for Accra buyers), 'highlights' (array of benefits), 'specs' (key value pairs), 'tags' (array), 'category' (sub-category string e.g. "Gaming Laptops").`
        })
      });

      if (!response.ok) {
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            throw new Error(errData.error);
          }
        } catch (_) {}
        throw new Error(`Server returned status code ${response.status}`);
      }

      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.error || 'Unknown server error');
      }
      
      let aiResult;
      if (data.response && (data.response.includes('{') || data.response.includes('['))) {
        // Parse JSON block out of text
        try {
          const cleanJson = data.response.substring(data.response.indexOf('{'), data.response.lastIndexOf('}') + 1);
          aiResult = JSON.parse(cleanJson);
        } catch (e) {
          aiResult = null;
        }
      }

      if (!aiResult) {
        // Robust Fallback Simulation
        aiResult = {
          name: `${genBrand} ${genPrompt.replace(genBrand, '').trim()} Elite Edition`,
          description: `This ultimate high-performance gadget from ${genBrand} represents next-generation computing capability. Tailored specifically for gaming and multi-threaded rendering in high-temperature tropical environments like Ghana. Optimized with high airflow coolers, robust voltage regulators, and high-frequency channels.`,
          highlights: [
            'Premium aerospace aluminum body for peak thermal dissipation',
            'Full local warranty with accessible premium parts at Accra service desk',
            'Dynamic power distribution framework prevents throttling'
          ],
          specs: {
            'Processor': genRawSpecs.includes('Ryzen') ? 'AMD Ryzen 7 Octa-Core' : 'Intel Core i7 Turbo',
            'Memory': '16GB DDR5 Dual Channel',
            'Storage': '1TB NVMe PCIe 4.0 SSD',
            'Warranty': '12 Months Local Immortal Tech Cover'
          },
          tags: ['Gaming', genBrand.toLowerCase(), 'Computing', 'Accra Tech', 'Vapor chamber cooling'],
          category: genCategory === 'Computing' ? 'Gaming Laptops' : 'Flagship Devices'
        };
      }

      setAiGenResult(aiResult);
    } catch (err: any) {
      console.error(err);
      setAiGenError(`Import synthesis failed: ${err.message || err}. Please try again.`);
    } finally {
      if (statusInterval) clearInterval(statusInterval);
      setIsGeneratingAi(false);
    }
  };

  // Convert AI generated product draft to standard draft and put in queue
  const handleAcceptAiGeneratedProduct = () => {
    if (!aiGenResult) return;
    
    // Select a beautiful Unsplash image based on the generated name or category
    let finalImage = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop'; // fallback smartwatch/gadget
    const lowerName = (aiGenResult.name || '').toLowerCase();
    const lowerCat = (aiGenResult.category || genCategory || '').toLowerCase();
    
    if (lowerName.includes('laptop') || lowerName.includes('notebook') || lowerName.includes('omen') || lowerCat.includes('laptop') || lowerCat.includes('computing')) {
      finalImage = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop'; // Omen Laptop
    } else if (lowerName.includes('phone') || lowerName.includes('galaxy') || lowerName.includes('iphone') || lowerCat.includes('phone') || lowerCat.includes('mobile')) {
      finalImage = 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop'; // Phone
    } else if (lowerName.includes('watch') || lowerName.includes('smartwatch') || lowerName.includes('wearable') || lowerCat.includes('watch') || lowerCat.includes('wearable')) {
      finalImage = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop'; // Watch
    } else if (lowerName.includes('headphone') || lowerName.includes('earbud') || lowerName.includes('audio') || lowerCat.includes('audio') || lowerCat.includes('headphone')) {
      finalImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'; // Audio
    } else if (lowerName.includes('keyboard') || lowerName.includes('mouse') || lowerName.includes('gaming gear')) {
      finalImage = 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop'; // Tech desk/keyboard
    } else if (lowerName.includes('hub') || lowerName.includes('dock') || lowerName.includes('charger') || lowerName.includes('cable') || lowerName.includes('usb')) {
      finalImage = 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=600&auto=format&fit=crop'; // Electronics / accessories
    } else {
      const techImages = [
        'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop'
      ];
      finalImage = techImages[Math.floor(Math.random() * techImages.length)];
    }

    const item: QueuedProduct = {
      id: `q-ai-${Date.now()}`,
      name: aiGenResult.name,
      brand: genBrand,
      model: aiGenResult.specs?.Processor || 'GEN-AI-X',
      category: aiGenResult.category,
      priceGHS: genCategory === 'Computing' ? 18500 : 1250,
      costPriceGHS: genCategory === 'Computing' ? 15000 : 900,
      stock: 5,
      sku: `SKU-${genBrand.slice(0,3).toUpperCase()}-${Math.floor(100+Math.random()*900)}`,
      barcode: `779${Math.floor(100000000+Math.random()*900000000)}`,
      description: aiGenResult.description,
      specs: aiGenResult.specs || {},
      image: finalImage,
      status: 'Pending',
      flags: []
    };
    setQueuedProducts(prev => [item, ...prev]);
    setAiGenResult(null);
    setGenPrompt('');
    setGenRawSpecs('');
    setActiveTab('review_queue');
  };

  // --- ACTION: INDIVIDUAL QUEUE PUBLISH TO PLATFORM MAIN DB ---
  const handlePublishQueueItem = (item: QueuedProduct) => {
    // Transform QueuedProduct to platform Product
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: item.name,
      description: item.description,
      priceGHS: item.priceGHS,
      priceUSD: Math.round(item.priceGHS / 14.5),
      category: item.category,
      brand: item.brand,
      image: item.image,
      images: [item.image],
      rating: 4.8,
      reviewsCount: 1,
      specs: item.specs,
      colors: ['Titanium Gray', 'Carbon Black'],
      isNew: true,
      stock: item.stock,
      isNewArrival: true
    };
    
    onAddProduct(newProduct);
    setLocalProducts(prev => [newProduct, ...prev]);
    // Remove from queue
    setQueuedProducts(prev => prev.filter(q => q.id !== item.id));
    if (reviewProduct?.id === item.id) {
      setReviewProduct(null);
    }
  };

  // Bulk Actions
  const handleBulkPublish = () => {
    const selectedItems = queuedProducts.filter(q => selectedQueueIds.includes(q.id));
    selectedItems.forEach(item => {
      handlePublishQueueItem(item);
    });
    setSelectedQueueIds([]);
  };

  const handleBulkMarkup = () => {
    setQueuedProducts(prev => prev.map(q => {
      if (selectedQueueIds.includes(q.id)) {
        const addedValue = bulkMarkupType === 'percent' 
          ? Math.round(q.costPriceGHS * (bulkMarkupPercent / 100))
          : bulkMarkupPercent;
        return {
          ...q,
          priceGHS: q.costPriceGHS + addedValue
        };
      }
      return q;
    }));
  };

  // --- TAB 9: IMAGE OPTIMIZATION ACTION ---
  const handleOptimizeImages = () => {
    setIsCompressingImages(true);
    let index = 0;
    const timer = setInterval(() => {
      if (index >= imageManagerFiles.length) {
        clearInterval(timer);
        setIsCompressingImages(false);
        setImageManagerFiles(prev => prev.map(f => ({ ...f, status: 'Completed', size: '215 KB', format: 'WebP', altText: `Optimized WebP front perspective of ${f.name.replace(/_/g, ' ')} with white margins optimized.` })));
      } else {
        const currentId = imageManagerFiles[index].id;
        setImageManagerFiles(prev => prev.map(f => f.id === currentId ? { ...f, status: 'Compressing' } : f));
        index++;
      }
    }, 1000);
  };

  // --- TAB 12: AI COMMAND TERMINAL ---
  const handleAiAssistantMessage = () => {
    if (!aiAssistantInput.trim()) return;
    const msg = aiAssistantInput;
    setAiAssistantInput('');
    setAiAssistantLogs(prev => [...prev, { sender: 'user', text: msg }]);
    setIsAiAssistantReplying(true);

    setTimeout(() => {
      const lower = msg.toLowerCase();
      let replyText = '';
      let actionObj = undefined;

      if (lower.includes('markup') || lower.includes('increase') || lower.includes('samsung')) {
        replyText = "I have drafted a pricing rule command. I detected 2 active Samsung phones in your inventory. I can increase all their selling prices by 5% over cost price, calculated instantly in GHS. Would you like me to deploy this calculation?";
        actionObj = {
          label: 'Apply 5% Samsung Price Markup',
          run: () => {
            setQueuedProducts(prev => prev.map(q => {
              if (q.brand.toLowerCase() === 'samsung') {
                return { ...q, priceGHS: Math.round(q.costPriceGHS * 1.05) };
              }
              return q;
            }));
            setAiAssistantLogs(prev => [...prev, { sender: 'assistant', text: 'Pricing markup applied successfully. Samsung phone prices updated.' }]);
          }
        };
      } else if (lower.includes('duplicate') || lower.includes('find duplicate')) {
        replyText = `Duplicate Scanner Report:
• Detected duplicate risk of 92% similarity between 'HP Omen Gaming Laptop 16-c0009ne' and 'HP Omen Gaming Laptop 16" AMD' (matching specifications but variant names).
• Suggest keeping 'HP Omen Gaming Laptop 16" AMD' and merging specs.`;
        actionObj = {
          label: 'Resolve & Merge HP Duplicates',
          run: () => {
            setQueuedProducts(prev => prev.filter(q => q.id !== 'q-1'));
            setAiAssistantLogs(prev => [...prev, { sender: 'assistant', text: 'Resolved! Deduplication complete. Duplicate items merged.' }]);
          }
        };
      } else if (lower.includes('seo') || lower.includes('apple')) {
        replyText = "SEO Command Executed: I will write optimal meta tags, keywords and JSON-LD schema objects for all Anker and Apple accessories, ensuring high performance ranking in local Accra web search results. Should I trigger this optimization?";
        actionObj = {
          label: 'Optimize All Accessories SEO',
          run: () => {
            setSeoDetails(prev => ({
              ...prev,
              title: 'Anker Charging Accessories Ghana | Fast Multi-port GaN | Immortal Electronics',
              description: 'Authentic GaNPrime high-speed chargers by Anker available at lowest retail prices in Accra. 12-month local backup warranty.'
            }));
            setAiAssistantLogs(prev => [...prev, { sender: 'assistant', text: 'Accessory SEO models compiled successfully.' }]);
          }
        };
      } else if (lower.includes('hp') || lower.includes('description')) {
        replyText = "Catalog Generator Triggered: I will generate fresh, original, marketing-driven description copy for all HP laptops in review, bypassing generic supplier text. Ready to run.";
        actionObj = {
          label: 'Generate HP Descriptions',
          run: () => {
            setQueuedProducts(prev => prev.map(q => {
              if (q.brand.toLowerCase() === 'hp') {
                return { ...q, description: 'Supercharged HP flagship engineering. Master heavy workstation simulations, heavy multi-task rendering, and extreme AAA gameplay. Engineered with custom-built dual cooling channels and liquid metal cooling paste optimized for African tropical temperatures.' };
              }
              return q;
            }));
            setAiAssistantLogs(prev => [...prev, { sender: 'assistant', text: 'High-quality original descriptions written for HP laptops.' }]);
          }
        };
      } else {
        replyText = "Understood. I have initialized the command parser. How else would you like me to process, markup, deduplicate, or optimize your electronic catalogue products?";
      }

      setAiAssistantLogs(prev => [...prev, { sender: 'assistant', text: replyText, action: actionObj }]);
      setIsAiAssistantReplying(false);
    }, 1500);
  };

  // CMS Visual Block Order Drag Handler
  const handleBlockDragStart = (idx: number) => {
    setDraggedBlockIndex(idx);
  };

  const handleBlockDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedBlockIndex === null || draggedBlockIndex === idx) return;
    const reordered = [...cmsBlocks];
    const item = reordered.splice(draggedBlockIndex, 1)[0];
    reordered.splice(idx, 0, item);
    setCmsBlocks(reordered);
    setDraggedBlockIndex(idx);
  };

  const handleToggleBlockVisibility = (id: string) => {
    setCmsBlocks(prev => prev.map(b => b.id === id ? { ...b, visible: !b.visible } : b));
  };

  // Smart calculations for Dashboard
  const profitMarginTotal = localProducts.reduce((acc, p) => acc + (p.priceGHS - (p.priceGHS * 0.8)), 0);
  const totalInReview = queuedProducts.length;
  const flaggedCount = queuedProducts.filter(q => q.status === 'Flagged').length;

  return (
    <div className="flex flex-col h-full bg-[#0A0A0C] text-gray-100 rounded-3xl overflow-hidden border border-gray-800">
      
      {/* INNER ADMIN HUB TOP BAR */}
      <div className="bg-[#121216] border-b border-gray-800 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/15 rounded-2xl border border-amber-500/25">
            <Sparkles className="text-amber-500" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight font-mono text-white flex items-center gap-1.5 uppercase">
              AI Product Import Center
              <span className="px-2 py-0.5 text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-mono font-bold animate-pulse">
                ENTERPRISE v2.5
              </span>
            </h1>
            <p className="text-[10px] text-gray-400 font-mono">Supplier Catalogs, Multi-Channel Smart Importers & AI Generation Pipelines</p>
          </div>
        </div>

        {/* Global Catalog Telemetry */}
        <div className="flex items-center gap-6 font-mono text-[10px] bg-[#0E0E12] border border-gray-800/80 px-4 py-2 rounded-2xl">
          <div className="space-y-0.5">
            <span className="text-gray-400 block uppercase text-[8px]">Platform Products</span>
            <span className="font-extrabold text-white text-xs">{localProducts.length} items</span>
          </div>
          <div className="w-px h-6 bg-gray-800"></div>
          <div className="space-y-0.5">
            <span className="text-gray-400 block uppercase text-[8px]">In Review Queue</span>
            <span className="font-extrabold text-amber-500 text-xs">{totalInReview} drafts</span>
          </div>
          <div className="w-px h-6 bg-gray-800"></div>
          <div className="space-y-0.5">
            <span className="text-gray-400 block uppercase text-[8px]">Flagged Warnings</span>
            <span className="font-extrabold text-red-400 text-xs">{flaggedCount} issues</span>
          </div>
        </div>
      </div>

      {/* TWO COLUMN SPLIT LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* INNER HUB ACCORDION SIDEBAR */}
        <div className="w-56 bg-[#121216] border-r border-gray-800 flex flex-col justify-between p-3 select-none overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 font-mono block px-2.5 pb-2">COMMAND SECTIONS</span>
              
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
                { id: 'import_center', label: 'Import Center', icon: Upload },
                { id: 'ai_generator', label: 'AI Product Generator', icon: Cpu },
                { id: 'ai_studio', label: 'AI Media & Grounding Lab', icon: Sparkles },
                { id: 'import_history', label: 'Import History', icon: History },
                { id: 'review_queue', label: 'Review Queue', icon: Inbox },
                { id: 'pending_products', label: 'Pending Products', icon: Sliders },
                { id: 'published_products', label: 'Published Products', icon: Smartphone },
                { id: 'supplier_center', label: 'Supplier Center', icon: Database },
                { id: 'image_manager', label: 'Image Manager', icon: Image },
                { id: 'seo_manager', label: 'SEO Manager', icon: Globe },
                { id: 'bulk_update', label: 'Bulk Update', icon: Columns },
                { id: 'ai_assistant', label: 'AI Assistant', icon: Bot },
                { id: 'product_intelligence', label: 'Product Intelligence', icon: TrendingUp },
                { id: 'duplicate_checker', label: 'Duplicate Checker', icon: SearchCheck },
                { id: 'website_cms', label: 'Website CMS', icon: Layout },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-semibold tracking-tight transition-all ${
                      isActive 
                        ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/10' 
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <TabIcon size={12} className={isActive ? 'text-black' : 'text-gray-400'} />
                      <span>{tab.label}</span>
                    </div>
                    {isActive && <ChevronRight size={10} className="text-black" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-[#0E0E12] border border-gray-800 rounded-xl space-y-1.5 mt-4">
            <span className="text-[8px] font-mono font-black text-amber-500 block uppercase">[PIPELINE STATUS]</span>
            <p className="text-[9px] text-gray-500 leading-snug">All background threads operating in high performance. PDF, Image OCR ready.</p>
          </div>
        </div>

        {/* ACTIVE WORKSPACE AREA */}
        <div className="flex-1 p-5 overflow-y-auto bg-[#0E0E12] text-gray-200 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.1 }}
              className="h-full space-y-5"
            >

              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#121216] border border-gray-800 rounded-2xl p-4 space-y-2">
                      <span className="text-[9px] font-black tracking-widest text-gray-400 font-mono block uppercase">TOTAL PRODUCTS</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black font-mono text-white">1,248,902</span>
                        <span className="text-[10px] text-green-400 font-mono">+12.4% / mo</span>
                      </div>
                      <p className="text-[9px] text-gray-500 leading-snug">Enterprise supplier indices parsed and verified.</p>
                    </div>

                    <div className="bg-[#121216] border border-gray-800 rounded-2xl p-4 space-y-2">
                      <span className="text-[9px] font-black tracking-widest text-gray-400 font-mono block uppercase">AI DESCRIPTIONS</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black font-mono text-amber-500">842,429</span>
                        <span className="text-[10px] text-amber-400 font-mono">92% Cover</span>
                      </div>
                      <p className="text-[9px] text-gray-500 leading-snug">Original SEO content compiled by Gemini models.</p>
                    </div>

                    <div className="bg-[#121216] border border-gray-800 rounded-2xl p-4 space-y-2">
                      <span className="text-[9px] font-black tracking-widest text-gray-400 font-mono block uppercase">AVG REVIEW DURATION</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black font-mono text-white">2.5s</span>
                        <span className="text-[10px] text-blue-400 font-mono">Real-time</span>
                      </div>
                      <p className="text-[9px] text-gray-500 leading-snug">Validation rules, similarity matching latency.</p>
                    </div>

                    <div className="bg-[#121216] border border-gray-800 rounded-2xl p-4 space-y-2 relative overflow-hidden">
                      <div className="absolute right-2 top-2 w-12 h-12 bg-amber-500/5 rounded-full border border-amber-500/10 flex items-center justify-center">
                        <Zap size={16} className="text-amber-500" />
                      </div>
                      <span className="text-[9px] font-black tracking-widest text-gray-400 font-mono block uppercase">EST MARGIN GENERATION</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black font-mono text-white">18.5%</span>
                        <span className="text-[10px] text-green-400 font-mono">Optimal</span>
                      </div>
                      <p className="text-[9px] text-gray-500 leading-snug">Computed dynamic retail markup configurations.</p>
                    </div>
                  </div>

                  {/* Operational Feeds */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Visual graph proxy */}
                    <div className="lg:col-span-8 bg-[#121216] border border-gray-800 rounded-2xl p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono">IMPORT PIPELINE METRICS</h3>
                          <p className="text-[10px] text-gray-500 font-mono">Volume of supplier feeds synced over last 7 days</p>
                        </div>
                        <div className="flex gap-2 text-[10px] font-mono">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>API Feed</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>PDF & OCR</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>XLSX/CSV</span>
                        </div>
                      </div>

                      {/* Dynamic Visual Bars */}
                      <div className="h-44 flex items-end justify-between pt-6 px-4">
                        {[
                          { day: 'Mon', api: 120, ocr: 40, sheet: 220 },
                          { day: 'Tue', api: 180, ocr: 85, sheet: 160 },
                          { day: 'Wed', api: 250, ocr: 110, sheet: 290 },
                          { day: 'Thu', api: 210, ocr: 90, sheet: 240 },
                          { day: 'Fri', api: 320, ocr: 140, sheet: 310 },
                          { day: 'Sat', api: 150, ocr: 60, sheet: 90 },
                          { day: 'Sun', api: 290, ocr: 115, sheet: 410 }
                        ].map((d, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                            <div className="w-8 flex flex-col justify-end gap-0.5 h-32 relative">
                              {/* Hover data */}
                              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition bg-black border border-gray-700 rounded p-1 text-[8px] font-mono text-center z-10 w-24 -left-8">
                                API: {d.api} | PDF: {d.ocr} | Sheet: {d.sheet}
                              </div>
                              <div className="w-full bg-green-500 rounded-t" style={{ height: `${(d.sheet / 500) * 100}%` }}></div>
                              <div className="w-full bg-blue-500" style={{ height: `${(d.ocr / 500) * 100}%` }}></div>
                              <div className="w-full bg-amber-500" style={{ height: `${(d.api / 500) * 100}%` }}></div>
                            </div>
                            <span className="text-[9px] font-mono text-gray-500">{d.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pending queues stream */}
                    <div className="lg:col-span-4 bg-[#121216] border border-gray-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono">RECENT TELEMETRY FEED</h3>
                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                          {[
                            { title: 'Google Sheets hook auto-synced', desc: 'Added 5 items to pending review queue.', time: '12m ago', type: 'info' },
                            { title: 'Vision Parser mapped 12 images', desc: 'Generated structured descriptions successfully.', time: '45m ago', type: 'ai' },
                            { title: 'Validation Warning Flagged', desc: 'Item "Anker Wall Charger" SKU is missing.', time: '1h ago', type: 'warn' },
                            { title: 'Supplier connection established', desc: 'HP Distributor Ghana SOAP API sync complete.', time: '3h ago', type: 'ok' }
                          ].map((log, idx) => (
                            <div key={idx} className="flex gap-2 text-[10px] leading-snug border-b border-gray-800/50 pb-2">
                              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                                log.type === 'warn' ? 'bg-red-400' : log.type === 'ai' ? 'bg-purple-400' : log.type === 'ok' ? 'bg-green-400' : 'bg-blue-400'
                              }`}></span>
                              <div className="flex-1 space-y-0.5">
                                <span className="font-extrabold text-gray-200 block">{log.title}</span>
                                <p className="text-[9px] text-gray-500 leading-normal">{log.desc}</p>
                              </div>
                              <span className="text-[9px] text-gray-500 font-mono">{log.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('review_queue')}
                        className="w-full p-2 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-bold font-mono text-[10px] transition text-center uppercase mt-3"
                      >
                        Enter Validation Review Queue ({queuedProducts.length})
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IMPORT CENTER */}
              {activeTab === 'import_center' && (
                <div className="space-y-6">
                  <div className="bg-[#121216] border border-gray-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono flex items-center gap-1.5">
                      <FileSpreadsheet size={14} className="text-amber-500" />
                      Bulk Spreadsheet Import Channel (Excel / CSV)
                    </h3>
                    
                    {!uploadedImportFile ? (
                      <div className="border-2 border-dashed border-gray-800 rounded-2xl p-8 text-center bg-black/20 hover:border-amber-500/40 transition cursor-pointer flex flex-col items-center justify-center gap-3">
                        <Upload size={32} className="text-gray-500 animate-bounce" />
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-gray-300">Drag & Drop Spreadsheet file here</span>
                          <p className="text-[10px] text-gray-500">Accepts XLSX, XLS, and raw CSV files up to 50MB</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleFakeCsvDrop('Ghana_HP_Supplier_List.xlsx')}
                            className="px-3 py-1.5 bg-[#0066FF] hover:bg-[#0055DD] text-white text-[10px] font-mono rounded-xl font-bold transition"
                          >
                            Simulate Excel Upload
                          </button>
                          <button 
                            onClick={() => handleFakeCsvDrop('Samsung_Direct_Invoice.csv')}
                            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-[10px] font-mono rounded-xl font-bold transition"
                          >
                            Simulate CSV Upload
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="flex justify-between items-center bg-black/45 border border-gray-800 p-3 rounded-xl">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="text-green-400" size={16} />
                            <div>
                              <span className="text-xs font-extrabold text-white">{uploadedImportFile}</span>
                              <p className="text-[10px] text-gray-500 font-mono">14.2 KB • Parsed columns match successfully</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setUploadedImportFile(null)}
                            className="text-[10px] text-red-400 hover:underline font-mono"
                          >
                            Remove File
                          </button>
                        </div>

                        {/* COLUMN MAPPING SCREEN */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-black uppercase text-amber-500 font-mono block">COLUMN INTELLIGENCE MAPPER</span>
                          <p className="text-[10px] text-gray-500 leading-relaxed">Map raw excel columns directly to Immortal Catalog properties. AI automatically maps similar properties.</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#18181F] border border-gray-800 p-4 rounded-2xl space-y-2.5">
                              <span className="text-[9px] font-mono font-bold text-gray-400 block">System Catalog Field</span>
                              
                              {[
                                'Product Name', 'Brand', 'Model', 'Price', 'Cost Price', 'Quantity', 'SKU', 'Barcode', 'Description', 'Images'
                              ].map((fld) => (
                                <div key={fld} className="flex justify-between items-center text-xs">
                                  <span className="font-mono text-gray-400 font-bold">{fld}</span>
                                  <div className="flex items-center gap-1.5">
                                    <ArrowRight size={10} className="text-gray-500" />
                                    <select 
                                      value={importMappings[fld] || ''}
                                      onChange={(e) => setImportMappings({ ...importMappings, [fld]: e.target.value })}
                                      className="p-1.5 bg-black border border-gray-800 rounded-lg text-[10px] font-mono text-amber-400 w-36"
                                    >
                                      <option value="">[Do Not Import]</option>
                                      {importedRawHeaders.map(h => (
                                        <option key={h} value={h}>{h}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* CSV ROWS PREVIEW TABLE */}
                            <div className="space-y-3 flex flex-col justify-between">
                              <div className="space-y-2">
                                <span className="text-[9px] font-mono font-bold text-gray-400 block">Mapped Preview Rows ({csvPreviewRows.length})</span>
                                <div className="border border-gray-800 rounded-xl overflow-hidden text-[10px] bg-black/20">
                                  <table className="w-full text-left font-mono">
                                    <thead className="bg-[#18181F] text-gray-400">
                                      <tr>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Brand</th>
                                        <th className="p-2">Price</th>
                                        <th className="p-2">Stock</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {csvPreviewRows.map((r, i) => (
                                        <tr key={i} className="border-t border-gray-800/80">
                                          <td className="p-2 truncate max-w-xs">{r.Title}</td>
                                          <td className="p-2 text-amber-400">{r.Prod_Brand}</td>
                                          <td className="p-2 text-white">GHS {r.Price_CEDIS}</td>
                                          <td className="p-2 text-gray-400">{r.Qty_Stock}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <button 
                                onClick={handleCommitImportToQueue}
                                disabled={isImportingInProgress}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-mono font-bold text-xs uppercase text-center transition flex items-center justify-center gap-1"
                              >
                                {isImportingInProgress ? 'Queueing Threads...' : 'Queue Mapped Items to Review Log'}
                                <ArrowRight size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: AI PRODUCT GENERATOR */}
              {activeTab === 'ai_generator' && (
                <div className="space-y-6">
                  <div className="bg-[#121216] border border-gray-800 rounded-2xl p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-black uppercase tracking-tight text-white font-mono flex items-center gap-1.5">
                          <Cpu size={14} className="text-amber-500" />
                          Gemini High-Performance Product Composer
                        </h3>
                        <p className="text-[10px] text-gray-500 leading-relaxed">Enter a raw description or manufacturer bullet points. Gemini AI compiles polished titles, descriptive marketing copy (avoiding copying verbatim), structured spec tables, tags and taxonomies.</p>
                      </div>
                      
                      {/* Connection Diagnostic Badges */}
                      <div className="flex items-center gap-2">
                        {geminiConfigured === null ? (
                          <span className="text-[9px] font-mono font-bold text-gray-500 bg-gray-900 border border-gray-800 px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                            Checking Gemini Status...
                          </span>
                        ) : geminiConfigured ? (
                          <span className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-950/20 border border-emerald-800/60 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                            Gemini Autopilot Connected
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-950/20 border border-amber-800/60 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5" title="No valid GEMINI_API_KEY detected in environment secrets. Default fallback mode enabled.">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                            Offline Mock Mode Active
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono text-gray-400 uppercase font-extrabold block">Product Concept / AliExpress, Temu, or Jumia URL</label>
                            {cleanAliUrl && (
                              <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-wider animate-pulse flex items-center gap-1">
                                <Check size={10} /> 
                                {aliUrlType === 'product' ? 'Validated Product Link' : 'Validated E-Commerce Link'}
                              </span>
                            )}
                          </div>
                          <input 
                            type="text" 
                            placeholder="e.g. AliExpress, Temu, Jumia GH product URL or product title/concept"
                            value={genPrompt}
                            onChange={(e) => setGenPrompt(e.target.value)}
                            className={`w-full p-2.5 bg-black border ${!isAliUrlValid ? 'border-red-500/80 focus:border-red-500 text-red-400' : cleanAliUrl ? 'border-emerald-500/80 focus:border-emerald-500 text-emerald-400' : 'border-gray-800 text-white'} rounded-xl text-xs font-mono placeholder:text-gray-600 transition`}
                          />
                          {!isAliUrlValid && aliUrlError && (
                            <div className="flex items-start gap-1.5 text-[10px] font-mono text-red-400 leading-relaxed bg-red-950/25 border border-red-900/40 p-2 rounded-lg mt-1 animate-pulse">
                              <AlertTriangle size={12} className="shrink-0 mt-0.5 text-red-400" />
                              <span>{aliUrlError}</span>
                            </div>
                          )}
                          {isAliUrlValid && cleanAliUrl && (
                            <div className="flex flex-col gap-1 text-[10px] font-mono leading-relaxed bg-emerald-950/25 border border-emerald-900/40 p-2.5 rounded-lg mt-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-start gap-1.5 text-emerald-400">
                                  <CheckCircle size={12} className="shrink-0 mt-0.5 text-emerald-400" />
                                  <span className="break-all font-semibold">
                                    {aliUrlType === 'product' ? 'Sanitized Product URL:' : aliUrlType === 'category' ? 'Sanitized Category/Store URL:' : 'Sanitized Destination URL:'}
                                  </span>
                                </div>
                                {aliUrlType === 'product' && aliProductId && (
                                  <span className="text-[9px] bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">
                                    Product ID: {aliProductId}
                                  </span>
                                )}
                                {aliUrlType === 'category' && aliCategoryId && (
                                  <span className="text-[9px] bg-blue-950/80 border border-blue-700/60 text-blue-300 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">
                                    Category ID: {aliCategoryId}
                                  </span>
                                )}
                                {aliUrlType === 'category' && !aliCategoryId && (
                                  <span className="text-[9px] bg-blue-950/80 border border-blue-700/60 text-blue-300 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">
                                    Category/Search Page
                                  </span>
                                )}
                              </div>
                              <span className="text-gray-400 break-all pl-5">{cleanAliUrl}</span>
                              {aliStrippedParams && aliStrippedParams.length > 0 && (
                                <div className="mt-1.5 pt-1.5 border-t border-emerald-900/20 pl-5 flex flex-wrap items-center gap-1.5">
                                  <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider block">Autopilot Sanitized ({aliStrippedParams.length}):</span>
                                  {aliStrippedParams.map((p, idx) => (
                                    <span key={idx} className="text-[9px] bg-amber-950/40 border border-amber-900/35 text-amber-400 px-1 rounded-sm">
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-gray-400 uppercase font-extrabold block">Brand</label>
                            <select 
                              value={genBrand}
                              onChange={(e) => setGenBrand(e.target.value)}
                              className="w-full p-2 bg-black border border-gray-800 rounded-xl text-xs font-mono text-amber-500"
                            >
                              <option value="HP">HP</option>
                              <option value="Samsung">Samsung</option>
                              <option value="Apple">Apple</option>
                              <option value="Google Pixel">Google Pixel</option>
                              <option value="Anker">Anker</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-gray-400 uppercase font-extrabold block">Category Path</label>
                            <select 
                              value={genCategory}
                              onChange={(e) => setGenCategory(e.target.value)}
                              className="w-full p-2 bg-black border border-gray-800 rounded-xl text-xs font-mono text-gray-200"
                            >
                              {STORE_CATEGORIES.map(c => (
                                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-gray-400 uppercase font-extrabold block">Raw Supplier Specifications (Optional)</label>
                          <textarea 
                            rows={3}
                            placeholder="Paste supplier specifications table or catalog raw bullets here..."
                            value={genRawSpecs}
                            onChange={(e) => setGenRawSpecs(e.target.value)}
                            className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs font-mono text-white placeholder:text-gray-600"
                          />
                        </div>

                        <button 
                          onClick={handleAiProductGenerate}
                          disabled={isGeneratingAi || !genPrompt.trim()}
                          className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black rounded-xl font-mono font-bold text-xs uppercase transition flex items-center justify-center gap-1.5"
                        >
                          {isGeneratingAi ? 'Synthesizing original marketing copy...' : 'Synthesize Product Catalog with Gemini'}
                          <Sparkles size={14} />
                        </button>
                      </div>

                      {/* AI RESULT BLOCK */}
                      <div className="bg-[#181822] border border-gray-800 rounded-2xl p-4 space-y-3.5 relative overflow-hidden flex flex-col justify-between">
                        {aiGenError ? (
                          <div className="flex-1 flex flex-col items-center justify-center p-6 text-rose-500 gap-3">
                            <AlertCircle size={32} className="text-rose-500 animate-bounce" />
                            <span className="text-xs font-bold font-mono uppercase tracking-wider text-rose-400">
                              {aiGenError.includes('Configuration Error') ? 'Gemini Key Missing' :
                               aiGenError.includes('Proxy Blocked') ? 'Crawler Proxy Blocked' :
                               aiGenError.includes('quota') || aiGenError.includes('Quota') ? 'Gemini Quota Exceeded' :
                               'Import Sync Failure'}
                            </span>
                            <p className="text-[11px] leading-relaxed text-gray-400 text-center font-mono whitespace-pre-line">
                              {aiGenError}
                            </p>
                          </div>
                        ) : isGeneratingAi ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-amber-500 gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                              <Sparkles size={16} className="text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <div className="space-y-1.5 max-w-xs">
                              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-amber-400 block animate-pulse">AUTOPILOT IMPORT ACTIVE</span>
                              <p className="text-[11px] text-gray-400 font-mono leading-relaxed min-h-[32px]">{aiGenStatus}</p>
                            </div>
                          </div>
                        ) : aiGenResult ? (
                          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            <div className="flex justify-between items-center text-[10px] font-mono text-amber-500 border-b border-gray-800 pb-2">
                              <span>AI GENERATOR PROJECTION</span>
                              <span className="px-1.5 py-0.5 bg-amber-500/10 rounded">MODEL: gemini-3.5-flash</span>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-gray-500 block uppercase">Product Name Title</span>
                              <h4 className="text-xs font-black text-white font-mono">{aiGenResult.name}</h4>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-gray-500 block uppercase">Original Marketing Description</span>
                              <p className="text-[10px] text-gray-400 leading-normal">{aiGenResult.description}</p>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono text-gray-500 block uppercase">Product Key Highlights</span>
                              <ul className="list-disc pl-4 text-[10px] text-amber-400 space-y-0.5">
                                {aiGenResult.highlights?.map((h: string, i: number) => (
                                  <li key={i}>{h}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono text-gray-500 block uppercase">Structured Specifications</span>
                              <div className="border border-gray-800 rounded-lg overflow-hidden text-[9px] font-mono">
                                {Object.entries(aiGenResult.specs || {}).map(([k, v]: any) => (
                                  <div key={k} className="flex justify-between p-1.5 border-b border-gray-800 bg-black/40">
                                    <span className="text-gray-400 font-bold">{k}</span>
                                    <span className="text-white">{v}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-gray-500 block uppercase">Taxonomy Category</span>
                              <p className="text-[10px] font-mono text-gray-300">Electronics → {genCategory} → {aiGenResult.category}</p>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-2">
                              {aiGenResult.tags?.map((tag: string, i: number) => (
                                <span key={i} className="text-[8px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-md font-mono">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500 gap-2">
                            <Sparkles size={24} className="text-gray-700 animate-pulse" />
                            <span className="text-xs font-bold font-mono">Standby mode</span>
                            <p className="text-[10px] max-w-xs leading-normal">Enter product specs on the left and click synthesize. Gemini will construct original copy, structured tables and SEO titles.</p>
                          </div>
                        )}

                        {aiGenResult && (
                          <button 
                            onClick={handleAcceptAiGeneratedProduct}
                            className="w-full mt-4 p-2 bg-green-500 hover:bg-green-600 text-black rounded-xl font-bold font-mono text-[11px] transition text-center uppercase"
                          >
                            Accept & Add to Review Queue
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: AI STUDIO SUITE (MEDIA & GROUNDING LAB) */}
              {activeTab === 'ai_studio' && (
                <div className="space-y-6">
                  {/* Outer Lab Frame */}
                  <div className="bg-[#121216] border border-gray-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-black uppercase tracking-tight text-white font-mono flex items-center gap-1.5">
                          <Sparkles size={14} className="text-amber-500 animate-pulse" />
                          AI Media & Grounding Lab Studio
                        </h3>
                        <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
                          Provision up-to-the-minute web information, geographical telemetry, studio-quality images, and cinematic Veo animations.
                        </p>
                      </div>

                      {/* Studio Tab selectors */}
                      <div className="flex bg-black/40 border border-gray-800 p-1 rounded-xl">
                        {[
                          { id: 'search', label: 'Search Grounding', icon: Globe },
                          { id: 'maps', label: 'Maps Grounding', icon: Navigation },
                          { id: 'image', label: 'Image Creator', icon: Image },
                          { id: 'video', label: 'Veo Video Animator', icon: Play }
                        ].map((sect) => {
                          const IconComp = sect.icon;
                          const isSectActive = studioActiveSection === sect.id;
                          return (
                            <button
                              key={sect.id}
                              onClick={() => setStudioActiveSection(sect.id as any)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono tracking-tight transition-all ${
                                isSectActive
                                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                                  : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              <IconComp size={11} />
                              <span>{sect.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 1: Google Search Grounding */}
                    {studioActiveSection === 'search' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Control panel */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-500 block">[1] Query Specifications</label>
                            <span className="text-[10px] text-gray-500 leading-normal block">
                              Enter a query requiring real-time web retrieval. Gemini will crawl Google Search live indices and construct factual answers with cited URLs.
                            </span>
                          </div>

                          <div className="space-y-3">
                            <textarea
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="e.g. Compare the wholesale and retail prices of premium Apple iPhone 15 Pro Max in Accra shops today."
                              rows={4}
                              className="w-full bg-[#09090D] border border-gray-800 focus:border-amber-500 text-xs text-white p-3.5 rounded-xl font-mono focus:outline-none resize-none placeholder-gray-600"
                            />

                            <button
                              onClick={() => handleSearchGroundingRun()}
                              disabled={isSearchingGround}
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black rounded-xl font-bold font-mono text-[11px] uppercase transition flex items-center justify-center gap-1.5"
                            >
                              {isSearchingGround ? (
                                <>
                                  <RefreshCw size={12} className="animate-spin text-black" />
                                  <span>Crawling Web Indices...</span>
                                </>
                              ) : (
                                <>
                                  <Globe size={12} className="text-black" />
                                  <span>Run Search Grounded Query</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Quick Suggestions */}
                          <div className="space-y-2 pt-2">
                            <span className="text-[9px] uppercase font-mono font-bold text-gray-500 block">Suggested Prompts:</span>
                            <div className="flex flex-wrap gap-2">
                              {[
                                "Price trends for Samsung S24 Ultra in Accra",
                                "iPhone 15 Pro Max vs Pro specs differences",
                                "Global smartphone market share 2026",
                                "Official warranty duration for brand new Apple products"
                              ].map((suggest, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSearchQuery(suggest);
                                    handleSearchGroundingRun(suggest);
                                  }}
                                  className="text-[9px] font-mono bg-black/30 border border-gray-850 hover:border-gray-700 hover:bg-black/50 px-2 py-1 rounded text-gray-400"
                                >
                                  {suggest}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Output panel */}
                        <div className="bg-black/30 border border-gray-850 rounded-2xl p-4 flex flex-col justify-between min-h-[300px]">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                              <span className="text-[10px] font-mono uppercase font-bold text-gray-400">[Output telemetry]</span>
                              {isSearchingGround && <span className="text-[9px] font-mono text-amber-500 animate-pulse">Retrieved Grounding Active</span>}
                            </div>

                            {searchError && (
                              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono text-[10px]">
                                {searchError}
                              </div>
                            )}

                            {searchResult ? (
                              <div className="space-y-4 text-xs">
                                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono">
                                  {searchResult.text}
                                </div>

                                {searchResult.sources && searchResult.sources.length > 0 && (
                                  <div className="pt-4 border-t border-gray-850 space-y-2">
                                    <span className="text-[9px] font-mono uppercase font-bold text-amber-500 block">Verified Google Search Sources:</span>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      {searchResult.sources.map((src, sIdx) => (
                                        <a
                                          key={sIdx}
                                          href={src.uri}
                                          target="_blank"
                                          rel="referrer noopener"
                                          className="flex items-center gap-1 text-[9px] font-mono text-blue-400 hover:underline hover:text-blue-300 truncate"
                                        >
                                          <ArrowUpRight size={10} />
                                          <span>{src.title || src.uri}</span>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : !isSearchingGround ? (
                              <div className="flex flex-col items-center justify-center py-16 text-gray-600 font-mono text-center space-y-2">
                                <Globe size={20} className="text-gray-800" />
                                <span className="text-[10px] font-bold">Search Grounding Idle</span>
                                <p className="text-[8px] max-w-xs leading-normal">Results are augmented with factual source data directly from Google Search engine.</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-16 text-amber-500 font-mono text-center space-y-2">
                                <RefreshCw size={24} className="animate-spin text-amber-500" />
                                <span className="text-[10px] font-bold animate-pulse">Assembling live indexes...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 2: Google Maps Grounding */}
                    {studioActiveSection === 'maps' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Control panel */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-500 block">[1] Location & Directions Specifications</label>
                            <span className="text-[10px] text-gray-500 leading-normal block">
                              Query routes, landmarks, branch operating hours, and location data in Ghana using live Google Maps coordinates grounding.
                            </span>
                          </div>

                          <div className="space-y-3">
                            <textarea
                              value={mapsQuery}
                              onChange={(e) => setMapsQuery(e.target.value)}
                              placeholder="e.g. Find directions to Immortal Electronics repair workshop branch near Circle Ebony in Accra, Ghana."
                              rows={4}
                              className="w-full bg-[#09090D] border border-gray-800 focus:border-amber-500 text-xs text-white p-3.5 rounded-xl font-mono focus:outline-none resize-none placeholder-gray-600"
                            />

                            <button
                              onClick={() => handleMapsGroundingRun()}
                              disabled={isMapsGrounding}
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black rounded-xl font-bold font-mono text-[11px] uppercase transition flex items-center justify-center gap-1.5"
                            >
                              {isMapsGrounding ? (
                                <>
                                  <RefreshCw size={12} className="animate-spin text-black" />
                                  <span>Retrieving Coordinates...</span>
                                </>
                              ) : (
                                <>
                                  <Navigation size={12} className="text-black" />
                                  <span>Run Maps Grounded Query</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Quick Suggestions */}
                          <div className="space-y-2 pt-2">
                            <span className="text-[9px] uppercase font-mono font-bold text-gray-500 block">Suggested Prompts:</span>
                            <div className="flex flex-wrap gap-2">
                              {[
                                "Where is Immortal Electronics Accra branch located?",
                                "Directions to Immortal Electronics from Accra Mall",
                                "Opening hours and contact phone for Benjamin Danso",
                                "Nearest courier delivery partner in Accra"
                              ].map((suggest, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setMapsQuery(suggest);
                                    handleMapsGroundingRun(suggest);
                                  }}
                                  className="text-[9px] font-mono bg-black/30 border border-gray-850 hover:border-gray-700 hover:bg-black/50 px-2 py-1 rounded text-gray-400"
                                >
                                  {suggest}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Output panel */}
                        <div className="bg-black/30 border border-gray-850 rounded-2xl p-4 flex flex-col justify-between min-h-[300px]">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                              <span className="text-[10px] font-mono uppercase font-bold text-gray-400">[Maps output]</span>
                              {isMapsGrounding && <span className="text-[9px] font-mono text-amber-500 animate-pulse">Maps Grounding Active</span>}
                            </div>

                            {mapsError && (
                              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono text-[10px]">
                                {mapsError}
                              </div>
                            )}

                            {mapsResult ? (
                              <div className="space-y-4 text-xs">
                                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono">
                                  {mapsResult.text}
                                </div>

                                {mapsResult.sources && mapsResult.sources.length > 0 && (
                                  <div className="pt-4 border-t border-gray-850 space-y-2">
                                    <span className="text-[9px] font-mono uppercase font-bold text-amber-500 block">Verified Coordinates & Location links:</span>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      {mapsResult.sources.map((src, sIdx) => (
                                        <a
                                          key={sIdx}
                                          href={src.uri}
                                          target="_blank"
                                          rel="referrer noopener"
                                          className="flex items-center gap-1 text-[9px] font-mono text-green-400 hover:underline hover:text-green-300 truncate"
                                        >
                                          <Navigation size={10} />
                                          <span>{src.title || src.uri}</span>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : !isMapsGrounding ? (
                              <div className="flex flex-col items-center justify-center py-16 text-gray-600 font-mono text-center space-y-2">
                                <Navigation size={20} className="text-gray-800" />
                                <span className="text-[10px] font-bold">Maps Grounding Idle</span>
                                <p className="text-[8px] max-w-xs leading-normal">Results are fully mapped using geographical coordinates and directions references in Ghana.</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-16 text-amber-500 font-mono text-center space-y-2">
                                <RefreshCw size={24} className="animate-spin text-amber-500" />
                                <span className="text-[10px] font-bold animate-pulse">Triangulating geo-telemetry...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 3: AI High-Quality Image Creator */}
                    {studioActiveSection === 'image' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Controls */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-500 block">[1] Visual Prompts & Parameters</label>
                            <span className="text-[10px] text-gray-500 leading-normal block">
                              Synthesize high-fidelity product images, hero catalog banners or illustrative graphics. Customize resolution and dimensions.
                            </span>
                          </div>

                          <div className="space-y-4">
                            {/* Prompt */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono uppercase font-bold text-gray-400">Image Description Prompt</span>
                              <textarea
                                value={imgPrompt}
                                onChange={(e) => setImgPrompt(e.target.value)}
                                placeholder="e.g. Studio product shot of an Apple iPhone 15 Pro Max, floating elegantly on a clean dark slate background, professional lighting, metallic accents, hyperrealistic."
                                rows={3}
                                className="w-full bg-[#09090D] border border-gray-800 focus:border-amber-500 text-xs text-white p-3 rounded-xl font-mono focus:outline-none resize-none placeholder-gray-600"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* Model Selection */}
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-mono uppercase font-bold text-gray-400 block">Model Presets</span>
                                <select
                                  value={imgModel}
                                  onChange={(e: any) => setImgModel(e.target.value)}
                                  className="w-full bg-[#09090D] border border-gray-800 text-[10px] text-white p-2 rounded-xl font-mono focus:outline-none"
                                >
                                  <option value="gemini-3-pro-image-preview">gemini-3-pro-image (Studio)</option>
                                  <option value="gemini-3.1-flash-image-preview">gemini-3.1-flash-image (General)</option>
                                </select>
                              </div>

                              {/* Size Selection */}
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-mono uppercase font-bold text-gray-400 block">Image Resolution</span>
                                <select
                                  value={imgSize}
                                  onChange={(e: any) => setImgSize(e.target.value)}
                                  className="w-full bg-[#09090D] border border-gray-800 text-[10px] text-white p-2 rounded-xl font-mono focus:outline-none"
                                >
                                  <option value="1K">1K (Standard HD)</option>
                                  <option value="2K">2K (Studio QHD)</option>
                                  <option value="4K">4K (Ultra UHD)</option>
                                </select>
                              </div>

                              {/* Aspect Ratio */}
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-mono uppercase font-bold text-gray-400 block">Aspect Ratio</span>
                                <select
                                  value={imgAspect}
                                  onChange={(e: any) => setImgAspect(e.target.value)}
                                  className="w-full bg-[#09090D] border border-gray-800 text-[10px] text-white p-2 rounded-xl font-mono focus:outline-none"
                                >
                                  <option value="1:1">1:1 (Square)</option>
                                  <option value="2:3">2:3 (Portrait Slim)</option>
                                  <option value="3:2">3:2 (Landscape Classic)</option>
                                  <option value="3:4">3:4 (Portrait Standard)</option>
                                  <option value="4:3">4:3 (Landscape Standard)</option>
                                  <option value="9:16">9:16 (Story/Short Portrait)</option>
                                  <option value="16:9">16:9 (Cinema Landscape)</option>
                                  <option value="21:9">21:9 (Ultrawide Panoramic)</option>
                                </select>
                              </div>
                            </div>

                            <button
                              onClick={handleImageGenerationRun}
                              disabled={isGeneratingImg}
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black rounded-xl font-bold font-mono text-[11px] uppercase transition flex items-center justify-center gap-1.5"
                            >
                              {isGeneratingImg ? (
                                <>
                                  <RefreshCw size={12} className="animate-spin text-black" />
                                  <span>Compiling Image Models...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles size={12} className="text-black" />
                                  <span>Synthesize Creative Asset</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Result Display */}
                        <div className="bg-black/30 border border-gray-850 rounded-2xl p-4 flex flex-col justify-between min-h-[300px]">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                              <span className="text-[10px] font-mono uppercase font-bold text-gray-400">[Visual preview canvas]</span>
                              {imgSize && <span className="text-[9px] font-mono text-amber-500">{imgSize} Res • Aspect {imgAspect}</span>}
                            </div>

                            {imgError && (
                              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono text-[10px]">
                                {imgError}
                              </div>
                            )}

                            {generatedImgUrl ? (
                              <div className="space-y-4 animate-fadeIn">
                                <div className="border border-gray-800 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center max-h-[250px] overflow-y-auto">
                                  <img
                                    src={generatedImgUrl}
                                    alt="Generated Asset"
                                    referrerPolicy="no-referrer"
                                    className="max-w-full max-h-[240px] object-contain transition duration-300"
                                  />
                                </div>

                                <div className="flex gap-2 pt-2">
                                  <a
                                    href={generatedImgUrl}
                                    download="generated_asset.png"
                                    className="flex-1 py-1.5 bg-[#1C1C24] border border-gray-800 hover:border-gray-700 text-[10px] text-white font-bold font-mono rounded-lg text-center transition"
                                  >
                                    Download Asset File
                                  </a>
                                  <button
                                    onClick={() => {
                                      // Push to Image Manager files
                                      const newFile = {
                                        id: `asset-${Date.now()}`,
                                        url: generatedImgUrl,
                                        name: `Generated_Asset_${Date.now()}.png`,
                                        size: `${Math.round(imgPrompt.length * 0.15)} KB`,
                                        status: 'Completed' as const,
                                        format: 'PNG',
                                        altText: imgPrompt
                                      };
                                      setImageManagerFiles(prev => [newFile, ...prev]);
                                      alert('Successfully exported to Global Image Manager.');
                                    }}
                                    className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-[10px] text-black font-bold font-mono rounded-lg text-center transition"
                                  >
                                    Export to Image Manager
                                  </button>
                                </div>
                              </div>
                            ) : !isGeneratingImg ? (
                              <div className="flex flex-col items-center justify-center py-16 text-gray-600 font-mono text-center space-y-2">
                                <Image size={24} className="text-gray-800" />
                                <span className="text-[10px] font-bold">Preview Canvas Blank</span>
                                <p className="text-[8px] max-w-xs leading-normal">Enter parameters on the left and synthesize to compose original, high-contrast creative content.</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-16 text-amber-500 font-mono text-center space-y-2">
                                <RefreshCw size={24} className="animate-spin text-amber-500" />
                                <span className="text-[10px] font-bold animate-pulse">Running Diffusion Pipelines...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 4: AI Veo Video Animator */}
                    {studioActiveSection === 'video' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Controls */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-500 block">[1] Video Motion Parameters</label>
                            <span className="text-[10px] text-gray-500 leading-normal block">
                              Upload a reference image and input camera instructions. Veo Generative Video model compiles realistic cinematic motion clips.
                            </span>
                          </div>

                          <div className="space-y-4 text-xs font-mono">
                            {/* Image Uploader */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase font-bold text-gray-400 block">Upload Reference Image (Required)</span>
                              <div className="border border-dashed border-gray-800 rounded-xl p-4 bg-black/20 text-center relative hover:border-gray-600 transition">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleVideoImageUpload}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                {videoSourceImage ? (
                                  <div className="flex items-center gap-3 justify-center">
                                    <img
                                      src={videoSourceImage}
                                      alt="Source Thumbnail"
                                      className="w-12 h-12 rounded object-cover border border-gray-800"
                                    />
                                    <div className="text-left">
                                      <span className="text-[9px] text-green-400 font-bold block">✓ Image Uploaded</span>
                                      <span className="text-[8px] text-gray-500">Click or Drag to replace</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <Upload size={14} className="mx-auto text-gray-500" />
                                    <span className="text-[9px] text-gray-400 block">Click or Drag to upload JPEG/PNG</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Prompt instructions */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase font-bold text-gray-400">Cinematic Motion Instructions</span>
                              <textarea
                                value={videoPrompt}
                                onChange={(e) => setVideoPrompt(e.target.value)}
                                placeholder="e.g. Slowly zoom into the phone display with professional subtle 3D depth, cinematic particle effects drifting in background, 8k, slow motion."
                                rows={2}
                                className="w-full bg-[#09090D] border border-gray-800 focus:border-amber-500 text-xs text-white p-2.5 rounded-xl focus:outline-none resize-none placeholder-gray-600"
                              />
                            </div>

                            {/* Aspect Ratio */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase font-bold text-gray-400 block">Dimensions</span>
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { id: '16:9', label: '16:9 (Landscape Cinema)' },
                                  { id: '9:16', label: '9:16 (Mobile Portrait)' }
                                ].map((asp) => (
                                  <button
                                    key={asp.id}
                                    type="button"
                                    onClick={() => setVideoAspect(asp.id as any)}
                                    className={`p-2 rounded-lg border text-[10px] text-center font-bold tracking-tight transition ${
                                      videoAspect === asp.id
                                        ? 'bg-amber-500 text-black border-amber-500'
                                        : 'bg-[#09090D] text-gray-400 border-gray-800 hover:text-white'
                                    }`}
                                  >
                                    {asp.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={handleVideoGenerationRun}
                              disabled={isGeneratingVideo}
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black rounded-xl font-bold font-mono text-[11px] uppercase transition flex items-center justify-center gap-1.5"
                            >
                              {isGeneratingVideo ? (
                                <>
                                  <RefreshCw size={12} className="animate-spin text-black" />
                                  <span>Rendering Video on Veo...</span>
                                </>
                              ) : (
                                <>
                                  <Play size={12} className="text-black fill-current" />
                                  <span>Compile Veo Animation</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Rendering Output/Logs & Video player */}
                        <div className="bg-black/30 border border-gray-850 rounded-2xl p-4 flex flex-col justify-between min-h-[300px]">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                              <span className="text-[10px] font-mono uppercase font-bold text-gray-400">[Veo rendering monitor]</span>
                              {videoAspect && <span className="text-[9px] font-mono text-amber-500">Resolution 720p • Ratio {videoAspect}</span>}
                            </div>

                            {videoError && (
                              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono text-[10px]">
                                {videoError}
                              </div>
                            )}

                            {generatedVideoUrl ? (
                              <div className="space-y-4 animate-fadeIn">
                                <div className="border border-gray-800 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                                  <video
                                    src={generatedVideoUrl}
                                    controls
                                    autoPlay
                                    loop
                                    muted
                                    className="max-w-full rounded"
                                    style={{ maxHeight: '220px' }}
                                  />
                                </div>

                                <a
                                  href={generatedVideoUrl}
                                  download="veo_animation.mp4"
                                  className="block w-full py-2 bg-amber-500 hover:bg-amber-600 text-black text-[11px] font-bold font-mono rounded-xl text-center transition uppercase"
                                >
                                  Download Video MP4 File
                                </a>
                              </div>
                            ) : isGeneratingVideo ? (
                              <div className="space-y-3 font-mono text-xs">
                                <div className="flex flex-col items-center justify-center py-6 text-amber-500 text-center space-y-2">
                                  <RefreshCw size={24} className="animate-spin text-amber-500" />
                                  <span className="text-[10px] font-bold animate-pulse">Veo Generative Render Active...</span>
                                </div>
                                <div className="bg-[#09090D] border border-gray-850 rounded-xl p-3 h-[130px] overflow-y-auto text-[9px] text-gray-400 leading-normal space-y-1 scrollbar-thin">
                                  {videoStatusLogs.map((log, lIdx) => (
                                    <div key={lIdx} className="flex gap-1.5">
                                      <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
                                      <span className={log.startsWith('[ERROR]') ? 'text-red-400' : log.includes('Success') ? 'text-green-400' : 'text-gray-300'}>{log}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-16 text-gray-600 font-mono text-center space-y-2">
                                <Play size={24} className="text-gray-800" />
                                <span className="text-[10px] font-bold">Veo Display Standby</span>
                                <p className="text-[8px] max-w-xs leading-normal">Upload an image and click compile. Animating standard images can take a few minutes as Veo is a massive model.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* TAB 4: IMPORT HISTORY */}
              {activeTab === 'import_history' && (
                <div className="space-y-6">
                  <div className="bg-[#121216] border border-gray-800 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono">BULK PROCESS RETROSPECTIVES</h3>
                    <div className="border border-gray-800 rounded-xl overflow-hidden bg-black/20 text-xs">
                      <table className="w-full text-left font-mono">
                        <thead className="bg-[#18181F] text-gray-400">
                          <tr>
                            <th className="p-3">Sync Date</th>
                            <th className="p-3">Source Channel</th>
                            <th className="p-3">Parsed Lines</th>
                            <th className="p-3">Succeeded</th>
                            <th className="p-3">Rejected</th>
                            <th className="p-3">Latency</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importHistory.map((job) => (
                            <tr key={job.id} className="border-t border-gray-800/80">
                              <td className="p-3">{job.date}</td>
                              <td className="p-3 text-white font-bold">{job.source}</td>
                              <td className="p-3">{job.processed} products</td>
                              <td className="p-3 text-green-400">{job.published}</td>
                              <td className="p-3 text-red-400">{job.rejected}</td>
                              <td className="p-3 text-gray-400">{job.duration}</td>
                              <td className="p-3">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                  job.status === 'Completed' ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {job.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: REVIEW QUEUE */}
              {activeTab === 'review_queue' && (
                <div className="space-y-6">
                  <div className="bg-[#121216] border border-gray-800 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono flex items-center gap-1.5">
                          <Inbox size={14} className="text-amber-500" />
                          HUMAN-IN-THE-LOOP VALDIATION PIPELINE ({queuedProducts.length})
                        </h3>
                        <p className="text-[10px] text-gray-500 font-mono">No items are published to the web portal without executive confirmation.</p>
                      </div>

                      {/* Bulk actions controls */}
                      {selectedQueueIds.length > 0 && (
                        <div className="flex flex-wrap gap-2.5 items-center bg-[#1A1A24] border border-gray-800 px-3 py-2 rounded-xl text-[10px] font-mono">
                          <span className="text-amber-500 font-bold">{selectedQueueIds.length} items checked:</span>
                          <button 
                            onClick={handleBulkPublish}
                            className="bg-green-500 hover:bg-green-600 text-black px-2.5 py-1 rounded-lg font-bold font-mono transition"
                          >
                            Bulk Approve & Publish
                          </button>
                          <div className="w-px h-4 bg-gray-800"></div>
                          <select 
                            value={bulkMarkupPercent} 
                            onChange={(e) => setBulkMarkupPercent(parseInt(e.target.value))}
                            className="p-1 bg-black border border-gray-850 rounded text-amber-500"
                          >
                            <option value={10}>10% Markup</option>
                            <option value={15}>15% Markup</option>
                            <option value={20}>20% Markup</option>
                          </select>
                          <button 
                            onClick={handleBulkMarkup}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg font-mono font-bold transition"
                          >
                            Apply Markup
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="border border-gray-800 rounded-xl overflow-hidden bg-black/20 text-xs">
                      <table className="w-full text-left font-mono">
                        <thead className="bg-[#18181F] text-gray-400">
                          <tr>
                            <th className="p-3 w-10">
                              <input 
                                type="checkbox"
                                checked={selectedQueueIds.length === queuedProducts.length}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedQueueIds(queuedProducts.map(q => q.id));
                                  else setSelectedQueueIds([]);
                                }}
                                className="rounded"
                              />
                            </th>
                            <th className="p-3">Product Name</th>
                            <th className="p-3">Brand</th>
                            <th className="p-3">Markup Pricing</th>
                            <th className="p-3">Validation Warning</th>
                            <th className="p-3">SKU / Model</th>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {queuedProducts.map((item) => (
                            <tr key={item.id} className="border-t border-gray-800/80 hover:bg-gray-850/20">
                              <td className="p-3">
                                <input 
                                  type="checkbox"
                                  checked={selectedQueueIds.includes(item.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedQueueIds([...selectedQueueIds, item.id]);
                                    else setSelectedQueueIds(selectedQueueIds.filter(id => id !== item.id));
                                  }}
                                  className="rounded"
                                />
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <img src={item.image} className="w-8 h-8 rounded-lg object-cover border border-gray-800" onError={handleImageError} />
                                  <div>
                                    <span className="font-extrabold text-gray-200 block">{item.name}</span>
                                    <p className="text-[9px] text-gray-500 truncate max-w-xs">{item.description}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-amber-500 font-bold">{item.brand}</td>
                              <td className="p-3">
                                <div className="space-y-0.5">
                                  <span className="text-white font-bold block">GHS {item.priceGHS}</span>
                                  <span className="text-[9px] text-gray-500">Cost: GHS {item.costPriceGHS}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                {item.flags.length > 0 ? (
                                  <div className="space-y-1">
                                    {item.flags.map((flg, idx) => (
                                      <span key={idx} className="inline-flex items-center gap-1 text-[9px] text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full font-mono">
                                        <AlertTriangle size={8} /> {flg}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[9px] text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full font-mono">
                                    <Check size={8} /> All Rules Verified
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="space-y-0.5 font-mono text-[10px]">
                                  <span className="text-gray-400 block">SKU: {item.sku || '[MISSING]'}</span>
                                  <span className="text-gray-500">Mod: {item.model}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-1.5">
                                  <button 
                                    onClick={() => setReviewProduct(item)}
                                    className="p-1.5 bg-[#18181F] hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition"
                                    title="Edit Draft Details"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button 
                                    onClick={() => handlePublishQueueItem(item)}
                                    className="p-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/20 text-amber-500 rounded-lg transition font-bold font-mono text-[10px]"
                                  >
                                    Approve & Publish
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {queuedProducts.length === 0 && (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-gray-500 font-mono text-xs">
                                No products in validation queue. Create drafts using Importers or AI composer!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PENDING PRODUCTS */}
              {activeTab === 'pending_products' && (
                <div className="space-y-6">
                  <div className="bg-[#121216] border border-gray-800 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono">ALL PRE-PUBLICATION DRAUGHT ITEMS</h3>
                    <p className="text-[10px] text-gray-500">These items are in the system but marked as offline drafts until published to the live ecommerce catalogue.</p>
                    <div className="border border-gray-800 rounded-xl overflow-hidden bg-black/20 text-xs">
                      <table className="w-full text-left font-mono">
                        <thead className="bg-[#18181F] text-gray-400">
                          <tr>
                            <th className="p-3">Title</th>
                            <th className="p-3">SKU</th>
                            <th className="p-3">Stock</th>
                            <th className="p-3">Cost Price</th>
                            <th className="p-3">Proposed Price</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {queuedProducts.map(q => (
                            <tr key={q.id} className="border-t border-gray-800/80">
                              <td className="p-3 text-white font-bold">{q.name}</td>
                              <td className="p-3 text-gray-400">{q.sku || 'UNASSIGNED'}</td>
                              <td className="p-3">{q.stock}</td>
                              <td className="p-3">GHS {q.costPriceGHS}</td>
                              <td className="p-3 text-amber-500 font-extrabold">GHS {q.priceGHS}</td>
                              <td className="p-3">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-bold border border-gray-700">
                                  DRAFT
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: PUBLISHED PRODUCTS */}
              {activeTab === 'published_products' && (
                <div className="space-y-6">
                  <div className="bg-[#121216] border border-gray-800 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono">LIVE E-COMMERCE PORTAL LISTINGS</h3>
                    <p className="text-[10px] text-gray-500 font-mono">These items are currently live, searchable, and purchaseable by end users in Ghana via Mobile Money/Card checkout.</p>
                    <div className="border border-gray-800 rounded-xl overflow-hidden bg-black/20 text-xs">
                      <table className="w-full text-left font-mono">
                        <thead className="bg-[#18181F] text-gray-400">
                          <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Brand</th>
                            <th className="p-3">Live Price</th>
                            <th className="p-3">Active Stock</th>
                            <th className="p-3">Ratings</th>
                            <th className="p-3">Tax status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {localProducts.map(p => (
                            <tr key={p.id} className="border-t border-gray-800/80">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <img src={p.image} className="w-8 h-8 rounded-lg object-cover" onError={handleImageError} />
                                  <span className="font-bold text-white">{p.name}</span>
                                </div>
                              </td>
                              <td className="p-3 text-amber-500">{p.brand}</td>
                              <td className="p-3 text-white font-extrabold">GHS {p.priceGHS}</td>
                              <td className="p-3">
                                <span className={p.stock <= 5 ? 'text-red-400 font-bold' : 'text-green-400'}>
                                  {p.stock} remaining
                                </span>
                              </td>
                              <td className="p-3 text-gray-400">★ {p.rating} ({p.reviewsCount})</td>
                              <td className="p-3 text-green-400 text-[10px]">Active Standard VAT</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: SUPPLIER CENTER */}
              {activeTab === 'supplier_center' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {suppliers.map(sup => (
                      <div key={sup.id} className="bg-[#121216] border border-gray-800 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-mono text-gray-500 block uppercase">Supplier Feed</span>
                            <h4 className="text-xs font-black font-mono text-white">{sup.name}</h4>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                            sup.status === 'Connected' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {sup.status}
                          </span>
                        </div>

                        <div className="border-t border-gray-850 pt-2.5 grid grid-cols-2 gap-2 text-[10px] font-mono">
                          <div>
                            <span className="text-gray-500 text-[8px] block uppercase">FORMAT</span>
                            <span className="text-gray-300 font-bold">{sup.format}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-[8px] block uppercase">SYNC INTERVAL</span>
                            <span className="text-gray-300 font-bold">{sup.autoSync}</span>
                          </div>
                        </div>

                        <div className="bg-[#0E0E12] border border-gray-850 p-2 rounded-lg flex justify-between text-[9px] font-mono">
                          <span className="text-gray-400">Last Sync:</span>
                          <span className="text-gray-500">{sup.lastSync}</span>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            disabled={sup.status === 'Disconnected'}
                            className="flex-1 p-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-mono font-bold text-[10px] rounded-xl text-center transition"
                          >
                            Execute Manual Pull
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 9: IMAGE MANAGER */}
              {activeTab === 'image_manager' && (
                <div className="space-y-6">
                  <div className="bg-[#121216] border border-gray-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono flex items-center gap-1.5">
                      <Image size={14} className="text-amber-500" />
                      Bulk Image Compression Engine & AI Alt Text Captioning
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono">Automatically convert raw high-res images to web-optimized `.webp` formats, strip white backgrounds, and run Gemini Vision models to draft descriptive captions.</p>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-8 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {imageManagerFiles.map(img => (
                            <div key={img.id} className="bg-[#181822] border border-gray-800 p-3 rounded-2xl space-y-2">
                              <img src={img.url} className="w-full h-32 object-cover rounded-xl border border-gray-800" onError={handleImageError} />
                              <div className="flex justify-between text-[10px] font-mono">
                                <span className="font-bold text-gray-300 truncate max-w-[120px]">{img.name}</span>
                                <span className="text-amber-500 font-bold">{img.size}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-gray-500">FORMAT: <strong className="text-gray-300">{img.format}</strong></span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                  img.status === 'Completed' ? 'bg-green-500/10 text-green-400' : img.status === 'Compressing' ? 'bg-amber-500/10 text-amber-400 animate-pulse' : 'bg-gray-800 text-gray-400'
                                }`}>
                                  {img.status}
                                </span>
                              </div>
                              {img.altText && (
                                <div className="bg-black/40 border border-gray-800 p-2 rounded-lg text-[9px] font-mono leading-normal text-gray-400">
                                  <span className="text-[8px] text-amber-500 font-bold block uppercase mb-1">AI ALTERNATIVE TEXT</span>
                                  {img.altText}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="lg:col-span-4 bg-[#181822] border border-gray-800 p-4 rounded-2xl space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                          <span className="text-[9px] font-mono font-black tracking-wider text-gray-400 block uppercase">ENGINE CONFIGURATION</span>
                          
                          <div className="space-y-3 text-[10px] font-mono">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={removeBgChecked}
                                onChange={(e) => setRemoveBgChecked(e.target.checked)}
                                className="rounded text-amber-500" 
                              />
                              <span>Remove White Background (Sharp AI)</span>
                            </label>
                            
                            <div className="space-y-1">
                              <span className="text-gray-500 text-[8px] block uppercase">OUTPUT FORMAT</span>
                              <select className="w-full p-2 bg-black border border-gray-850 rounded text-amber-500 text-[10px] font-mono">
                                <option>WebP (Highly Compressed, Optimal)</option>
                                <option>AVIF (Lossless, High Latency)</option>
                                <option>PNG (Uncompressed)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={handleOptimizeImages}
                          disabled={isCompressingImages}
                          className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black rounded-xl font-mono font-bold text-xs uppercase text-center transition"
                        >
                          {isCompressingImages ? 'Compressing and Capturing...' : 'Run WebP Compress & Caption Engine'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: SEO MANAGER */}
              {activeTab === 'seo_manager' && (
                <div className="space-y-6">
                  <div className="bg-[#121216] border border-gray-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono flex items-center gap-1.5">
                      <Globe size={14} className="text-amber-500" />
                      Search Engine Optimization & Schema.org Metadata Compiler
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-5 space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono font-bold text-gray-400 uppercase block">Select Target Catalog Draft</label>
                          <select 
                            value={seoTargetItem}
                            onChange={(e) => setSeoTargetItem(e.target.value)}
                            className="w-full p-2 bg-black border border-gray-800 rounded-xl text-xs font-mono text-amber-500"
                          >
                            {queuedProducts.map(q => (
                              <option key={q.id} value={q.id}>{q.name}</option>
                            ))}
                          </select>
                        </div>

                        <button 
                          onClick={() => {
                            setIsSeoOptimizing(true);
                            setTimeout(() => {
                              setIsSeoOptimizing(false);
                            }, 1000);
                          }}
                          className="w-full py-2.5 bg-[#0066FF] hover:bg-[#0055DD] text-white rounded-xl font-mono font-bold text-xs uppercase text-center transition"
                        >
                          {isSeoOptimizing ? 'Generating Meta Tag sets...' : 'Generate Optimized SEO Bundle'}
                        </button>

                        <div className="space-y-3 font-mono text-[10px] bg-black/40 border border-gray-850 p-3 rounded-xl">
                          <span className="text-[8px] text-amber-500 font-bold block uppercase border-b border-gray-850 pb-1">ACCRA GOOGLE RESULTS PREVIEW</span>
                          <h4 className="text-blue-400 font-extrabold hover:underline text-xs cursor-pointer">{seoDetails.title}</h4>
                          <p className="text-green-500 text-[9px] truncate">{seoDetails.canonical}</p>
                          <p className="text-gray-400 leading-normal">{seoDetails.description}</p>
                        </div>
                      </div>

                      <div className="lg:col-span-7 bg-[#181822] border border-gray-800 p-4 rounded-2xl space-y-3 font-mono text-xs">
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block border-b border-gray-800 pb-1.5">JSON-LD STRUCTURED DATA SCHEMA</span>
                        <div className="relative">
                          <pre className="bg-black/60 border border-gray-850 p-3 rounded-xl max-h-56 overflow-y-auto text-[10px] text-green-400 leading-normal">
                            <code>{seoDetails.schemaMarkup}</code>
                          </pre>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(seoDetails.schemaMarkup);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-gray-800 hover:bg-gray-750 text-gray-300 rounded-lg transition"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 11: BULK UPDATE */}
              {activeTab === 'bulk_update' && (
                <div className="space-y-6">
                  <div className="bg-[#121216] border border-gray-800 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono flex items-center gap-1">
                      <Sliders size={14} className="text-amber-500" />
                      Bulk Catalog Transformations & Mass Price Markups
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono">Select target filters and apply modifications across thousands of products in fractions of seconds.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                      <div className="bg-[#181822] border border-gray-800 p-4 rounded-2xl space-y-3">
                        <span className="text-[9px] font-black text-gray-400 block uppercase">1. FILTER BY</span>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <span className="text-gray-500 text-[8px] block uppercase">CATEGORY</span>
                            <select className="w-full p-2 bg-black border border-gray-850 rounded text-gray-300">
                              <option>All Computing</option>
                              <option>All Smartphones</option>
                              <option>All Accessories</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-500 text-[8px] block uppercase">BRAND</span>
                            <select className="w-full p-2 bg-black border border-gray-850 rounded text-gray-300">
                              <option>HP</option>
                              <option>Samsung</option>
                              <option>Apple</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#181822] border border-gray-800 p-4 rounded-2xl space-y-3">
                        <span className="text-[9px] font-black text-gray-400 block uppercase">2. ACTION TO EXECUTE</span>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <span className="text-gray-500 text-[8px] block uppercase">MARKUP TYPE</span>
                            <select 
                              value={bulkMarkupType} 
                              onChange={(e) => setBulkMarkupType(e.target.value as any)}
                              className="w-full p-2 bg-black border border-gray-850 rounded text-gray-300"
                            >
                              <option value="percent">Percentage Markup (%)</option>
                              <option value="fixed">Fixed Added GHS Amount</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-500 text-[8px] block uppercase">VALUE</span>
                            <input 
                              type="number" 
                              value={bulkMarkupPercent} 
                              onChange={(e) => setBulkMarkupPercent(parseInt(e.target.value))}
                              className="w-full p-2 bg-black border border-gray-850 rounded text-amber-500 font-bold" 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#181822] border border-gray-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-gray-400 block uppercase">3. TELEMETRY ESTIMATE</span>
                          <p className="text-[10px] text-gray-400 leading-normal">This bulk operation will modify approximately <strong>1,429 items</strong> in the computing catalog. Estimating standard margins to fluctuate by +{bulkMarkupPercent}%.</p>
                        </div>
                        <button 
                          onClick={() => {
                            setLocalProducts(prev => prev.map(p => ({ ...p, priceGHS: Math.round(p.priceGHS * 1.05) })));
                          }}
                          className="w-full p-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-bold font-mono text-[11px] transition text-center uppercase"
                        >
                          Execute Transmute Calculation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 12: AI ASSISTANT PANEL */}
              {activeTab === 'ai_assistant' && (
                <div className="space-y-6">
                  <div className="bg-[#121216] border border-gray-800 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono flex items-center gap-1.5">
                      <Bot size={14} className="text-amber-500" />
                      Interactive Catalog Assistant & Bulk Command Parser
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono">Speak in natural language to adjust pricing, find duplications, resolve SKUs or compile original SEO tags.</p>

                    <div className="border border-gray-850 rounded-2xl p-4 h-64 bg-black/40 overflow-y-auto space-y-4">
                      {aiAssistantLogs.map((log, idx) => (
                        <div key={idx} className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-2xl max-w-xl leading-normal text-xs font-mono space-y-2 ${
                            log.sender === 'user' 
                              ? 'bg-[#0066FF] text-white rounded-tr-none' 
                              : 'bg-gray-850 text-gray-300 rounded-tl-none border border-gray-800'
                          }`}>
                            <p className="whitespace-pre-line">{log.text}</p>
                            {log.action && (
                              <button 
                                onClick={log.action.run}
                                className="mt-2.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-bold rounded-lg transition uppercase flex items-center gap-1"
                              >
                                <Play size={10} />
                                {log.action.label}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {isAiAssistantReplying && (
                        <div className="flex justify-start">
                          <div className="p-3 bg-gray-850 border border-gray-800 text-gray-400 text-xs font-mono rounded-2xl rounded-tl-none animate-pulse">
                            Thinking of bulk plan...
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2.5 items-center">
                      <input 
                        type="text" 
                        placeholder="Say e.g. 'increase samsung phone prices by 5%', 'find duplicate products' or 'generate hp descriptions'..."
                        value={aiAssistantInput}
                        onChange={(e) => setAiAssistantInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiAssistantMessage()}
                        className="flex-1 p-3 bg-black border border-gray-800 rounded-xl text-xs font-mono text-white placeholder:text-gray-600 focus:border-amber-500 outline-none"
                      />
                      <button 
                        onClick={handleAiAssistantMessage}
                        className="p-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl transition"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 13: PRODUCT INTELLIGENCE */}
              {activeTab === 'product_intelligence' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#121216] border border-gray-800 rounded-2xl p-4 space-y-3">
                      <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-green-400" />
                        Highest Profit Margin Stock
                      </h3>
                      <div className="border border-gray-850 rounded-xl overflow-hidden text-[10px] bg-black/40 font-mono">
                        <div className="bg-[#18181F] p-2 flex justify-between text-gray-400">
                          <span>Product</span>
                          <span>Est. Profit</span>
                        </div>
                        {localProducts.slice(0, 3).map(p => (
                          <div key={p.id} className="p-2 border-t border-gray-850 flex justify-between">
                            <span className="text-white font-bold">{p.name}</span>
                            <span className="text-green-400 font-extrabold">GHS {Math.round(p.priceGHS * 0.2)} (20%)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#121216] border border-gray-800 rounded-2xl p-4 space-y-3">
                      <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-red-400" />
                        Dead Inventory Warning (&gt;90 Days Stagnant)
                      </h3>
                      <div className="border border-gray-850 rounded-xl overflow-hidden text-[10px] bg-black/40 font-mono">
                        <div className="bg-[#18181F] p-2 flex justify-between text-gray-400">
                          <span>Product Variant</span>
                          <span>Last View Count</span>
                        </div>
                        <div className="p-2 flex justify-between text-gray-300">
                          <span>Anker PowerPort III GaN</span>
                          <span className="text-red-400 font-bold">2 views (0 sales)</span>
                        </div>
                        <div className="p-2 border-t border-gray-850 flex justify-between text-gray-300">
                          <span>TP-Link Kasa Bulb</span>
                          <span className="text-red-400 font-bold">5 views (1 sale)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 14: DUPLICATE CHECKER */}
              {activeTab === 'duplicate_checker' && (
                <div className="space-y-6">
                  <div className="bg-[#121216] border border-gray-800 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono">
                      DUPLICITY SCALING & MERGER DESK
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono">Review listings with matching features or variants to prevent cannibalizing web indices.</p>

                    <div className="space-y-3">
                      {detectedDuplicates.map((grp, idx) => (
                        <div key={idx} className="bg-[#181822] border border-gray-800 p-4 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="font-extrabold text-white">{grp.name}</span>
                            <span className="text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full text-[9px]">
                              {grp.similarity}% Overlap Similarity
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-gray-400">
                            {grp.items.map((item, i) => (
                              <div key={i} className="bg-black/30 border border-gray-850 p-2.5 rounded-xl space-y-1">
                                <span className="font-bold text-gray-300 block">{item.name}</span>
                                <p className="text-gray-500 text-[9px] truncate">{item.description}</p>
                                <span className="text-amber-500 font-bold">Price: GHS {item.priceGHS}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2 font-mono text-[10px]">
                            <button 
                              onClick={() => {
                                setLocalProducts(prev => prev.filter(p => p.id !== grp.items[0].id));
                              }}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-black font-bold rounded-lg transition"
                            >
                              Discard Older Duplicate
                            </button>
                            <button 
                              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-750 text-gray-300 rounded-lg transition"
                            >
                              Merge Specifications Table
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 15: WEBSITE CMS */}
              {activeTab === 'website_cms' && (
                <div className="space-y-6">
                  <div className="bg-[#121216] border border-gray-800 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono flex items-center gap-1.5">
                          <Layout size={14} className="text-amber-500" />
                          Website Layout Studio with Drag-and-Drop Order Editor
                        </h3>
                        <p className="text-[10px] text-gray-500 font-mono">Rearrange web layout blocks and preview changes in real-time before publishing pages.</p>
                      </div>

                      {/* Page selection tabs */}
                      <div className="flex bg-black border border-gray-800 p-1 rounded-xl gap-1 text-[9px] font-mono font-bold text-gray-400">
                        {['homepage', 'hero', 'featured', 'repair', 'blog'].map(pg => (
                          <button 
                            key={pg} 
                            onClick={() => setCmsPage(pg as any)}
                            className={`px-2 py-1 rounded-lg uppercase ${cmsPage === pg ? 'bg-amber-500 text-black font-extrabold' : 'hover:text-white'}`}
                          >
                            {pg}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Interactive Drag & Drop Area */}
                      <div className="lg:col-span-5 space-y-3 font-mono text-xs">
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block pb-1">Layout Block Order (Drag to Rearrange)</span>
                        
                        <div className="space-y-2.5">
                          {cmsBlocks.map((blk, idx) => (
                            <div 
                              key={blk.id}
                              draggable
                              onDragStart={() => handleBlockDragStart(idx)}
                              onDragOver={(e) => handleBlockDragOver(e, idx)}
                              className="bg-[#181822] border border-gray-850 p-3.5 rounded-2xl cursor-grab active:cursor-grabbing hover:border-amber-500/40 transition flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-gray-800 rounded-lg text-gray-400">
                                  <Layout size={12} />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[10px] text-gray-500 block uppercase font-bold">{blk.type} Block</span>
                                  <span className="font-extrabold text-white text-[11px]">{blk.title}</span>
                                </div>
                              </div>

                              <button 
                                onClick={() => handleToggleBlockVisibility(blk.id)}
                                className={`p-1.5 rounded-lg border transition ${
                                  blk.visible ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' : 'border-gray-800 text-gray-600 bg-black/40'
                                }`}
                              >
                                {blk.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Interactive Live Preview Box */}
                      <div className="lg:col-span-7 bg-black/60 border border-gray-800 rounded-3xl overflow-hidden flex flex-col justify-between">
                        <div className="p-3 bg-[#121216] border-b border-gray-800 text-[10px] font-mono text-gray-400 flex justify-between items-center">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Live Website Sandbox Preview
                          </span>
                          <span className="text-gray-500 uppercase">immortalelectronics.com.gh</span>
                        </div>

                        {/* Visual mockup frames */}
                        <div className="p-5 flex-1 min-h-[300px] overflow-y-auto space-y-4 font-sans max-h-96">
                          {cmsBlocks.filter(b => b.visible).map((b) => (
                            <div key={b.id} className="relative transition-all duration-300">
                              {b.type === 'hero' && (
                                <div className="relative h-44 rounded-2xl overflow-hidden bg-cover bg-center flex items-center p-6" style={{ backgroundImage: `url(${b.bgImage})` }}>
                                  <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"></div>
                                  <div className="relative z-10 space-y-1.5 max-w-sm">
                                    <span className="text-[8px] bg-amber-500 text-black font-black uppercase tracking-widest px-2 py-0.5 rounded-full font-mono">ACCRA SELECTION</span>
                                    <h2 className="text-xs font-black text-white tracking-tight uppercase leading-snug">{b.title}</h2>
                                    <p className="text-[9px] text-gray-300 leading-normal">{b.subtitle}</p>
                                    <button className="px-2.5 py-1 bg-amber-500 text-black text-[9px] font-bold rounded-lg uppercase font-mono">{b.buttonText}</button>
                                  </div>
                                </div>
                              )}

                              {b.type === 'featured' && (
                                <div className="bg-[#121216]/60 border border-gray-850 p-4 rounded-2xl space-y-2">
                                  <div className="text-center">
                                    <h3 className="text-[10px] font-black tracking-tight text-white uppercase">{b.title}</h3>
                                    <p className="text-[8px] text-gray-500 leading-normal">{b.subtitle}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3.5 pt-2">
                                    {localProducts.slice(0, 2).map(prod => (
                                      <div key={prod.id} className="bg-black/35 border border-gray-850 p-2 rounded-xl text-center space-y-1.5">
                                        <img src={prod.image} className="w-12 h-12 mx-auto rounded-lg object-cover" onError={handleImageError} />
                                        <div className="space-y-0.5">
                                          <span className="text-[9px] font-extrabold text-white block truncate">{prod.name}</span>
                                          <span className="text-[8px] text-amber-500 font-mono">GHS {prod.priceGHS}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {b.type === 'repair' && (
                                <div className="bg-[#121216]/60 border border-gray-850 p-4 rounded-2xl flex justify-between items-center">
                                  <div className="space-y-1">
                                    <h3 className="text-[10px] font-bold tracking-tight text-white uppercase">{b.title}</h3>
                                    <p className="text-[8px] text-gray-400 leading-normal">{b.subtitle}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-mono font-black text-green-400 block">{b.priceStarts}</span>
                                    <span className="text-[7px] text-gray-500 font-mono uppercase block">Estimated cost</span>
                                  </div>
                                </div>
                              )}

                              {b.type === 'footer' && (
                                <div className="border-t border-gray-850 pt-3 text-center space-y-1 text-[8px] text-gray-500">
                                  <span className="font-bold text-gray-400 block">{b.title}</span>
                                  <p>{b.subtitle}</p>
                                  <span className="text-amber-500/60 font-mono block">{b.phone}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={() => {
                            // Deploys block edits
                          }}
                          className="w-full p-2.5 bg-green-500 hover:bg-green-600 text-black font-bold font-mono text-[10px] transition text-center uppercase"
                        >
                          Publish and Update CMS Live Pages
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 16: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="bg-[#121216] border border-gray-800 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-tight text-white font-mono flex items-center gap-1.5">
                      <Settings size={14} className="text-amber-500" />
                      Global Pricing Markup & Synchronization Logic Settings
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="bg-[#181822] border border-gray-800 p-4 rounded-2xl space-y-3">
                        <span className="text-[9px] font-black text-amber-500 block uppercase">SMART PRICING MARKUP RULES</span>
                        
                        <div className="space-y-3 text-[10px]">
                          <div className="space-y-1">
                            <span className="text-gray-500 block">DEFAULT RETAIL MARKUP PERCENT (%)</span>
                            <input type="number" defaultValue={15} className="w-full p-2 bg-black border border-gray-850 rounded text-amber-500 font-bold" />
                          </div>

                          <div className="space-y-1">
                            <span className="text-gray-500 block">CATEGORY-SPECIFIC MARKUP (COMPUTING)</span>
                            <input type="number" defaultValue={18} className="w-full p-2 bg-black border border-gray-850 rounded text-gray-300" />
                          </div>

                          <div className="space-y-1">
                            <span className="text-gray-500 block">BRAND-SPECIFIC MARKUP (SAMSUNG)</span>
                            <input type="number" defaultValue={12} className="w-full p-2 bg-black border border-gray-850 rounded text-gray-300" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#181822] border border-gray-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-[9px] font-black text-amber-500 block uppercase">AUDIT HISTORY LOG</span>
                          <div className="space-y-2 max-h-40 overflow-y-auto text-[9px] text-gray-400 leading-relaxed pr-1">
                            <div>• <strong>Benjamin Danso (CEO)</strong> published 12 items via Anker CSV on 2026-07-10 11:30</div>
                            <div className="border-t border-gray-850 my-1 pt-1">• <strong>Isaac</strong> triggered manual pull for Samsung Direct Feed API on 2026-07-10 08:00</div>
                            <div className="border-t border-gray-850 my-1 pt-1">• <strong>System</strong> resolved 2 HP duplicates on 2026-07-09 15:45</div>
                          </div>
                        </div>

                        <button className="w-full p-2 bg-amber-500 hover:bg-amber-600 text-black font-bold font-mono text-[10px] uppercase transition text-center rounded-xl">
                          Save Settings Configurations
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* DETAILED WORKSPACE EDIT DIALOG MODAL (SLIDE OVER) */}
      <AnimatePresence>
        {reviewProduct && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-end z-50">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="w-full max-w-xl bg-[#0E0E12] border-l border-gray-800 h-full flex flex-col justify-between p-5"
            >
              <div className="space-y-4 overflow-y-auto pr-1">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-amber-500" size={16} />
                    <span className="text-xs font-black font-mono text-white uppercase">Validate & Refine Draft Listing</span>
                  </div>
                  <button 
                    onClick={() => setReviewProduct(null)}
                    className="p-1.5 hover:bg-gray-800 text-gray-500 hover:text-white rounded-lg transition"
                  >
                    <EyeOff size={14} />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs font-mono">
                  {/* Validation warnings banner */}
                  {reviewProduct.flags.length > 0 && (
                    <div className="p-3 bg-red-500/15 border border-red-500/25 rounded-2xl space-y-1.5">
                      <span className="text-[9px] text-red-400 font-black uppercase tracking-wider block">[VALIDATION ERRORS CHECKLIST]</span>
                      <ul className="list-disc pl-4 text-[10px] text-gray-300 space-y-0.5">
                        {reviewProduct.flags.map((flg, i) => (
                          <li key={i}>{flg}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-500 block uppercase font-bold">Product Name</span>
                    <input 
                      type="text" 
                      value={reviewProduct.name} 
                      onChange={(e) => setReviewProduct({ ...reviewProduct, name: e.target.value })}
                      className="w-full p-2 bg-black border border-gray-850 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-500 block uppercase font-bold">Brand</span>
                      <input 
                        type="text" 
                        value={reviewProduct.brand} 
                        onChange={(e) => setReviewProduct({ ...reviewProduct, brand: e.target.value })}
                        className="w-full p-2 bg-black border border-gray-850 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-500 block uppercase font-bold">Model Number</span>
                      <input 
                        type="text" 
                        value={reviewProduct.model} 
                        onChange={(e) => setReviewProduct({ ...reviewProduct, model: e.target.value })}
                        className="w-full p-2 bg-black border border-gray-850 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-500 block uppercase font-bold">Cost Price (GHS)</span>
                      <input 
                        type="number" 
                        value={reviewProduct.costPriceGHS} 
                        onChange={(e) => setReviewProduct({ ...reviewProduct, costPriceGHS: parseFloat(e.target.value) })}
                        className="w-full p-2 bg-black border border-gray-850 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-500 block uppercase font-bold">Selling Price (GHS)</span>
                      <input 
                        type="number" 
                        value={reviewProduct.priceGHS} 
                        onChange={(e) => setReviewProduct({ ...reviewProduct, priceGHS: parseFloat(e.target.value) })}
                        className="w-full p-2 bg-black border border-gray-850 rounded-xl text-xs text-amber-500 font-bold font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-500 block uppercase font-bold">Current Stock</span>
                      <input 
                        type="number" 
                        value={reviewProduct.stock} 
                        onChange={(e) => setReviewProduct({ ...reviewProduct, stock: parseInt(e.target.value) })}
                        className="w-full p-2 bg-black border border-gray-850 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-500 block uppercase font-bold">SKU Code</span>
                      <input 
                        type="text" 
                        value={reviewProduct.sku} 
                        onChange={(e) => setReviewProduct({ ...reviewProduct, sku: e.target.value })}
                        placeholder="UNASSIGNED"
                        className="w-full p-2 bg-black border border-gray-850 rounded-xl text-xs text-white font-mono placeholder:text-gray-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-500 block uppercase font-bold">EAN Barcode</span>
                      <input 
                        type="text" 
                        value={reviewProduct.barcode} 
                        onChange={(e) => setReviewProduct({ ...reviewProduct, barcode: e.target.value })}
                        placeholder="UNASSIGNED"
                        className="w-full p-2 bg-black border border-gray-850 rounded-xl text-xs text-white font-mono placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-500 block uppercase font-bold">Original Marketing Description</span>
                    <textarea 
                      rows={4}
                      value={reviewProduct.description} 
                      onChange={(e) => setReviewProduct({ ...reviewProduct, description: e.target.value })}
                      className="w-full p-2 bg-black border border-gray-850 rounded-xl text-xs text-gray-300 font-sans leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4 flex gap-3 font-mono text-[11px]">
                <button 
                  onClick={() => setReviewProduct(null)}
                  className="flex-1 p-2 bg-gray-800 hover:bg-gray-750 text-gray-300 rounded-xl transition text-center font-bold"
                >
                  Save Workspace Changes
                </button>
                <button 
                  onClick={() => {
                    handlePublishQueueItem(reviewProduct);
                  }}
                  className="flex-1 p-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition text-center uppercase"
                >
                  Approve & Deploy Live
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
