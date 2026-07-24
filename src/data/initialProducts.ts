import { Product, BlogPost, Coupon } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-iphone15promax',
    name: 'iPhone 15 Pro Max',
    description: 'Flagship Apple iPhone with Aerospace-grade titanium design, A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.',
    priceGHS: 21500,
    priceUSD: 1450,
    category: 'Smartphones',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1695048132959-efd5bf9273c5?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1695048133116-3e8be899db94?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 142,
    specs: {
      'Display': '6.7-inch Super Retina XDR OLED, 120Hz',
      'Processor': 'Apple A17 Pro (3nm)',
      'Storage': '256GB / 512GB / 1TB',
      'Main Camera': '48MP Main + 12MP Telephoto (5x zoom) + 12MP Ultra-wide',
      'Battery': '4441 mAh with fast charge',
      'OS': 'iOS 17 (upgradable to iOS 18)'
    },
    colors: ['Titanium Gray', 'Titanium Black', 'Titanium Blue', 'Titanium White'],
    isNew: true,
    stock: 12,
    isBestSeller: true,
    isFeatured: true
  },
  {
    id: 'prod-s24ultra',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.',
    priceGHS: 23000,
    priceUSD: 1550,
    category: 'Smartphones',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1707151019688-df0b4d4f26ec?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 98,
    specs: {
      'Display': '6.8-inch Dynamic AMOLED 2X, QHD+, 120Hz',
      'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
      'Storage': '256GB / 512GB / 1TB',
      'Main Camera': '200MP Main + 50MP + 12MP + 10MP Quad Camera',
      'Battery': '5000 mAh, 45W wired charging',
      'OS': 'Android 14 (One UI 6.1)'
    },
    colors: ['Titanium Yellow', 'Titanium Violet', 'Titanium Gray', 'Titanium Black'],
    isNew: true,
    stock: 8,
    isBestSeller: true,
    isNewArrival: true,
    isFeatured: true
  },
  {
    id: 'prod-pixel8pro',
    name: 'Google Pixel 8 Pro',
    description: 'The all-pro phone engineered by Google. It has the best of Google AI, the most advanced Pixel Camera ever, and can help you get more done, faster.',
    priceGHS: 14500,
    priceUSD: 980,
    category: 'Smartphones',
    brand: 'Google Pixel',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop'],
    rating: 4.7,
    reviewsCount: 65,
    specs: {
      'Display': '6.7-inch Super Actua LTPO OLED, 120Hz',
      'Processor': 'Google Tensor G3 (4nm)',
      'Storage': '128GB / 256GB / 512GB',
      'Main Camera': '50MP Main + 48MP Telephoto (5x) + 48MP Ultra-wide',
      'Battery': '5050 mAh with 30W charging',
      'OS': 'Android 14'
    },
    colors: ['Bay Blue', 'Porcelain', 'Obsidian'],
    isNew: true,
    stock: 5,
    isNewArrival: true
  },
  {
    id: 'prod-macbookpro16',
    name: 'MacBook Pro 16" M3 Max',
    description: 'The ultimate pro laptop. With the M3 Max chip, a stunning Liquid Retina XDR display, and up to 22 hours of battery life, it delivers performance without boundaries.',
    priceGHS: 48000,
    priceUSD: 3200,
    category: 'Computing',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop'],
    rating: 5.0,
    reviewsCount: 34,
    specs: {
      'Display': '16.2-inch Liquid Retina XDR display (3456 x 2234)',
      'Processor': 'Apple M3 Max (14-core CPU, 30-core GPU)',
      'RAM': '36GB Unified Memory',
      'Storage': '1TB SSD',
      'Battery': 'Up to 22 hours',
      'Weight': '2.16 kg'
    },
    colors: ['Space Black', 'Silver'],
    isNew: true,
    stock: 3,
    isBestSeller: true
  },
  {
    id: 'prod-ankermini',
    name: 'Anker PowerPort III 65W Pod',
    description: 'High-speed charging for laptops, tablets, and phones in an ultra-compact body. Powered by GaN tech.',
    priceGHS: 650,
    priceUSD: 45,
    category: 'Accessories',
    brand: 'Anker',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop'],
    rating: 4.8,
    reviewsCount: 230,
    specs: {
      'Output': '65W USB-C Power Delivery',
      'Technology': 'GaN II Technology',
      'Compatibility': 'Universal (MacBook, iPhone, Galaxy, Pixel)',
      'Safety': 'ActiveShield temperature monitoring'
    },
    colors: ['Black', 'White'],
    isNew: false,
    stock: 50,
    isBestSeller: true
  },
  {
    id: 'prod-sonywh1000xm5',
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise canceling overhead headphones with premium sound quality, crystal clear hands-free calling, and Alexa Voice Control.',
    priceGHS: 5800,
    priceUSD: 390,
    category: 'Accessories',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'],
    rating: 4.9,
    reviewsCount: 88,
    specs: {
      'ANC': 'Industry-leading Auto NC Optimizer',
      'Driver': '30mm specially designed dome driver',
      'Battery Life': 'Up to 30 hours (ANC ON)',
      'Connection': 'Bluetooth 5.2, Multipoint connection',
      'Microphones': '8 microphones for outstanding call clarity'
    },
    colors: ['Black', 'Platinum Silver', 'Midnight Blue'],
    isNew: true,
    stock: 10,
    isBestSeller: true
  },
  {
    id: 'prod-ps5controller',
    name: 'PS5 DualSense Wireless Controller',
    description: 'Discover a deeper, highly immersive gaming experience with the innovative new PS5 controller, featuring haptic feedback and dynamic trigger effects.',
    priceGHS: 1200,
    priceUSD: 80,
    category: 'Gaming',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=600&auto=format&fit=crop'],
    rating: 4.7,
    reviewsCount: 112,
    specs: {
      'Feedback': 'Haptic feedback and adaptive triggers',
      'Microphone': 'Built-in mic and headset jack',
      'Connection': 'Bluetooth / USB-C',
      'Battery': 'Built-in rechargeable battery'
    },
    colors: ['White', 'Midnight Black', 'Cosmic Red', 'Starlight Blue'],
    isNew: true,
    stock: 15,
    isNewArrival: true
  },
  {
    id: 'prod-aura-active-smartwatch',
    name: 'NORTH EDGE APACHE-46 Men Digital Watch',
    description: 'NORTH EDGE APACHE-46 Men Digital Watch Outdoor Sports Running Swimming Outdoor Sport Watches Altimeter Barometer Compass WR50M',
    priceGHS: 1450,
    priceUSD: 98,
    category: 'Smartwatches & Wearables',
    brand: 'NORTH EDGE',
    image: '/src/assets/images/apache_textile_strap_1784298342941.jpg',
    images: [
      '/src/assets/images/apache_textile_strap_1784298342941.jpg',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 76,
    specs: {
      'Water Resistance Depth': '5Bar (50m Waterproof)',
      'Style': 'SPORT & Tactical Outdoor',
      'Movement': 'Digital Intelligent Sensor Engine',
      'Feature': 'Stop Watch, Back Light, Chronograph, Alarm, Compass, swim, Temperature Measurement, Pressure Measurement',
      'Dial Window Material Type': 'Hardlex',
      'Dial Diameter': '46mm',
      'Clasp Type': 'Buckle Stainless Steel',
      'Case Thickness': '14mm',
      'Case Shape': 'Round Heavy Duty Metal',
      'Case Material': 'Stainless Steel Alloy',
      'Band Width': '22mm',
      'Band Material Type': 'Nylon/Textile High-Tensile Strap',
      'Band Length': '25cm',
      'Item Type': 'Quartz Wristwatches'
    },
    colors: ['Khaki Textile Strap', 'Tactical Black Nylon', 'Stealth Silver'],
    isNew: true,
    stock: 25,
    isBestSeller: true,
    isFeatured: true
  },
  {
    id: 'prod-north-edge-laker',
    name: "NORTH EDGE Men's Digital Watch Military Waterproof",
    description: "NORTH EDGE Men's Digital Watch Military Waterproof 50M Running Sports Pedometer Stopwatch Watch Heart Rate Wristband Android IOS",
    priceGHS: 1100,
    priceUSD: 75,
    category: 'Smartwatches & Wearables',
    brand: 'NORTH EDGE',
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.7,
    reviewsCount: 54,
    specs: {
      'Water Resistance Depth': '5Bar (50M Waterproof)',
      'Style': 'Military Sport & Fitness Tracker',
      'Movement': 'Digital Smart Sensor',
      'Feature': 'Heart Rate Monitor, Pedometer, Calorie Counter, Stopwatch, Alarm, Distance Tracker',
      'Dial Window Material Type': 'Hardlex High-Definition Glass',
      'Dial Diameter': '44mm',
      'Case Thickness': '13mm',
      'Band Width': '22mm',
      'Band Material Type': 'High Grade Soft TPU Silicone',
      'Item Type': 'Digital Wristwatches'
    },
    colors: ['Tactical Black', 'Army Green'],
    isNew: true,
    stock: 30,
    isBestSeller: true
  },
  {
    id: 'prod-north-edge-mars',
    name: 'NORTH EDGE Mens Digital Watch Women',
    description: 'NORTH EDGE Mens Digital Watch Women Sportswatch Dual Time Running Pedometer Countdown Waterproof 50m Alarm Military Clock',
    priceGHS: 850,
    priceUSD: 58,
    category: 'Smartwatches & Wearables',
    brand: 'NORTH EDGE',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.6,
    reviewsCount: 38,
    specs: {
      'Water Resistance Depth': '5Bar (50M)',
      'Style': 'Unisex Military & Sport',
      'Feature': 'Stop Watch, Steps Tracker, Calorie Counter, Back Light, Complete Calendar, Alarm, Week Display, Chronograph',
      'Dial Diameter': '44mm',
      'Band Material Type': 'Lightweight Resin/Silicone',
      'Item Type': 'Digital Wristwatches'
    },
    colors: ['Mars Red', 'Midnight Black', 'Slate Gray'],
    isNew: true,
    stock: 20
  },
  {
    id: 'prod-mark-fairwhale-5031',
    name: "Mark Fairwhale 5031 New Top Brand Men's Quartz Watch Rotating Digital",
    description: "Mark Fairwhale 5031 New Top Brand Men's Quartz Watch Rotating Digital Dial Entertainment Cool Waterproof Night Light Watch reloj",
    priceGHS: 490,
    priceUSD: 35,
    category: 'Smartwatches & Wearables',
    brand: 'MARK FAIRWHALE',
    image: '/src/assets/images/mark_fw_silver_front_1784293768698.jpg',
    images: [
      '/src/assets/images/mark_fw_silver_front_1784293768698.jpg',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 62,
    specs: {
      'Water Resistance Depth': '3Bar (30m Life Waterproof)',
      'Style': 'Fashion & Casual Rotating Dial',
      'Movement': 'Quartz Precision Japanese Module',
      'Dial Window Material Type': 'Hardlex Mineral Glass',
      'Dial Diameter': '41mm',
      'Case Material': 'Alloy Stainless Polish',
      'Band Material Type': 'Fine Mesh Stainless Steel Strap',
      'Item Type': 'Quartz Wristwatches'
    },
    colors: ['Silver Mesh Dial', 'Obsidian Black Stainless'],
    isNew: true,
    stock: 18,
    isBestSeller: true
  },
  {
    id: 'prod-nubia-z80-ultra',
    name: 'ZTE Nubia Z60 Ultra 5G',
    description: 'Flagship Smartphone with Under-Display Selfie Camera, Snapdragon 8 Gen 3, 6000mAh Battery, and 35mm Optical Master Lens System.',
    priceGHS: 11800,
    priceUSD: 820,
    category: 'Smartphones',
    brand: 'ZTE Nubia',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop'],
    rating: 4.9,
    reviewsCount: 29,
    specs: {
      'Display': '6.8-inch AMOLED 120Hz True FullScreen (No notch/hole)',
      'Processor': 'Snapdragon 8 Gen 3',
      'Camera': '50MP 35mm Optical + 50MP 18mm Wide + 64MP 85mm Telephoto',
      'Battery': '6000 mAh Silicon-Carbon, 80W Fast Charge'
    },
    colors: ['Black Starry', 'Silver Photographer Edition'],
    isNew: true,
    stock: 10,
    isFeatured: true
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    title: '5 Crucial Tips for Extending Your Smartphone Battery Life in Ghana',
    content: `Ghanaian humidity and ambient temperatures can significantly impact lithium-ion smartphone batteries. High ambient heat accelerates chemical wear inside battery cells, while heavy usage on mobile network data can generate additional heat.

### 1. Avoid Direct Sunlight & Dashboard Exposure
Leaving your device on a car dashboard under direct tropical sunlight can cause temperatures to spike past 45°C. This leads to permanent capacity degradation and accelerated drain.

### 2. Use Certified Fast Chargers
Unregulated local knock-off wall adapters lack over-voltage protection circuits. Invest in original or GaN-certified adapters (Anker, Apple, Samsung) to ensure steady current delivery without spiking battery heat.

### 3. Maintain 20%-80% Charge Cycles
Lithium-ion batteries experience the most physical stress when pushed to 0% or kept continuously at 100%. Keeping your daily charge level between 20% and 80% can extend total cycle life by up to 3x.

### 4. Manage Background App Refresh & 5G Search
In areas with fluctuating network strength, your phone increases power output to search for towers. Toggle to 4G LTE mode when 5G signal is sparse to save up to 25% battery daily.`,
    author: 'Kwame Mensah',
    date: 'July 18, 2026',
    readTime: '4 min read',
    category: 'Repair Tips',
    tags: ['Battery Care', 'Hardware Maintenance', 'iPhone', 'Android'],
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop',
    likes: 42,
    comments: [
      {
        author: 'Kofi Owusu',
        text: 'Great advice! Switching my phone off 5G in East Legon saved me so much battery during long days.',
        date: 'July 19, 2026'
      }
    ]
  },
  {
    id: 'blog-2',
    title: 'iPhone 15 Pro Max vs. Samsung Galaxy S24 Ultra: Accra Buyer Guide',
    content: `Choosing between Apple and Samsung flagships in Ghana involves more than just camera specs. Local network connectivity, resale value in Circle and Cantonments, and warranty coverage all play vital roles.

### Camera Performance in Sunlight
The Galaxy S24 Ultra features a 200MP sensor with anti-reflective Gorilla Armor glass, making outdoor viewing crisp under bright sunlight. The iPhone 15 Pro Max delivers unmatched ProRes video recording and 5x optical zoom clarity.

### Resale Value & Trade-In Returns
iPhones historically retain 15-20% higher trade-in value in Accra markets after 24 months. However, Samsung's local warranty programs and screen protection plans provide strong peace of mind.`,
    author: 'Abena Osei',
    date: 'July 10, 2026',
    readTime: '6 min read',
    category: 'Buying Guides',
    tags: ['iPhone', 'Samsung', 'Flagship Comparison', 'Accra Tech'],
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
    likes: 89,
    comments: []
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    discountPercent: 10,
    active: true
  },
  {
    code: 'IMMORTAL50',
    discountPercent: 15,
    active: true
  }
];
