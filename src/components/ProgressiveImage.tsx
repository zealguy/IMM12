/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, Zap, AlertTriangle } from 'lucide-react';
import { 
  isImageMemoryCached, 
  markImageMemoryCached, 
  getCachedImageDataURL, 
  cacheImageDataURL, 
  generateBlurredSvgPlaceholder,
  isLowBandwidthConnection 
} from '../utils/imageCache';
import { COLORFUL_GRADIENT_FALLBACK, HIGH_QUALITY_PLACEHOLDER } from '../utils/imageFallback';

export interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto' | string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  blurDataURL?: string;
  priority?: boolean;
  showCacheBadge?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onClick?: (e: React.MouseEvent) => void;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  id?: string;
}

export default function ProgressiveImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  aspectRatio = 'square',
  objectFit = 'contain',
  blurDataURL,
  priority = false,
  showCacheBadge = false,
  onError,
  onClick,
  referrerPolicy = 'no-referrer',
  id
}: ProgressiveImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State initialization
  const isAlreadyCached = isImageMemoryCached(src);
  const [isLoaded, setIsLoaded] = useState<boolean>(isAlreadyCached);
  const [displaySrc, setDisplaySrc] = useState<string>(isAlreadyCached ? src : '');
  const [hasError, setHasError] = useState<boolean>(false);
  const [isCachedFromIDB, setIsCachedFromIDB] = useState<boolean>(isAlreadyCached);
  const [isInViewport, setIsInViewport] = useState<boolean>(priority);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [isLowBandwidth] = useState<boolean>(() => isLowBandwidthConnection());

  // Generated fallback blurred SVG placeholder
  const placeholderUrl = blurDataURL || generateBlurredSvgPlaceholder(400, 400, alt || 'Product');

  // IntersectionObserver for view-port lazy loading
  useEffect(() => {
    if (priority || isInViewport) return;

    const target = containerRef.current;
    if (!target) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsInViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInViewport(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '150px' }
    );

    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [priority, isInViewport]);

  // Load Image when in viewport or when src changes
  useEffect(() => {
    if (!src) return;
    if (!isInViewport) return;

    let isMounted = true;

    const loadImage = async () => {
      // 1. Check memory cache first
      if (isImageMemoryCached(src)) {
        if (isMounted) {
          setDisplaySrc(src);
          setIsLoaded(true);
          setIsCachedFromIDB(true);
        }
        return;
      }

      // 2. Check IndexedDB cache
      try {
        const cachedData = await getCachedImageDataURL(src);
        if (cachedData && isMounted) {
          setDisplaySrc(cachedData);
          setIsLoaded(true);
          setIsCachedFromIDB(true);
          markImageMemoryCached(src);
          return;
        }
      } catch (err) {
        console.warn('Cache lookup skipped:', err);
      }

      // 3. Network fetch / image load
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = referrerPolicy;
      img.src = src;

      img.onload = () => {
        if (!isMounted) return;
        setDisplaySrc(src);
        setIsLoaded(true);
        markImageMemoryCached(src);

        // Compress and save to IndexedDB on low-bandwidth or mobile for future offline instant rendering
        if (typeof window !== 'undefined' && ('requestIdleCallback' in window || 'setTimeout' in window)) {
          const scheduleTask = (window as any).requestIdleCallback || setTimeout;
          scheduleTask(() => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = Math.min(img.naturalWidth || 400, 600);
              canvas.height = Math.min(img.naturalHeight || 400, 600);
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
                cacheImageDataURL(src, dataUrl);
              }
            } catch {
              // cross-origin canvas security restriction fallback
            }
          });
        }
      };

      img.onerror = () => {
        if (!isMounted) return;
        setErrorCount((prev) => {
          const next = prev + 1;
          if (next === 1) {
            setDisplaySrc(HIGH_QUALITY_PLACEHOLDER);
            setIsLoaded(true);
          } else {
            setDisplaySrc(COLORFUL_GRADIENT_FALLBACK);
            setHasError(true);
            setIsLoaded(true);
          }
          return next;
        });
      };
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [src, isInViewport, referrerPolicy]);

  // Handle native element error if src fails at runtime
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (errorCount === 0) {
      setErrorCount(1);
      setDisplaySrc(HIGH_QUALITY_PLACEHOLDER);
    } else if (errorCount === 1) {
      setErrorCount(2);
      setDisplaySrc(COLORFUL_GRADIENT_FALLBACK);
      setHasError(true);
    }
    if (onError) onError(e);
  };

  // Aspect ratio helper styling
  const aspectClasses = 
    aspectRatio === 'square' ? 'aspect-square' :
    aspectRatio === 'video' ? 'aspect-video' :
    aspectRatio === 'portrait' ? 'aspect-[3/4]' :
    aspectRatio === 'auto' ? 'h-auto' : aspectRatio;

  return (
    <div
      ref={containerRef}
      id={id}
      onClick={onClick}
      className={`relative overflow-hidden select-none ${aspectClasses} ${className}`}
    >
      {/* Blurred Placeholder Layer */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-0 bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden"
          >
            <img
              src={placeholderUrl}
              alt=""
              className="w-full h-full object-cover filter blur-xl scale-110 opacity-70 transition-opacity duration-300"
              aria-hidden="true"
            />
            
            {/* Pulsing skeleton overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-pulse" />
            
            {isLowBandwidth && (
              <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-mono text-amber-400 flex items-center gap-1 z-10">
                <Wifi size={10} className="animate-pulse" />
                <span>Optimizing Data</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Image Layer */}
      {(isInViewport || isAlreadyCached) && displaySrc && (
        <motion.img
          src={displaySrc}
          alt={alt}
          referrerPolicy={referrerPolicy}
          onError={handleImgError}
          className={`w-full h-full transition-all duration-500 ease-out ${
            objectFit === 'contain' ? 'object-contain' :
            objectFit === 'cover' ? 'object-cover' :
            objectFit === 'fill' ? 'object-fill' :
            objectFit === 'scale-down' ? 'object-scale-down' : 'object-none'
          } ${
            isLoaded 
              ? 'opacity-100 blur-0 scale-100' 
              : 'opacity-0 blur-md scale-102'
          } ${imgClassName}`}
          style={{ willChange: 'opacity, filter, transform' }}
        />
      )}

      {/* Cache / Bandwidth Badge */}
      {showCacheBadge && isLoaded && (
        <div className="absolute top-2 right-2 z-10 pointer-events-none">
          {isCachedFromIDB ? (
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[9px] font-mono font-bold flex items-center gap-1 shadow-sm backdrop-blur-md">
              <Zap size={10} /> 0ms Cached
            </span>
          ) : isLowBandwidth ? (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-500/90 text-white text-[9px] font-mono font-bold flex items-center gap-1 shadow-sm backdrop-blur-md">
              <Wifi size={10} /> Saved Mobile Data
            </span>
          ) : null}
        </div>
      )}

      {/* Error Fallback Banner */}
      {hasError && (
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-red-500/80 text-white text-[9px] font-mono flex items-center gap-1">
          <AlertTriangle size={10} />
          <span>Fallback Image</span>
        </div>
      )}
    </div>
  );
}
