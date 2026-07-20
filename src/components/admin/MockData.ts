/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../../types';

export interface IntegrationApp {
  id: string;
  name: string;
  category: 'Payments' | 'Shipping' | 'Analytics' | 'Communication' | 'Marketing' | 'Developer';
  description: string;
  logo: string;
  installed: boolean;
  status: 'active' | 'inactive';
  config: Record<string, string>;
}

export interface AuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Error';
}

export interface CRMProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  registeredDevices: string[];
  loyaltyPoints: number;
  totalSpentGHS: number;
  repairTicketsCount: number;
  notes: string;
  communicationHistory: Array<{ date: string; type: 'Email' | 'SMS' | 'Call' | 'WhatsApp'; text: string }>;
}

export interface WalletTransaction {
  id: string;
  wallet: 'Main' | 'Operations' | 'Marketing' | 'Repair';
  type: 'Income' | 'Expense' | 'Transfer' | 'Settlement';
  amountGHS: number;
  description: string;
  timestamp: string;
  status: 'Cleared' | 'Pending' | 'Failed';
}

export interface CMSBlock {
  id: string;
  type: 'hero' | 'grid' | 'carousel' | 'faq' | 'about' | 'footer' | 'banner';
  title: string;
  subtitle?: string;
  content: string;
  buttonText?: string;
  backgroundColor: string;
  status: 'Draft' | 'Published' | 'Scheduled';
  lastEditedBy: string;
  version: number;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  channel: 'Email' | 'SMS' | 'WhatsApp' | 'Push';
  audience: string;
  status: 'Draft' | 'Sent' | 'Scheduled' | 'Active';
  sentCount: number;
  engagementRate: string;
  scheduledDate?: string;
  content: string;
}

export interface SupplierOrder {
  id: string;
  supplier: string;
  items: Array<{ name: string; qty: number; unitCostGHS: number }>;
  totalCostGHS: number;
  status: 'Draft' | 'Sent' | 'Shipped' | 'Received';
  createdAt: string;
}

export const INITIAL_INTEGRATIONS: IntegrationApp[] = [
  {
    id: 'paystack',
    name: 'Paystack',
    category: 'Payments',
    description: 'Accept Mobile Money (MTN, Telecel, AirtelTigo) and Visa/Mastercard credit/debit cards instantly in West Africa.',
    logo: '💳',
    installed: true,
    status: 'active',
    config: { publicKey: 'pk_live_immortal_9281a', secretKey: 'sk_live_immortal_******' }
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    category: 'Payments',
    description: 'Grow your business across Africa with comprehensive localized payment infrastructure and multiple payout options.',
    logo: '🌊',
    installed: false,
    status: 'inactive',
    config: { publicKey: '', secretKey: '' }
  },
  {
    id: 'hubtel',
    name: 'Hubtel',
    category: 'Payments',
    description: 'Ghanaian native unified payment collector specializing in swift Mobile Money API integrations.',
    logo: '📱',
    installed: true,
    status: 'active',
    config: { merchantId: '201928', apiKey: 'ht_api_live_72837a' }
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Payments',
    description: 'Global checkout infrastructure. Accept bank card payments from international customers smoothly.',
    logo: '🏁',
    installed: false,
    status: 'inactive',
    config: { publishableKey: '', secretKey: '' }
  },
  {
    id: 'dhl',
    name: 'DHL Express',
    category: 'Shipping',
    description: 'Incorporate automatic international shipping rates and coordinate quick air cargo pickups directly from Accra.',
    logo: '✈️',
    installed: true,
    status: 'active',
    config: { shipperAccount: '958210928', pickupPoint: 'Airport Residential' }
  },
  {
    id: 'fedex',
    name: 'FedEx',
    category: 'Shipping',
    description: 'Automated global logistics dispatching with live customer parcel tracking panels.',
    logo: '📦',
    installed: false,
    status: 'inactive',
    config: { meterNumber: '', account: '' }
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    category: 'Analytics',
    description: 'In-depth measurement and breakdown of customer conversion funnels, sessions, and device telemetry.',
    logo: '📊',
    installed: true,
    status: 'active',
    config: { measurementId: 'G-728192812' }
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'Marketing',
    description: 'Coordinate email newsletters, segment high-value corporate clients, and schedule landing promotions.',
    logo: '🐒',
    installed: false,
    status: 'inactive',
    config: { apiKey: '', serverPrefix: '' }
  },
  {
    id: 'whatsapp-business',
    name: 'WhatsApp Business API',
    category: 'Communication',
    description: 'Broadcast high-engagement sales materials, dispatch auto invoices, and deliver live status updates.',
    logo: '💬',
    installed: true,
    status: 'active',
    config: { phoneId: '109281928', accessToken: 'wa_token_live_******' }
  },
  {
    id: 'sentry',
    name: 'Sentry',
    category: 'Developer',
    description: 'Enterprise error logging and front-end performance telemetry monitoring.',
    logo: '🕸️',
    installed: false,
    status: 'inactive',
    config: { dsn: '' }
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    user: 'Benjamin Danso (CEO)',
    role: 'CEO',
    action: 'Approved GHS 45,000 Mobile Money wallet payout to operations reserve.',
    timestamp: '2026-07-09T01:10:00-07:00',
    ipAddress: '102.176.45.12',
    status: 'Success'
  },
  {
    id: 'log-2',
    user: 'Isaac (Chief Tech)',
    role: 'Technician',
    action: 'Changed status of Repair Ticket IM-REP-91823 to "Completed". Added panel diagnostic notes.',
    timestamp: '2026-07-09T00:55:00-07:00',
    ipAddress: '197.251.12.98',
    status: 'Success'
  },
  {
    id: 'log-3',
    user: 'Kofi Mensah (Product Manager)',
    role: 'Product Manager',
    action: 'Adjusted MacBook Pro 16" stock count from 2 units to 3 units following supplier intake.',
    timestamp: '2026-07-08T23:30:00-07:00',
    ipAddress: '197.251.14.22',
    status: 'Success'
  },
  {
    id: 'log-4',
    user: 'Sandra A. (Support)',
    role: 'Customer Support',
    action: 'Processed a full refund of GHS 1,200 for cancelled order IM-ORD-72819.',
    timestamp: '2026-07-08T18:45:00-07:00',
    ipAddress: '102.176.54.3',
    status: 'Warning'
  },
  {
    id: 'log-5',
    user: 'Security Sentinel',
    role: 'System',
    action: 'Detected unauthorized configuration edit attempt on Hubtel Payment API.',
    timestamp: '2026-07-08T14:10:00-07:00',
    ipAddress: '45.122.9.88',
    status: 'Error'
  }
];

