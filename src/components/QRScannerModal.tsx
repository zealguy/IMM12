/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Camera, QrCode, Sparkles, RefreshCw, AlertCircle, CheckCircle, Search, Play, Volume2,
  Copy, Link, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { handleImageError } from '../utils/imageFallback';

interface QRScannerModalProps {
  products: Product[];
  onClose: () => void;
  onScanSuccess: (searchQuery: string) => void;
}

interface ScanTarget {
  name: string;
  code: string;
  category: string;
  product: Product | undefined;
}

export default function QRScannerModal({ products, onClose, onScanSuccess }: QRScannerModalProps) {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<ScanTarget | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Manual scan link utilities
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  
  const findProductFromInput = (inputVal: string): Product | undefined => {
    const clean = inputVal.trim();
    if (!clean) return undefined;
    
    // Check direct match
    let match = products.find(p => p.id === clean);
    if (match) return match;

    // Check query params in case they paste a scan URL
    try {
      if (clean.includes('http') || clean.includes('?') || clean.includes('scan=')) {
        const urlPart = clean.split('?')[1] || clean;
        const params = new URLSearchParams(urlPart);
        const scanVal = params.get('scan');
        if (scanVal) {
          match = products.find(p => p.id === scanVal);
          if (match) return match;
        }
      }
    } catch (e) {
      console.warn('URL parsing error:', e);
    }

    // Substring or fallback match
    return products.find(p => 
      p.id.toLowerCase().includes(clean.toLowerCase()) ||
      p.name.toLowerCase().includes(clean.toLowerCase()) ||
      p.brand.toLowerCase().includes(clean.toLowerCase())
    );
  };

  const handleCopyProductLink = (prodId: string) => {
    if (!prodId) return;
    const currentOrigin = window.location.origin;
    const scanLink = `${currentOrigin}?scan=${prodId}`;
    navigator.clipboard.writeText(scanLink).then(() => {
      setCopiedProductId(prodId);
      setTimeout(() => {
        setCopiedProductId(null);
      }, 2000);
    }).catch(err => {
      console.error('Clipboard copy failed:', err);
    });
  };

  const handleManualScanSubmit = (inputValue: string) => {
    if (!inputValue.trim()) return;
    const matchedProd = findProductFromInput(inputValue);
    
    handleCodeDetected({
      name: matchedProd ? matchedProd.name : `Tag "${inputValue}"`,
      code: matchedProd ? `SCAN-${matchedProd.id.toUpperCase()}` : `MANUAL-${inputValue.toUpperCase()}`,
      category: matchedProd ? matchedProd.category : 'General',
      product: matchedProd
    });
  };
  
  // Audio beep player using Web Audio API
  const playBeepSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      
      // Sweep frequency up slightly for a nice diagnostic scan success sound
      osc.frequency.exponentialRampToValueAtTime(1150, ctx.currentTime + 0.12);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (err) {
      console.warn('Web Audio API was blocked or not supported:', err);
    }
  };

  // Find products that map well to our simulated QR targets
  const getProductByKeyword = (keyword: string): Product | undefined => {
    return products.find(p => 
      p.name.toLowerCase().includes(keyword.toLowerCase()) || 
      p.brand.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Predefined QR scan targets for testing
  const scanTargets: ScanTarget[] = [
    { name: 'Apple iPhone 15 Pro Max', code: 'QR-IPHONE15-PRO', category: 'Smartphones', product: getProductByKeyword('iPhone 15') },
    { name: 'Samsung Galaxy S24 Ultra', code: 'QR-GALAXY-S24', category: 'Smartphones', product: getProductByKeyword('S24') },
    { name: 'MacBook Pro M3 Max', code: 'QR-MACBOOK-M3', category: 'Computing', product: getProductByKeyword('MacBook') },
    { name: 'Anker Power Bank 20K', code: 'QR-ANKER-PB', category: 'Accessories', product: getProductByKeyword('Anker') },
    { name: 'Sony WH-1000XM5 Headphones', code: 'QR-SONY-XM5', category: 'Accessories', product: getProductByKeyword('Sony') || getProductByKeyword('Headphones') },
  ];

  // Request camera access
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      
      setStream(mediaStream);
      setHasCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera stream request failed:', err);
      setHasCamera(false);
      setCameraError(err.message || 'Permission denied or no camera device found.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle a detected match (simulated or real)
  const handleCodeDetected = (target: ScanTarget) => {
    playBeepSound();
    setScanResult(target);
    setIsScanning(false);
  };

  // Simulated auto-scanning detector loop (checks if camera is active and "finds" a QR code occasionally)
  useEffect(() => {
    if (!isScanning || scanResult || !hasCamera) return;

    // Simulate auto-detecting a QR code in the camera frame after 4.5 seconds
    const timer = setTimeout(() => {
      // Pick a random product QR target that exists in products
      const validTargets = scanTargets.filter(t => t.product !== undefined);
      if (validTargets.length > 0) {
        const randomTarget = validTargets[Math.floor(Math.random() * validTargets.length)];
        handleCodeDetected(randomTarget);
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [isScanning, scanResult, hasCamera, products]);

  const handleApplyResult = () => {
    if (scanResult) {
      // Send product name or code as search query
      const query = scanResult.product ? scanResult.product.name : scanResult.name;
      onScanSuccess(query);
      onClose();
    }
  };

  // Auto-apply and close 1.5 seconds after a successful scan match
  useEffect(() => {
    if (!scanResult) return;

    const timer = setTimeout(() => {
      handleApplyResult();
    }, 1500);

    return () => clearTimeout(timer);
  }, [scanResult]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-[#0B0B0B] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden text-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        id="qr-scanner-modal"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/20 via-black to-emerald-950/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <QrCode className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wider uppercase font-mono flex items-center gap-2">
                <span>Accra Store QR Code Lens</span>
                <span className="bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded font-sans">
                  Live Stream
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">Scan product shelf tags or select diagnostic simulator codes below.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
            id="close-qr-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Screen */}
        <div className="p-6 flex flex-col md:flex-row gap-6 items-stretch justify-between">
          
          {/* Left Column: Live camera view viewport */}
          <div className="flex-1 flex flex-col space-y-3 min-h-[280px]">
            <span className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Camera Viewport</span>
            </span>

            <div className="relative flex-1 bg-black rounded-xl border border-gray-800/80 overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
              
              {isScanning ? (
                <>
                  {/* Web Camera Active View */}
                  {hasCamera ? (
                    <div className="relative w-full h-full min-h-[220px] flex items-center justify-center">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover filter brightness-95"
                      />
                      
                      {/* Laser scanner element */}
                      <div className="absolute inset-x-0 h-0.5 bg-emerald-500/80 shadow-[0_0_8px_#10B981] animate-bounce top-1/4 z-10" />

                      {/* Scanning frame bounds overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-44 h-44 border-2 border-emerald-500/40 rounded-xl relative">
                          <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></span>
                          <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></span>
                          <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></span>
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></span>
                        </div>
                      </div>

                      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 px-2.5 py-1 rounded text-[9px] font-mono font-black uppercase text-emerald-400 tracking-wider z-10 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        Scanning Live Stream...
                      </span>
                    </div>
                  ) : (
                    /* Error / Pending / Simulator fallback overlay */
                    <div className="p-4 text-center space-y-4 w-full flex flex-col justify-center items-center">
                      {hasCamera === false ? (
                        <div className="w-full max-w-sm space-y-3">
                          <div className="flex flex-col items-center">
                            <AlertCircle className="w-8 h-8 text-amber-500" />
                            <h4 className="text-xs font-mono text-amber-400 font-bold uppercase mt-1">Webcam Offline / Restricted</h4>
                            <p className="text-[10px] text-gray-400 max-w-xs mt-0.5">
                              The camera is unavailable in your browser. Choose a product to copy its direct scan link below, or type a Product ID to test manual scan.
                            </p>
                          </div>

                          {/* Quick Product Select & Copy Scan Link Utility */}
                          <div className="bg-[#121212] border border-gray-800 p-2.5 rounded-xl space-y-2 text-left">
                            <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-wider block">
                              1. Select Product & Copy Scan Link
                            </span>
                            <div className="flex gap-1.5">
                              <select
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                className="flex-1 bg-black border border-gray-850 text-xs px-2 py-1.5 rounded text-white focus:outline-none focus:border-emerald-500"
                              >
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.brand} {p.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => handleCopyProductLink(selectedProductId)}
                                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-extrabold rounded-lg flex items-center gap-1.5 shrink-0 transition-all active:scale-[0.98]"
                                title="Copy direct scan link to clipboard"
                                id="copy-selected-link-btn"
                              >
                                {copiedProductId === selectedProductId ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in-50" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Link</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Manual input form */}
                          <div className="bg-[#121212] border border-gray-800 p-2.5 rounded-xl space-y-2 text-left">
                            <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-wider block">
                              2. Paste Link or Type Product ID
                            </span>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                placeholder="Paste scan link or type product ID..."
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                className="flex-1 bg-black border border-gray-850 text-xs px-2.5 py-1.5 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                                id="viewport-manual-input"
                              />
                              <button
                                type="button"
                                onClick={() => handleManualScanSubmit(manualCode)}
                                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black rounded-lg transition-all active:scale-[0.98]"
                                id="viewport-apply-manual-btn"
                              >
                                Apply Scan
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-xs py-10">
                          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                          <p className="text-[10px] text-gray-400 font-mono mt-3">Requesting client camera system stream...</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Scan Success Screen */
                <div className="p-6 text-center space-y-4 flex flex-col items-center justify-center h-full w-full bg-emerald-950/10">
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="p-3 bg-emerald-500/15 rounded-full border border-emerald-500/30 text-emerald-400"
                  >
                    <CheckCircle className="w-10 h-10" />
                  </motion.div>
                  
                  <div className="space-y-1.5 max-w-sm">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">Decoded Successfully</span>
                    <h4 className="text-sm font-black text-white font-mono">{scanResult?.name}</h4>
                    <span className="inline-block bg-gray-800 text-[10px] font-mono text-gray-400 px-2.5 py-0.5 rounded-md border border-gray-700">
                      {scanResult?.code}
                    </span>
                  </div>

                  {scanResult?.product && (
                    <div className="flex items-center gap-3 p-2 bg-black/40 border border-gray-800 rounded-lg w-full max-w-xs text-left">
                      <img src={scanResult.product.image} alt={scanResult.product.name} className="w-10 h-10 object-contain" onError={handleImageError} />
                      <div className="overflow-hidden">
                        <span className="text-[9px] font-mono text-amber-500 font-bold block">{scanResult.product.brand}</span>
                        <h5 className="text-[11px] font-bold text-white truncate">{scanResult.product.name}</h5>
                      </div>
                    </div>
                  )}

                  {/* Auto-apply countdown indicator */}
                  <div className="w-full max-w-xs space-y-1.5 pt-1">
                    <div className="h-1 bg-gray-950 dark:bg-black/40 rounded-full overflow-hidden border border-gray-800">
                      <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 1.5, ease: "linear" }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                    <span className="text-[9px] text-gray-500 font-mono block">
                      Auto-applying scan and redirecting in 1.5s...
                    </span>
                  </div>

                  <div className="flex gap-2 w-full max-w-xs pt-2">
                    <button
                      onClick={() => {
                        setIsScanning(true);
                        setScanResult(null);
                        startCamera();
                      }}
                      className="flex-1 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-300 text-[11px] font-bold rounded-lg border border-gray-800 transition"
                      id="scan-another-btn"
                    >
                      Scan Another
                    </button>
                    <button
                      onClick={handleApplyResult}
                      className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black text-[11px] font-black rounded-lg transition shadow-md shadow-emerald-500/10 flex items-center justify-center space-x-1"
                      id="search-device-btn"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search Device</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Simulator desk & testing tools */}
          <div className="w-full md:w-64 flex flex-col space-y-3.5 border-t md:border-t-0 md:border-l border-gray-800 pt-5 md:pt-0 md:pl-5">
            <span className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Diagnostic Simulator Codes</span>
            </span>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[250px] no-scrollbar pr-1">
              {scanTargets.map((target) => {
                const isAvailable = target.product !== undefined;
                return (
                  <button
                    key={target.code}
                    type="button"
                    onClick={() => handleCodeDetected(target)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start space-x-2.5 group relative overflow-hidden ${
                      !isAvailable 
                        ? 'opacity-40 pointer-events-none' 
                        : 'border-gray-800 bg-black/40 hover:bg-gray-850 hover:border-emerald-500/30'
                    }`}
                  >
                    {/* Tiny visual representation of QR code */}
                    <div className="w-8 h-8 rounded bg-white p-1 flex items-center justify-center shrink-0 border border-gray-800 group-hover:scale-105 transition-transform">
                      <QrCode className="w-full h-full text-black" />
                    </div>

                    <div className="overflow-hidden flex-1">
                      <span className="text-[9px] font-mono text-gray-500 block">
                        {target.code}
                      </span>
                      <h5 className="text-[11px] font-black text-white group-hover:text-emerald-400 transition-colors truncate">
                        {target.name}
                      </h5>
                      <span className="text-[9px] font-mono text-gray-400 block truncate">
                        Matches: {target.product?.name || 'Store inventory item'}
                      </span>
                    </div>

                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Manual input in case they want to enter something else */}
            <div className="border-t border-gray-800 pt-3.5 space-y-3">
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block">Manual scan bypass</span>
              
              {/* Product link helper select + Copy Link */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-gray-500 uppercase block">1. Choose item & copy scan URL</label>
                <div className="flex gap-1.5">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 bg-black border border-gray-800 text-[10px] px-2 py-1 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.brand} {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleCopyProductLink(selectedProductId)}
                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all"
                    id="right-copy-link-btn"
                  >
                    {copiedProductId === selectedProductId ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Paste & Apply Input */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-gray-500 uppercase block">2. Paste scan URL or enter Product ID</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Enter QR, URL, or product ID..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="flex-1 bg-black border border-gray-800 text-xs px-2.5 py-1.5 rounded-lg text-white focus:outline-none focus:border-emerald-500 placeholder-gray-600"
                    id="right-manual-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleManualScanSubmit(manualCode)}
                    className="px-3 bg-emerald-500 text-black text-xs font-black rounded-lg hover:bg-emerald-600 transition"
                    id="right-apply-btn"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-black/40 flex justify-between items-center text-[10px] font-mono text-gray-400">
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Success Beep Audio Enabled</span>
          </span>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-xl transition"
            id="close-compare-desk-btn"
          >
            Close Scanner
          </button>
        </div>
      </motion.div>
    </div>
  );
}
