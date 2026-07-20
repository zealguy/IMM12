/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Camera, RotateCw, Maximize2, Sliders, Sparkles, Download, Info, Grid, 
  Tv, Check, Compass, AlertCircle, Share2, Eye, ShieldCheck, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { handleImageError } from '../utils/imageFallback';

interface ARViewModalProps {
  product: Product;
  currency: 'GHS' | 'USD';
  onClose: () => void;
}

const SIMULATED_ENVIRONMENTS = [
  {
    id: 'studio-desk',
    name: 'Modern Tech Workspace',
    url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200'
  },
  {
    id: 'store-counter',
    name: 'Accra Retail Counter',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200'
  },
  {
    id: 'coffee-table',
    name: 'Teak Coffee Table',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200'
  }
];

export default function ARViewModal({ product, currency, onClose }: ARViewModalProps) {
  // Mode configuration: 'camera' | 'simulated'
  const [viewMode, setViewMode] = useState<'camera' | 'simulated'>('simulated');
  const [selectedEnv, setSelectedEnv] = useState(SIMULATED_ENVIRONMENTS[0]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // AR Manipulations
  const [scale, setScale] = useState<number>(0.85); // 0.1 to 2.0
  const [rotation, setRotation] = useState<number>(0); // -180 to 180 deg
  const [tilt, setTilt] = useState<number>(-15); // -60 to 60 deg
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'Default');
  
  // HUD Overlays toggles
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showSpecsHUD, setShowSpecsHUD] = useState<boolean>(true);
  const [showHelp, setShowHelp] = useState<boolean>(true);
  
  // Shutter Flash & Snap Review States
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [polaroidImage, setPolaroidImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const phoneRef = useRef<HTMLDivElement | null>(null);

  // Initialize camera when viewMode changes to 'camera'
  useEffect(() => {
    if (viewMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [viewMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera stream request failed:', err);
      setCameraError('Unable to access camera. Standard browser iframe sandboxing or permission rejection may apply. Defaulting to Simulated Desk Mode!');
      setViewMode('simulated');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Synthesize realistic shutter sounds using Web Audio API
  const playShutterSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();
      
      // White noise for shutter snap
      const bufferSize = audioCtx.sampleRate * 0.08;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, audioCtx.currentTime);

      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.07);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      whiteNoise.start();

      // Sharp metallic high-pitch transient click
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(3000, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.03);

      oscGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.03);

      osc.connect(oscGain);
      oscGain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (err) {
      console.warn('Web Audio playback failed', err);
    }
  };

  // Trigger high-fidelity spatial capture
  const handleCapture = () => {
    playShutterSound();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);

    // Canvas compositor processing
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350; // Instagram portrait premium format
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Background
    const drawCompositedImage = () => {
      // 1. Draw Environment (Camera or Simulated img)
      if (viewMode === 'camera' && videoRef.current && videoRef.current.readyState >= 2) {
        // Draw centered crop of video
        const video = videoRef.current;
        const vRatio = video.videoWidth / video.videoHeight;
        const cRatio = canvas.width / canvas.height;
        let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;
        
        if (vRatio > cRatio) {
          sw = video.videoHeight * cRatio;
          sx = (video.videoWidth - sw) / 2;
        } else {
          sh = video.videoWidth / cRatio;
          sy = (video.videoHeight - sh) / 2;
        }
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      } else {
        // Draw preloaded environment image
        const envImg = new Image();
        envImg.crossOrigin = 'anonymous';
        envImg.src = selectedEnv.url;
        envImg.onload = () => {
          ctx.drawImage(envImg, 0, 0, canvas.width, canvas.height);
          drawOverlayAndSave();
        };
        return; // handle asynchronous loading
      }
      drawOverlayAndSave();
    };

    const drawOverlayAndSave = () => {
      // 2. Overlay product image
      const productImg = new Image();
      productImg.crossOrigin = 'anonymous';
      productImg.src = product.image;
      productImg.onload = () => {
        ctx.save();
        
        // Target coordinates representing the spatial placement of the gadget inside container viewport
        // Translate to the middle of the canvas for composite simulation
        ctx.translate(canvas.width / 2, canvas.height / 2 - 80);
        
        // Apply scales and angular skews
        ctx.rotate((rotation * Math.PI) / 180);
        
        // Draw colorful glowing aura highlight depending on selectedColor
        const activeColorHex = getColorHex(selectedColor);
        ctx.shadowColor = activeColorHex;
        ctx.shadowBlur = 45;
        
        // Draw the smartphone
        const phoneW = 340 * scale;
        const phoneH = 340 * (productImg.height / productImg.width) * scale;
        ctx.drawImage(productImg, -phoneW / 2, -phoneH / 2, phoneW, phoneH);
        ctx.restore();

        // 3. Draw premium glassmorphic Polaroid frames & Accra Store Watermarks
        ctx.fillStyle = 'rgba(11, 11, 11, 0.85)';
        ctx.fillRect(0, canvas.height - 180, canvas.width, 180);

        // Watermark Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 24px "Inter", sans-serif';
        ctx.fillText('IMMORTAL ELECTRONICS AR STATION', 50, canvas.height - 110);
        
        ctx.fillStyle = '#0066FF';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillText(`SPATIAL PREVIEW: ${product.name.toUpperCase()} (${selectedColor.toUpperCase()})`, 50, canvas.height - 75);

        ctx.fillStyle = 'rgba(156, 163, 175, 0.8)';
        ctx.font = '14px "Inter", sans-serif';
        ctx.fillText(`Accra, Ghana • Simulated 1:1 Scale Overlay • ${new Date().toLocaleDateString()}`, 50, canvas.height - 45);

        // Tech specs watermark right side
        ctx.fillStyle = '#F5B800';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillText('GHANA GRADE-A CERTIFIED', canvas.width - 320, canvas.height - 110);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px "Inter", sans-serif';
        ctx.fillText(`Display: ${product.specs.Display || '6.7" OLED'}`, canvas.width - 320, canvas.height - 75);
        ctx.fillText(`Authentic Store Warranty: Included`, canvas.width - 320, canvas.height - 45);

        // Generate polaroid image string
        setPolaroidImage(canvas.toDataURL('image/jpeg'));
      };
    };

    drawCompositedImage();
  };

  const downloadPolaroid = () => {
    if (!polaroidImage) return;
    setIsSaving(true);
    const link = document.createElement('a');
    link.download = `Immortal_AR_${product.name.replace(/\s+/g, '_')}_${selectedColor}.jpg`;
    link.href = polaroidImage;
    link.click();
    setIsSaving(false);
  };

  const shareToWhatsApp = () => {
    const text = `Check out this 3D AR Spatial View of the ${product.name} in my physical space from Immortal Electronics, Accra! ₵ ${product.priceGHS.toLocaleString()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Helper color map
  const getColorHex = (colorName: string): string => {
    const norm = colorName.toLowerCase();
    if (norm.includes('gray') || norm.includes('titanium')) return '#6B7280';
    if (norm.includes('blue')) return '#3B82F6';
    if (norm.includes('black') || norm.includes('dark')) return '#1F2937';
    if (norm.includes('gold') || norm.includes('yellow')) return '#F59E0B';
    if (norm.includes('green')) return '#10B981';
    if (norm.includes('white') || norm.includes('silver')) return '#E5E7EB';
    return '#0066FF'; // Default bright Immortal blue
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md overflow-hidden text-white font-sans">
      
      {/* SHUTTER FLASH OVERLAY */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Main Viewport Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden"
      >
        
        {/* Background Environment Feed */}
        <div className="absolute inset-0 w-full h-full z-0 bg-[#0B0B0B]">
          {viewMode === 'camera' ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div 
              className="w-full h-full bg-cover bg-center transition-all duration-500"
              style={{ backgroundImage: `url(${selectedEnv.url})` }}
            />
          )}

          {/* Holographic Scanlines / Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Center crosshair target */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                <div className="absolute w-6 h-0.5 bg-amber-400" />
                <div className="absolute w-0.5 h-6 bg-amber-400" />
              </div>
              
              {/* Classic AR Grid Lines */}
              <div className="w-full h-full border-t border-b border-white/5 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
              
              {/* Scanline reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0066FF]/5 to-transparent h-12 w-full animate-[bounce_8s_infinite] pointer-events-none" />
            </div>
          )}
        </div>

        {/* TOP FLOATING NAVIGATION & STATS */}
        <div className="relative w-full z-30 p-4 bg-gradient-to-b from-black/80 to-transparent flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#0066FF] rounded-xl text-white">
              <Sparkles className="w-5 h-5 animate-spin-slow text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-widest text-white uppercase flex items-center gap-2">
                IMMORTAL SPATIAL LABS
                <span className="bg-green-500 text-[8px] font-mono px-1.5 py-0.5 rounded text-black font-extrabold animate-pulse">ACTIVE AR</span>
              </h2>
              <p className="text-[10px] text-gray-400 font-mono">Calibrated virtual viewport projection of {product.name}</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-2">
            {/* Environment Toggle */}
            <div className="flex items-center bg-black/60 backdrop-blur-md rounded-xl p-0.5 border border-white/10 text-xs">
              <button 
                onClick={() => setViewMode('simulated')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${viewMode === 'simulated' ? 'bg-[#0066FF] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Tv className="w-3.5 h-3.5" />
                Showroom
              </button>
              <button 
                onClick={() => setViewMode('camera')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${viewMode === 'camera' ? 'bg-[#0066FF] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Camera className="w-3.5 h-3.5" />
                Live Camera
              </button>
            </div>

            {/* Quick Action toggles */}
            <button 
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle Grid Overlay"
              className={`p-2 rounded-xl backdrop-blur-md border transition-all ${showGrid ? 'bg-amber-400/20 text-amber-400 border-amber-400/30' : 'bg-black/40 text-gray-400 border-white/10'}`}
            >
              <Grid className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setShowSpecsHUD(!showSpecsHUD)}
              title="Toggle Specs HUD"
              className={`p-2 rounded-xl backdrop-blur-md border transition-all ${showSpecsHUD ? 'bg-[#0066FF]/20 text-[#0066FF] border-[#0066FF]/30' : 'bg-black/40 text-gray-400 border-white/10'}`}
            >
              <Info className="w-4 h-4" />
            </button>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAIN INTERACTIVE INTERFACE ZONE */}
        <div className="relative flex-1 w-full flex items-center justify-between p-4 z-20">
          
          {/* LEFT COLUMN: HOLOGRAPHIC SPECIFICATION PANEL */}
          <AnimatePresence>
            {showSpecsHUD && (
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="hidden lg:flex flex-col w-72 p-4 rounded-2xl bg-black/80 backdrop-blur-lg border border-white/10 text-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-extrabold tracking-wider font-mono text-cyan-400 text-[10px]">BLUEPRINT HUD</span>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={product.image} className="w-12 h-12 object-contain p-1 bg-white/5 rounded-lg border border-white/10" alt="" onError={handleImageError} />
                    <div>
                      <span className="font-bold text-white block">{product.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{product.brand} flagship series</span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-2.5 space-y-2">
                    <div>
                      <span className="text-[9px] text-gray-500 font-mono uppercase block">Ghana retail valuation</span>
                      <span className="text-sm font-black text-[#0066FF]">
                        {currency === 'GHS' ? `₵ ${product.priceGHS.toLocaleString()}` : `$ ${product.priceUSD.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <span className="text-[9px] text-gray-500 font-mono uppercase block">Calibrated Dimensions</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300 font-mono">
                      <div className="bg-white/5 p-1.5 rounded">
                        <span className="text-[8px] text-gray-500 block">THICKNESS</span>
                        <span>8.25 mm</span>
                      </div>
                      <div className="bg-white/5 p-1.5 rounded">
                        <span className="text-[8px] text-gray-500 block">DISPLAY</span>
                        <span>{product.specs.Display ? product.specs.Display.split(',')[0] : '6.7 in'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[9px] text-gray-500 font-mono uppercase block">Hardware Certification</span>
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 p-2 rounded-xl text-[10px] text-green-400">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-green-400" />
                      <span>Accra certified 40-point diagnostic audit approved.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CENTRAL INTERACTIVE SPATIAL OVERLAY FOR DEVICE VIEWING */}
          <div className="flex-1 h-full flex items-center justify-center relative overflow-visible">
            
            {cameraError && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-amber-400/90 text-gray-900 px-4 py-2 rounded-xl flex items-center space-x-2 text-xs font-bold shadow-lg max-w-sm text-center">
                <AlertCircle className="w-5 h-5 text-gray-900 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* DRAGGABLE DEVICE IMAGE */}
            <motion.div 
              drag
              dragMomentum={false}
              ref={phoneRef}
              className="absolute cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-300 relative z-30"
              style={{
                transform: `rotateZ(${rotation}deg) rotateX(${tilt}deg) scale(${scale})`,
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              {/* Dynamic Aura Glow behind the phone matching the selected color */}
              <div 
                className="absolute inset-0 -m-8 rounded-full blur-3xl opacity-50 transition-all duration-500"
                style={{ backgroundColor: getColorHex(selectedColor) }}
              />

              {/* Holographic scanner alignment rings */}
              <div className="absolute inset-0 -m-4 border border-[#0066FF]/30 rounded-2xl animate-[spin-slow_24s_linear_infinite]" />
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-[#0066FF]/20 animate-pulse" />

              {/* Physical phone picture */}
              <img 
                src={product.image} 
                alt={product.name}
                className="w-64 md:w-80 object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.6)] select-none pointer-events-none relative z-10 filter brightness-105"
                draggable={false}
                onError={handleImageError}
              />

              {/* Floating Holographic details tag */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/90 border border-white/20 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest font-extrabold shadow-lg flex items-center space-x-1.5 whitespace-nowrap z-20">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getColorHex(selectedColor) }} />
                <span>{product.name.toUpperCase()} • {selectedColor.toUpperCase()}</span>
              </div>
            </motion.div>

            {/* Guidelines & helpful visual targets */}
            {showHelp && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md px-4 py-2 rounded-xl text-[11px] font-mono text-center max-w-xs border border-white/10 space-y-1 z-30">
                <p className="font-extrabold text-amber-400 uppercase">Interactive Calibration</p>
                <p className="text-gray-300">Drag gadget anywhere. Use right-hand Sliders to rotate, tilt, or scale.</p>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="text-[9px] text-[#0066FF] underline font-bold mt-1 block w-full text-center hover:text-white"
                >
                  Hide Assistance
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: CONTROLS & COLOR PICKER PANEL */}
          <div className="flex flex-col w-72 p-4 rounded-2xl bg-black/80 backdrop-blur-lg border border-white/10 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-extrabold tracking-wider font-mono text-amber-400 text-[10px]">SPATIAL SYSTEM CONFIG</span>
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
            </div>

            {/* Slider 1: Scale Calibration */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                <span>SCALE ADJ (SIZE)</span>
                <span className="font-bold text-white">{(scale * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range"
                min="0.3"
                max="1.8"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Slider 2: Rotation */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                <span>ROTATE SPIN</span>
                <span className="font-bold text-white">{rotation}°</span>
              </div>
              <input 
                type="range"
                min="-180"
                max="180"
                step="5"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full accent-[#0066FF] cursor-pointer"
              />
            </div>

            {/* Slider 3: Vertical Tilt */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                <span>TILT PERSPECTIVE</span>
                <span className="font-bold text-white">{tilt}°</span>
              </div>
              <input 
                type="range"
                min="-60"
                max="60"
                step="5"
                value={tilt}
                onChange={(e) => setTilt(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Color Swappers */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[10px] text-gray-400 font-mono uppercase block">Active Color Swatch</span>
              <div className="flex flex-wrap gap-1.5">
                {product.colors.map(col => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-all ${
                      selectedColor === col 
                        ? 'bg-white text-black font-extrabold border-white' 
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated environment selectors (only visible if simulated mode active) */}
            {viewMode === 'simulated' && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[10px] text-gray-400 font-mono uppercase block">Showroom Backdrop</span>
                <div className="space-y-1">
                  {SIMULATED_ENVIRONMENTS.map(env => (
                    <button
                      key={env.id}
                      onClick={() => setSelectedEnv(env)}
                      className={`w-full p-2 rounded-lg text-left text-[11px] border flex items-center justify-between transition-all ${
                        selectedEnv.id === env.id 
                          ? 'border-[#0066FF] bg-[#0066FF]/10 text-white font-bold' 
                          : 'border-white/5 bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>{env.name}</span>
                      {selectedEnv.id === env.id && <Check className="w-3 h-3 text-[#0066FF]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM HUD ACTION SYSTEM */}
        <div className="relative w-full z-30 p-5 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-6">
            
            {/* Capture shutter trigger */}
            <button
              onClick={handleCapture}
              className="group w-16 h-16 rounded-full bg-white hover:bg-amber-400 text-black border-4 border-white/30 flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95"
              id="ar-capture-btn"
              title="Capture spatial photo"
            >
              <Camera className="w-7 h-7 text-black group-hover:rotate-12 transition-transform" />
            </button>
            
          </div>

          <div className="flex space-x-4 text-[10px] text-gray-400 font-mono">
            <span>DRAG DEVICE TO POSITION</span>
            <span>•</span>
            <span>USE SLIDERS TO FIT DESK</span>
            <span>•</span>
            <span>CLICK TO CAPTURE</span>
          </div>
        </div>

      </div>

      {/* POLAROID CAPTURED SNAPS VIEW DIALOGUE MODAL */}
      <AnimatePresence>
        {polaroidImage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center">
                <span className="font-black text-xs text-[#0066FF] tracking-widest font-mono">ACCRA HQ LABS CAPTURE</span>
                <button 
                  onClick={() => setPolaroidImage(null)}
                  className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-black dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Composite Image Preview resembling modern high-end polaroid snaps */}
              <div className="border border-gray-150 dark:border-gray-850 rounded-2xl overflow-hidden bg-gray-50 p-2 shadow-inner">
                <img src={polaroidImage} alt="Captured Spatial Composite" className="w-full h-auto object-cover rounded-xl" onError={handleImageError} />
              </div>

              {/* Info text */}
              <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                Snapshot captured with accurate 1:1 local physical scale dimensions. Share this overlay mockup directly with Immortal certified consultants in Accra!
              </p>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={downloadPolaroid}
                  disabled={isSaving}
                  className="py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0055DD] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#0066FF]/10"
                >
                  <Download className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Photo'}
                </button>

                <button
                  onClick={shareToWhatsApp}
                  className="py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-green-500/10"
                >
                  <Share2 className="w-4 h-4" />
                  Share WhatsApp
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