export const INITIAL_CRM_PROFILES: CRMProfile[] = [
  {
    id: 'crm-1',
    name: 'Sena Agbenu',
    email: 'sena.agb@gmail.com',
    phone: '+233 24 992 1029',
    city: 'Accra',
    registeredDevices: ['iPhone 15 Pro Max', 'Apple Watch Series 9'],
    loyaltyPoints: 450,
    totalSpentGHS: 22700,
    repairTicketsCount: 1,
    notes: 'Premium corporate customer. Preferred delivery location is East Legon. Always request morning drop-off.',
    communicationHistory: [
      { date: '2026-07-09', type: 'WhatsApp', text: 'Auto confirmation: Payment of GHS 21,500 received for iPhone 15 Pro Max.' },
      { date: '2026-06-15', type: 'Email', text: 'Promotional newsletter sent: Protecting battery life in Accra tropical climate.' }
    ]
  },
  {
    id: 'crm-2',
    name: 'Emmanuel K. Osei',
    email: 'e.k.osei@yahoo.com',
    phone: '+233 50 182 3918',
    city: 'Kumasi',
    registeredDevices: ['Samsung Galaxy S24 Ultra'],
    loyaltyPoints: 320,
    totalSpentGHS: 23000,
    repairTicketsCount: 0,
    notes: 'Prefers bank transfer checkout. Enjoys trading in previous generations yearly.',
    communicationHistory: [
      { date: '2026-07-07', type: 'SMS', text: 'Your Galaxy S24 Ultra has been dispatched and handed over to DHL Express.' }
    ]
  },
  {
    id: 'crm-3',
    name: 'Abigail Ansah',
    email: 'abbi.ansah@outlook.com',
    phone: '+233 54 818 2981',
    city: 'Tema',
    registeredDevices: ['Google Pixel 8 Pro', 'iPad Air M1'],
    loyaltyPoints: 180,
    totalSpentGHS: 14500,
    repairTicketsCount: 2,
    notes: 'Had water damage chemical decontamination done successfully last year. Very satisfied.',
    communicationHistory: [
      { date: '2026-07-01', type: 'Call', text: 'Support Agent checked in on battery warranty response. Confirmed solid state.' }
    ]
  }
];

