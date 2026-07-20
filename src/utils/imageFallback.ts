import React from 'react';

// A beautiful, high-tech colorful gradient as an SVG data URL (self-contained, no network dependency)
export const COLORFUL_GRADIENT_FALLBACK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="50%" stop-color="%234338ca"/><stop offset="100%" stop-color="%23311042"/></linearGradient></defs><rect width="600" height="400" fill="url(%23g)"/><g opacity="0.25"><circle cx="150" cy="150" r="180" fill="%234f46e5" filter="blur(60px)"/><circle cx="450" cy="250" r="150" fill="%23db2777" filter="blur(50px)"/></g><rect x="20" y="20" width="560" height="360" rx="12" fill="none" stroke="white" stroke-width="1.5" stroke-dasharray="8,8" opacity="0.2"/><path d="M280 150h40v40h-40z" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round" opacity="0.4"/><circle cx="300" cy="170" r="12" fill="none" stroke="white" stroke-width="2" opacity="0.4"/><text x="50%" y="225%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="20" letter-spacing="1.5" opacity="0.85">PREMIUM PRODUCT</text><text x="50%" y="255%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="12" letter-spacing="0.5">Image Pending Import</text></svg>`;

// A high-quality default product placeholder image from Unsplash
export const HIGH_QUALITY_PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";

/**
 * Standard image error handler that replaces broken image URLs first with 
 * a premium Unsplash placeholder, and if that also fails (or is offline), 
 * switches to a beautiful inline CSS/SVG gradient.
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  const count = parseInt(target.getAttribute('data-error-count') || '0', 10);
  
  if (count >= 2) {
    // Avoid any potential infinite loop
    return;
  }
  
  target.setAttribute('data-error-count', String(count + 1));
  
  if (count === 0) {
    target.src = HIGH_QUALITY_PLACEHOLDER;
  } else if (count === 1) {
    target.src = COLORFUL_GRADIENT_FALLBACK;
  }
};

/**
 * Standard image error handler that uses the self-contained SVG colorful gradient immediately.
 * Great for situations where internet connection might be spotty or offline design-first layouts.
 */
export const handleImageErrorWithGradient = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  const count = parseInt(target.getAttribute('data-error-count') || '0', 10);
  
  if (count >= 1) {
    return;
  }
  
  target.setAttribute('data-error-count', String(count + 1));
  target.src = COLORFUL_GRADIENT_FALLBACK;
};
