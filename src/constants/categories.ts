/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CategoryConfig {
  id: string;
  label: string;
  icon: string;
  desc: string;
  badge?: string;
  keywords: string[];
}

export const STORE_CATEGORIES: CategoryConfig[] = [
  {
    id: 'Smartphones',
    label: 'Smartphones',
    icon: '📱',
    desc: 'Flagship iPhones, Samsung Galaxy, Google Pixel & Android devices',
    badge: 'Popular',
    keywords: ['phone', 'smartphone', 'iphone', 'galaxy', 'pixel', 'mobile', 'android']
  },
  {
    id: 'Laptops & Computing',
    label: 'Laptops & Computing',
    icon: '💻',
    desc: 'Apple MacBooks, HP EliteBooks, Dell XPS & PC Workstations',
    badge: 'Best Seller',
    keywords: ['computing', 'laptop', 'macbook', 'elitebook', 'desktop', 'pc', 'workstation', 'thinkpad']
  },
  {
    id: 'Tablets & iPads',
    label: 'Tablets & iPads',
    icon: '📲',
    desc: 'Apple iPad Pro, Air, Mini, Samsung Galaxy Tab & Stylus Tablets',
    keywords: ['tablet', 'ipad', 'tab', 'stylus', 'surface']
  },
  {
    id: 'Audio & Sound',
    label: 'Audio & Sound',
    icon: '🎧',
    desc: 'AirPods Pro, Sony ANC Headphones, JBL & Marshall Speakers',
    keywords: ['audio', 'sound', 'headphone', 'earbud', 'airpod', 'speaker', 'boomsound']
  },
  {
    id: 'Gaming & Consoles',
    label: 'Gaming & Consoles',
    icon: '🎮',
    desc: 'PlayStation 5, Xbox Series X, Nintendo Switch, GPUs & RGB Accessories',
    keywords: ['gaming', 'console', 'ps5', 'xbox', 'nintendo', 'switch', 'gpu', 'rig']
  },
  {
    id: 'Smartwatches & Wearables',
    label: 'Smartwatches & Wearables',
    icon: '⌚',
    desc: 'Apple Watch Ultra, Galaxy Watch 6, Garmin & Fitness Bands',
    keywords: ['watch', 'wearable', 'fitbit', 'smartwatch', 'band', 'apple watch']
  },
  {
    id: 'Cameras & Drones',
    label: 'Cameras & Drones',
    icon: '📷',
    desc: 'Sony Alpha Mirrorless, DJI Mini Drones, Action Cameras & Gimbals',
    keywords: ['camera', 'drone', 'gimbal', 'dji', 'action cam', 'sony alpha', 'vlog']
  },
  {
    id: 'Smart Home & IoT',
    label: 'Smart Home & IoT',
    icon: '🏠',
    desc: 'Google Nest Displays, Ring Security Cams, Smart Locks & Lighting',
    keywords: ['home', 'iot', 'nest', 'ring', 'security', 'smart display', 'automation']
  },
  {
    id: 'Networking & Storage',
    label: 'Networking & Storage',
    icon: '🌐',
    desc: 'Wi-Fi 6E Mesh Routers, SanDisk External SSDs, Hard Drives & Hubs',
    keywords: ['network', 'storage', 'router', 'ssd', 'nvme', 'nas', 'hard drive', 'tp-link']
  },
  {
    id: 'Accessories & Power',
    label: 'Accessories & Power',
    icon: '⚡',
    desc: 'Anker GaN Fast Chargers, MagSafe Power Banks, Type-C Cables & Docks',
    keywords: ['accessor', 'power', 'charger', 'cable', 'magsafe', 'powerbank', 'dock']
  }
];

export const CATEGORY_NAMES = ['All', ...STORE_CATEGORIES.map(c => c.id)];

export function isCategoryMatch(pCategory: string | undefined | null, targetCategory: string): boolean {
  if (!targetCategory || targetCategory === 'All') return true;
  if (!pCategory) return false;

  const pLower = pCategory.toLowerCase().trim();
  const targetLower = targetCategory.toLowerCase().trim();

  // Direct string equality
  if (pLower === targetLower) return true;

  // Find category config by target ID
  const config = STORE_CATEGORIES.find(c => c.id.toLowerCase() === targetLower);
  if (config) {
    return config.keywords.some(kw => pLower.includes(kw));
  }

  return pLower.includes(targetLower);
}
