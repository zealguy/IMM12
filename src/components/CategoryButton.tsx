import React, { useState, useEffect } from 'react';
import { CategoryConfig } from '../constants/categories';

export interface CategoryButtonProps {
  category: CategoryConfig;
  isSelected?: boolean;
  itemCount?: number;
  onClick: () => void;
  variant?: 'explorer' | 'pill' | 'card';
  className?: string;
  showBadge?: boolean;
  showCount?: boolean;
}

export const CategoryButton: React.FC<CategoryButtonProps> = ({
  category,
  isSelected = false,
  itemCount,
  onClick,
  variant = 'explorer',
  className = '',
  showBadge = true,
  showCount = true
}) => {
  const [imageError, setImageError] = useState(false);

  const activeImageUrl = category.imageUrl || category.image;
  const fallbackEmoji = category.icon || '⚡';

  // Reset image error state whenever activeImageUrl or category ID changes
  useEffect(() => {
    setImageError(false);
  }, [activeImageUrl, category.id]);

  const hasValidImage = !!activeImageUrl && !imageError;

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-all shrink-0 flex items-center space-x-2 ${
          isSelected
            ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20 scale-102'
            : 'bg-gray-100 dark:bg-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
        } ${className}`}
        title={category.desc || category.label}
      >
        <div className="w-4 h-4 rounded shrink-0 overflow-hidden flex items-center justify-center bg-gray-200/50 dark:bg-black/30">
          {hasValidImage ? (
            <img
              src={activeImageUrl}
              alt={category.label}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover rounded"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-xs leading-none">{fallbackEmoji}</span>
          )}
        </div>
        <span>{category.label}</span>
        {showCount && typeof itemCount === 'number' && (
          <span
            className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
              isSelected
                ? 'bg-white/20 text-white font-black'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
            }`}
          >
            {itemCount}
          </span>
        )}
      </button>
    );
  }

  // Default 'explorer' or 'card' variant
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-between group cursor-pointer ${
        isSelected
          ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-lg shadow-[#0066FF]/25 scale-105 ring-2 ring-[#0066FF]/30'
          : 'bg-white dark:bg-[#101012] border-gray-150 dark:border-gray-800 hover:border-[#0066FF] dark:hover:border-[#0066FF] text-gray-800 dark:text-gray-200 hover:shadow-md'
      } ${className}`}
      title={category.desc || category.label}
    >
      <div className="relative mb-2 w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-black/30 p-1 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 transition-colors">
        {hasValidImage ? (
          <img
            src={activeImageUrl}
            alt={category.label}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-200"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-2xl block group-hover:scale-110 transition-transform duration-200 leading-none">
            {fallbackEmoji}
          </span>
        )}
        {category.badge && !isSelected && showBadge && (
          <span className="absolute -top-1.5 -right-2 text-[7px] font-mono font-black bg-amber-500 text-black px-1 py-0.2 rounded-md uppercase z-10 shadow-sm border border-black/10">
            {category.badge}
          </span>
        )}
      </div>

      <div className="w-full">
        <span
          className={`block text-[10px] font-black tracking-tight line-clamp-1 leading-tight ${
            isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
          }`}
        >
          {category.label}
        </span>
        {showCount && typeof itemCount === 'number' && (
          <span
            className={`block text-[8px] font-mono mt-0.5 ${
              isSelected ? 'text-blue-100 font-bold' : 'text-gray-400'
            }`}
          >
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>
    </button>
  );
};

export default CategoryButton;