export const INITIAL_CMS_BLOCKS: CMSBlock[] = [
  {
    id: 'cms-1',
    type: 'hero',
    title: 'IMMORTAL ELECTRONICS',
    subtitle: 'Ghana’s Ultimate Destination for High-Performance Flagships & Authorized Board-Level Diagnostics',
    content: 'We provide premium hardware sales, certified device swap appraisal desks, and professional technician workbench services for smartphones, gaming modules, and computing setups.',
    buttonText: 'Explore Collection',
    backgroundColor: '#0F172A',
    status: 'Published',
    lastEditedBy: 'Benjamin Danso',
    version: 4
  },
  {
    id: 'cms-2',
    type: 'banner',
    title: 'Tropical Thermal Shield Campaign',
    subtitle: 'Beat Accra\'s Extreme Heat!',
    content: 'Protect your device! Claim 15% OFF on premium lithium-ion battery replacements and multi-point cooling fan sets using promo code ACCRAFREE.',
    buttonText: 'Book Fast Repair',
    backgroundColor: '#F59E0B',
    status: 'Published',
    lastEditedBy: 'Sandra A.',
    version: 2
  },
  {
    id: 'cms-3',
    type: 'grid',
    title: 'Certified Diagnostic Workbench Standards',
    content: '1. Instant Micro-soldering Diagnostics\n2. Genuine Spare Inventory Components\n3. 45-Point Multi-stage Inspection\n4. 6-Month Comprehensive Repair Warranties',
    backgroundColor: '#1E293B',
    status: 'Published',
    lastEditedBy: 'Isaac (Chief Tech)',
    version: 3
  }
];

export const INITIAL_WALLETS_LEDGER: WalletTransaction[] = [
  {
    id: 'tx-001',
    wallet: 'Main',
    type: 'Income',
    amountGHS: 21500,
    description: 'Customer checkout order Sena A. (iPhone 15 Pro Max)',
    timestamp: '2026-07-09T01:15:00-07:00',
    status: 'Cleared'
  },
  {
    id: 'tx-002',
    wallet: 'Repair',
    type: 'Income',
    amountGHS: 1800,
    description: 'Board level screen replacement repair ticket completed',
    timestamp: '2026-07-09T00:45:00-07:00',
    status: 'Cleared'
  },
  {
    id: 'tx-003',
    wallet: 'Operations',
    type: 'Expense',
    amountGHS: 3500,
    description: 'Custom motherboard micro-soldering stencil tools intake',
    timestamp: '2026-07-08T18:22:00-07:00',
    status: 'Cleared'
  },
  {
    id: 'tx-004',
    wallet: 'Marketing',
    type: 'Expense',
    amountGHS: 2100,
    description: 'Accra FM localized radio station tech segment sponsorship',
    timestamp: '2026-07-08T11:00:00-07:00',
    status: 'Cleared'
  },
  {
    id: 'tx-005',
    wallet: 'Main',
    type: 'Transfer',
    amountGHS: 8000,
    description: 'Routine liquidity sweep from Hubtel account payouts',
    timestamp: '2026-07-07T14:30:00-07:00',
    status: 'Cleared'
  }
];

export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'camp-1',
    name: 'Ghana Independence Tech Expo Promo',
    channel: 'Email',
    audience: 'All Registered Retail & Corporate Customers',
    status: 'Sent',
    sentCount: 1450,
    engagementRate: '42.8%',
    content: 'Discover the ultimate discount on premium accessories and Computing setups at Immortal Electronics. Save up to 25% with promo code GHANA69.'
  },
  {
    id: 'camp-2',
    name: 'Accra Mid-Year Monsoon Rain Battery Checkup',
    channel: 'WhatsApp',
    audience: 'Customers with 1+ Year Registered Devices',
    status: 'Active',
    sentCount: 380,
    engagementRate: '82.4%',
    content: 'Hi! Rapid humidity shifts and water drops can trigger immediate circuit shortcuts. Immortal Electronics is offering FREE diagnostics in Accra this week.'
  },
  {
    id: 'camp-3',
    name: 'Back to School Laptop & Smartphone Bundle',
    channel: 'SMS',
    audience: 'Students & University Leads list',
    status: 'Scheduled',
    sentCount: 0,
    engagementRate: '0%',
    scheduledDate: '2026-07-15',
    content: 'Equip yourself for success! Claim high-performance Computing sets + Apple gadgets bundled on premium monthly payment scales at Immortal.'
  }
];

export const INITIAL_SUPPLIER_ORDERS: SupplierOrder[] = [
  {
    id: 'po-1',
    supplier: 'Apple Distributor South Africa',
    items: [
      { name: 'iPhone 15 Pro Max 256GB', qty: 10, unitCostGHS: 16000 },
      { name: 'MacBook Pro 16" M3 Max 36GB', qty: 3, unitCostGHS: 35000 }
    ],
    totalCostGHS: 265000,
    status: 'Received',
    createdAt: '2026-06-20'
  },
  {
    id: 'po-2',
    supplier: 'Anker Trading Co. Shenzhen',
    items: [
      { name: 'Anker PowerPort III GaN 65W Pod', qty: 100, unitCostGHS: 380 }
    ],
    totalCostGHS: 38000,
    status: 'Shipped',
    createdAt: '2026-07-05'
  }
];
