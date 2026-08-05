/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CategoryConfig {
  id: string;
  label: string;
  icon: string;
  imageUrl?: string;
  image?: string;
  desc: string;
  badge?: string;
  keywords: string[];
}

export const STORE_CATEGORIES: CategoryConfig[] = [
  {
    id: 'Smartphones',
    label: 'Smartphones',
    icon: '📱',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80',
    desc: 'Flagship iPhones, Samsung Galaxy, Google Pixel & Android devices',
    badge: 'Popular',
    keywords: ['phone', 'smartphone', 'iphone', 'galaxy', 'pixel', 'mobile', 'android']
  },
  {
    id: 'Laptops & Computing',
    label: 'Laptops & Computing',
    icon: '💻',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80',
    desc: 'Apple MacBooks, HP EliteBooks, Dell XPS & PC Workstations',
    badge: 'Best Seller',
    keywords: ['computing', 'laptop', 'macbook', 'elitebook', 'desktop', 'pc', 'workstation', 'thinkpad']
  },
  {
    id: 'Tablets & iPads',
    label: 'Tablets & iPads',
    icon: '📲',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=200&q=80',
    desc: 'Apple iPad Pro, Air, Mini, Samsung Galaxy Tab & Stylus Tablets',
    keywords: ['tablet', 'ipad', 'tab', 'stylus', 'surface']
  },
  {
    id: 'Audio & Sound',
    label: 'Audio & Sound',
    icon: '🎧',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
    desc: 'AirPods Pro, Sony ANC Headphones, JBL & Marshall Speakers',
    keywords: ['audio', 'sound', 'headphone', 'earbud', 'airpod', 'speaker', 'boomsound']
  },
  {
    id: 'Gaming & Consoles',
    label: 'Gaming & Consoles',
    icon: '🎮',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=200&q=80',
    desc: 'PlayStation 5, Xbox Series X, Nintendo Switch, GPUs & RGB Accessories',
    keywords: ['gaming', 'console', 'ps5', 'xbox', 'nintendo', 'switch', 'gpu', 'rig']
  },
  {
    id: 'Smartwatches & Wearables',
    label: 'Smartwatches & Wearables',
    icon: '⌚',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80',
    desc: 'Apple Watch Ultra, Galaxy Watch 6, Garmin & Fitness Bands',
    keywords: ['watch', 'wearable', 'fitbit', 'smartwatch', 'band', 'apple watch']
  },
  {
    id: 'Cameras & Drones',
    label: 'Cameras & Drones',
    icon: '📷',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80',
    desc: 'Sony Alpha Mirrorless, DJI Mini Drones, Action Cameras & Gimbals',
    keywords: ['camera', 'drone', 'gimbal', 'dji', 'action cam', 'sony alpha', 'vlog']
  },
  {
    id: 'Smart Home & IoT',
    label: 'Smart Home & IoT',
    icon: '🏠',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=200&q=80',
    desc: 'Google Nest Displays, Ring Security Cams, Smart Locks & Lighting',
    keywords: ['home', 'iot', 'nest', 'ring', 'security', 'smart display', 'automation']
  },
  {
    id: 'Networking & Storage',
    label: 'Networking & Storage',
    icon: '🌐',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=200&q=80',
    desc: 'Wi-Fi 6E Mesh Routers, SanDisk External SSDs, Hard Drives & Hubs',
    keywords: ['network', 'storage', 'router', 'ssd', 'nvme', 'nas', 'hard drive', 'tp-link']
  },
  {
    id: 'Accessories & Power',
    label: 'Accessories & Power',
    icon: '⚡',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=200&q=80',
    desc: 'Anker GaN Fast Chargers, MagSafe Power Banks, Type-C Cables & Docks',
    keywords: ['accessor', 'power', 'charger', 'cable', 'magsafe', 'powerbank', 'dock']
  }
];

export const CATEGORY_NAMES = ['All', ...STORE_CATEGORIES.map(c => c.id)];

export function getCategoryConfig(categoryIdOrName: string): CategoryConfig | undefined {
  if (!categoryIdOrName || categoryIdOrName === 'All') {
    return {
      id: 'All',
      label: 'All Items',
      icon: '⚡',
      imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80',
      desc: 'Browse complete flagship catalog across all store categories',
      keywords: ['all', 'everything', 'store']
    };
  }
  const lower = categoryIdOrName.toLowerCase().trim();
  return STORE_CATEGORIES.find(
    c => c.id.toLowerCase() === lower || c.label.toLowerCase() === lower
  );
}

export function isCategoryMatch(
  pCategory: string | undefined | null,
  targetCategory: string,
  pName?: string,
  pDesc?: string
): boolean {
  if (!targetCategory || targetCategory === 'All') return true;

  const targetLower = targetCategory.toLowerCase().trim();
  const pCatLower = (pCategory || '').toLowerCase().trim();
  const nameLower = (pName || '').toLowerCase().trim();
  const descLower = (pDesc || '').toLowerCase().trim();

  // Direct category equality check
  if (pCatLower === targetLower) return true;

  // Substring match in category string (e.g. 'smartwatches' in 'smartwatches & wearables')
  if (pCatLower && (pCatLower.includes(targetLower) || targetLower.includes(pCatLower))) return true;

  // Find category config by target ID
  const config = STORE_CATEGORIES.find(c => c.id.toLowerCase() === targetLower);
  if (config) {
    if (pCatLower && config.keywords.some(kw => pCatLower.includes(kw))) return true;
    if (nameLower && config.keywords.some(kw => nameLower.includes(kw))) return true;
    if (descLower && config.keywords.some(kw => descLower.includes(kw))) return true;
  }

  return false;
}
