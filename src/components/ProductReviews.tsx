/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Star, Camera, Upload, Trash2, X, MessageSquare, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Review } from '../types';
import { handleImageError } from '../utils/imageFallback';

interface ProductReviewsProps {
  product: Product;
  onReviewAdded?: () => void;
}

export default function ProductReviews({ product, onReviewAdded }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // Form states
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  
  // Camera & File upload states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    setSubmitSuccess(null);
    setSubmitError(null);
  }, [product.id]);

  // Camera stream setup and teardown
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (isCameraActive) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          streamRef.current = stream;
          setCameraError(null);
        })
        .catch(err => {
          console.error('Error accessing camera:', err);
          setCameraError('Could not access camera. Please make sure camera permissions are granted.');
        });
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraActive]);

  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setReviewImages(prev => [...prev, dataUrl]);
      }
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              setReviewImages(prev => [...prev, reader.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              setReviewImages(prev => [...prev, reader.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewText.trim()) {
      setSubmitError('Please fill in both your name and review comment.');
      return;
    }
    setSubmittingReview(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: reviewerName.trim(),
          rating: reviewRating,
          reviewText: reviewText.trim(),
          images: reviewImages,
        })
      });
      if (res.ok) {
        setSubmitSuccess('Thank you! Your review has been posted successfully.');
        setReviewerName('');
        setReviewText('');
        setReviewRating(5);
        setReviewImages([]);
        setIsCameraActive(false);
        fetchReviews();
        if (onReviewAdded) {
          onReviewAdded();
        }
      } else {
        const data = await res.json();
        setSubmitError(data.error || 'Failed to submit review. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setSubmitError('Failed to submit review. Please check your connection and try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6" id={`product-reviews-container-${product.id}`}>
      {/* Reviews Summary Stats */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-4" id="reviews-stats-summary">
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Customer Rating</h4>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="text-xl font-bold font-mono text-amber-500">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${(i < Math.round(product.rating || 5)) ? 'fill-current text-amber-400' : 'text-gray-300 dark:text-gray-700'}`} 
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 font-mono">({reviews.length} reviews)</span>
          </div>
        </div>
      </div>

      {/* Submit Review Form */}
      <form onSubmit={handleSubmitReview} className="p-4 bg-gray-50/50 dark:bg-black/30 border border-gray-100 dark:border-gray-800/80 rounded-xl space-y-4" id="review-submission-form">
        <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[#0066FF]" /> Share Your Experience
        </h5>
        
        {submitSuccess && (
          <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg font-medium" id="review-submit-success">
            {submitSuccess}
          </div>
        )}
        
        {submitError && (
          <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg font-medium" id="review-submit-error">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[9px] font-mono uppercase text-gray-400 mb-1">Your Name</label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="e.g. Kwabena O."
              className="w-full text-xs bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0066FF] text-gray-900 dark:text-white"
              maxLength={64}
              required
              id="reviewer-name-input"
            />
          </div>
          <div>
            <label className="block text-[9px] font-mono uppercase text-gray-400 mb-1">Star Rating</label>
            <div className="flex items-center h-10 text-amber-400 space-x-1 cursor-pointer" id="review-star-selector">
              {Array.from({ length: 5 }).map((_, i) => {
                const starValue = i + 1;
                const isSelected = starValue <= (hoverRating !== null ? hoverRating : reviewRating);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="focus:outline-none transition-transform hover:scale-125 p-0.5"
                    title={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
                    id={`star-button-${starValue}`}
                  >
                    <Star 
                      className={`w-5 h-5 transition-colors ${isSelected ? 'fill-current text-amber-400' : 'text-gray-300 dark:text-gray-700'}`} 
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-mono uppercase text-gray-400 mb-1">Your Review</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share details of your experience with this device (performance, battery, build quality...)"
            className="w-full text-xs bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0066FF] text-gray-900 dark:text-white h-20 resize-none"
            maxLength={1000}
            required
            id="review-comment-input"
          />
        </div>

        {/* Review Images Upload */}
        <div className="space-y-2 border-t border-gray-100 dark:border-gray-800/60 pt-3" id="review-images-upload-section">
          <span className="block text-[9px] font-mono uppercase text-gray-400">Attach Product Photos (Optional)</span>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsCameraActive(!isCameraActive)}
              className={`flex-1 py-2 px-3 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                isCameraActive 
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent'
              }`}
              id="btn-toggle-camera"
            >
              <Camera className="w-4 h-4" />
              <span>{isCameraActive ? 'Close Camera' : 'Take Photo'}</span>
            </button>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-transparent text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
              id="btn-browse-photos"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Files</span>
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              multiple
              className="hidden"
              id="review-image-file-input"
            />
          </div>

          {/* Camera Viewfinder */}
          {isCameraActive && (
            <div className="relative border border-amber-500/20 rounded-xl overflow-hidden bg-black flex flex-col items-center p-2 space-y-2 animate-in slide-in-from-top-2 duration-200" id="camera-viewfinder-container">
              {cameraError ? (
                <div className="text-center py-6 px-4 text-xs text-red-400 font-mono" id="camera-error-message">
                  {cameraError}
                </div>
              ) : (
                <>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-950">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-4 border border-dashed border-white/20 pointer-events-none rounded flex items-center justify-center">
                      <span className="text-[9px] text-white/40 uppercase font-mono tracking-widest bg-black/40 px-2 py-0.5 rounded">Viewfinder</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all"
                    id="btn-capture-camera"
                  >
                    📸 Capture Snapshot
                  </button>
                </>
              )}
            </div>
          )}

          {/* Drag & Drop Preview Zone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border rounded-xl p-3 text-center transition-all ${
              isDraggingOver 
                ? 'border-[#0066FF] bg-blue-500/5' 
                : 'border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/20 dark:bg-black/10'
            }`}
            id="review-image-drag-zone"
          >
            {reviewImages.length === 0 ? (
              <div className="text-[10px] text-gray-400 font-mono py-2">
                Drag &amp; drop photos here or use buttons above to upload
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 justify-center" id="review-images-preview-grid">
                  {reviewImages.map((img, idx) => (
                    <div key={idx} className="relative h-14 w-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-white group" id={`review-image-preview-wrapper-${idx}`}>
                      <img src={img} alt="Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" onError={handleImageError} />
                      <button
                        type="button"
                        onClick={() => setReviewImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/65 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete photo"
                        id={`btn-delete-preview-image-${idx}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="text-[9px] text-emerald-500 font-mono font-bold flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{reviewImages.length} photo{reviewImages.length > 1 ? 's' : ''} ready to attach</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submittingReview}
          className="w-full py-2.5 bg-[#0066FF] text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#0055DD] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/10"
          id="submit-review-button"
        >
          {submittingReview ? 'Submitting Review...' : 'Post Review'}
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-3" id="reviews-feed-container">
        <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">Reviews Feed ({reviews.length})</h5>
        
        {loadingReviews ? (
          <div className="text-center py-6 text-xs text-gray-400 font-mono" id="reviews-loading">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400 font-mono border border-dashed border-gray-200 dark:border-gray-800 rounded-xl" id="reviews-empty">
            No reviews yet. Be the first to share your experience with this product!
          </div>
        ) : (
          <AnimatePresence>
            {reviews.map((rev, index) => (
              <motion.div 
                key={rev.id} 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                className="p-3.5 bg-gray-50/70 dark:bg-[#121212]/30 border border-gray-100 dark:border-gray-800/40 rounded-xl transition-all hover:border-gray-200 dark:hover:border-gray-800/80"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{rev.reviewerName}</span>
                    <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" /> Verified
                    </span>
                  </div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < rev.rating ? 'fill-current text-amber-400' : 'text-gray-300 dark:text-gray-800'}`} 
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 block mt-1 font-mono">
                  Posted {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-line">{rev.reviewText}</p>
                
                {/* Attached Images */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2.5" id={`review-attached-images-${rev.id}`}>
                    {rev.images.map((img, imgIdx) => (
                      <button
                        key={imgIdx}
                        type="button"
                        onClick={() => setLightboxImage(img)}
                        className="h-14 w-14 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800/60 p-0.5 bg-white dark:bg-black hover:scale-105 active:scale-95 transition-all shrink-0 cursor-zoom-in"
                        id={`btn-lightbox-trigger-${rev.id}-${imgIdx}`}
                        title="View full image"
                      >
                        <img 
                          src={img} 
                          alt={`Review Attachment`} 
                          className="h-full w-full object-cover rounded-md" 
                          referrerPolicy="no-referrer"
                          onError={handleImageError}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[999] p-4 cursor-zoom-out"
            onClick={() => setLightboxImage(null)}
            id="lightbox-container"
          >
            <button 
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Close"
              id="lightbox-close-button"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              src={lightboxImage} 
              alt="Review Attachment Fullscreen" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              referrerPolicy="no-referrer"
              onError={handleImageError}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
