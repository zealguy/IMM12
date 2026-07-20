/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  priceGHS: number;
  priceUSD: number;
  category: string;
  brand: string;
  image: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  specs: Record<string, string>;
  colors: string[];
  isNew: boolean;
  stock: number;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  video?: string;
  status?: 'Draft' | 'Published' | 'Scheduled' | 'Archived';
  isFeatured?: boolean;
}

export type RepairStatus = 'Pending' | 'In Progress' | 'Awaiting Parts' | 'Completed' | 'Returned';

export interface RepairRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deviceType: 'Smartphone' | 'Laptop' | 'Tablet' | 'Other';
  brand: string;
  model: string;
  faultCategory: 'Screen' | 'Battery' | 'Charging Port' | 'Water Damage' | 'Software' | 'Camera' | 'Motherboard' | 'Speaker' | 'Other';
  faultDescription: string;
  image?: string;
  status: RepairStatus;
  quotationGHS: number;
  quotationUSD: number;
  technicianNotes?: string;
  createdAt: string;
  trackingNumber: string;
  repairHistory?: { status: RepairStatus; note: string; timestamp: string }[];
}

export type TradeInStatus = 'Submitted' | 'Inspected' | 'Offer Generated' | 'Approved' | 'Declined' | 'Completed';

export interface TradeInRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deviceType: string;
  brand: string;
  model: string;
  condition: 'Like New' | 'Good' | 'Fair' | 'Broken';
  image?: string;
  valuationEstimateGHS: number;
  valuationEstimateUSD: number;
  finalOfferGHS?: number;
  finalOfferUSD?: number;
  status: TradeInStatus;
  createdAt: string;
  trackingNumber: string;
  notes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  items: CartItem[];
  totalGHS: number;
  totalUSD: number;
  status: OrderStatus;
  paymentMethod: 'Mobile Money' | 'Card';
  paymentProvider?: 'MTN' | 'Telecel' | 'AirtelTigo' | 'Visa/Mastercard';
  paymentStatus: 'Unpaid' | 'Paid' | 'Refunded';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: 'Accra' | 'Kumasi' | 'Takoradi' | 'Cape Coast' | 'Tamale' | 'Other';
  deliveryOption: 'Standard Accra Dispatch' | 'Expedited Motorcycle Courier' | 'In-Store Pickup' | 'Same Day' | 'Next Day' | 'Pickup';
  deliveryCostGHS: number;
  trackingNumber: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: 'Tech News' | 'Phone Reviews' | 'Repair Tips' | 'Buying Guides';
  readTime: string;
  image: string;
  likes: number;
  comments: { author: string; text: string; date: string }[];
  tags: string[];
}

export interface Coupon {
  code: string;
  discountPercent: number;
  active: boolean;
  minSpendGHS?: number;
}

export interface BulkInquiry {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  productsOfInterest: string[];
  estimatedQuantity: string;
  message: string;
  timeline: string;
  targetBudget?: string;
  deliveryLocation: string;
  preferredPayment: string;
  createdAt: string;
  status: 'Pending' | 'Contacted' | 'Quoted' | 'Closed';
}

export interface Review {
  id: string;
  productId: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  images?: string[];
}

