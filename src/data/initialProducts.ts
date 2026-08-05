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
  },
  {
    id: 'prod-iphone16promax',
    name: 'iPhone 16 Pro Max',
    description: 'Apple flagship with Grade 5 Titanium design, A18 Pro chip, 48MP Fusion camera with 4K 120 fps Dolby Vision, and dedicated Camera Control button.',
    priceGHS: 25500,
    priceUSD: 1650,
    category: 'Smartphones',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1695048132959-efd5bf9273c5?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 5.0,
    reviewsCount: 18,
    specs: {
      'Display': '6.9-inch Super Retina XDR OLED, 120Hz ProMotion',
      'Processor': 'Apple A18 Pro (3nm)',
      'Storage': '256GB / 512GB / 1TB',
      'Main Camera': '48MP Fusion + 48MP Ultra-wide + 12MP Telephoto (5x zoom)',
      'Battery': '4685 mAh, 25W MagSafe Wireless Charging',
      'OS': 'iOS 18 (Apple Intelligence Ready)'
    },
    colors: ['Desert Titanium', 'Natural Titanium', 'White Titanium', 'Black Titanium'],
    isNew: true,
    stock: 10,
    isNewArrival: true,
    isFeatured: true,
    isBestSeller: true,
    status: 'Published'
  },
  {
    id: 'prod-oneplus12',
    name: 'OnePlus 12 5G',
    description: 'Powered by Snapdragon 8 Gen 3 with 4th Gen Hasselblad Camera System for Mobile, 100W SUPERVOOC fast charging, and 2K 120Hz ProXDR display.',
    priceGHS: 12800,
    priceUSD: 850,
    category: 'Smartphones',
    brand: 'OnePlus',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 31,
    specs: {
      'Display': '6.82-inch ProXDR AMOLED QHD+, 120Hz, 4500 nits peak',
      'Processor': 'Snapdragon 8 Gen 3',
      'RAM / Storage': '12GB + 256GB / 16GB + 512GB',
      'Main Camera': '50MP Sony LYT-808 + 64MP Periscope (3x) + 48MP Ultra-wide',
      'Battery': '5400 mAh with 100W Wired & 50W AIRVOOC Wireless',
      'OS': 'OxygenOS 14 (Android 14)'
    },
    colors: ['Flowy Emerald', 'Silky Black'],
    isNew: true,
    stock: 14,
    isNewArrival: true,
    status: 'Published'
  },
  {
    id: 'prod-dellxps16',
    name: 'Dell XPS 16 Laptop (2026 Edition)',
    description: 'Crafted with CNC machined aluminum and Gorilla Glass 3, powered by Intel Core Ultra 9 with AI Boost and NVIDIA GeForce RTX 4070 graphic engine.',
    priceGHS: 38500,
    priceUSD: 2550,
    category: 'Computing',
    brand: 'Dell',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 22,
    specs: {
      'Display': '16.3-inch 4K+ (3840 x 2400) OLED Touch, 120Hz',
      'Processor': 'Intel Core Ultra 9 185H (16 Cores, 22 Threads, NPU AI Engine)',
      'RAM': '32GB LPDDR5X Dual Channel',
      'GPU': 'NVIDIA GeForce RTX 4070 (8GB GDDR6)',
      'Storage': '1TB PCIe 4.0 NVMe M.2 SSD',
      'Weight': '2.13 kg'
    },
    colors: ['Platinum Aluminum', 'Graphite'],
    isNew: true,
    stock: 6,
    isFeatured: true,
    status: 'Published'
  },
  {
    id: 'prod-ipadpro13m4',
    name: 'iPad Pro 13" M4 OLED',
    description: 'Incredibly thin design featuring the groundbreaking Ultra Retina XDR Tandem OLED display, outrageous Apple M4 chip performance, and Apple Pencil Pro support.',
    priceGHS: 22000,
    priceUSD: 1450,
    category: 'Computing',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 5.0,
    reviewsCount: 29,
    specs: {
      'Display': '13-inch Ultra Retina XDR Tandem OLED (2752 x 2064), 120Hz ProMotion',
      'Processor': 'Apple M4 Chip (9-core CPU, 10-core GPU, 16-core Neural Engine)',
      'Storage': '256GB / 512GB / 1TB',
      'Camera': '12MP Wide back camera with LiDAR Scanner + 12MP Ultra-wide front',
      'Thickness': '5.1mm Ultra-thin',
      'Connectivity': 'Wi-Fi 6E + Thunderbolt 4 / USB 4'
    },
    colors: ['Space Black', 'Silver'],
    isNew: true,
    stock: 8,
    isBestSeller: true,
    status: 'Published'
  },
  {
    id: 'prod-applewatchultra2',
    name: 'Apple Watch Ultra 2',
    description: 'The ultimate sports and adventure watch. Lightweight titanium case, bright 3000-nit Always-On Retina display, S9 SiP with double tap gesture, and up to 36 hours battery.',
    priceGHS: 12500,
    priceUSD: 820,
    category: 'Smartwatches & Wearables',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 47,
    specs: {
      'Case': '49mm Aerospace-grade Titanium',
      'Display': 'Always-On Retina OLED, up to 3000 nits peak',
      'Processor': 'Apple S9 SiP with 4-core Neural Engine',
      'Sensors': 'ECG, Blood Oxygen, Temperature sensing, Depth gauge, Water temp sensor',
      'Water Resistance': '100m (EN13319 scuba dive certified)',
      'Battery Life': 'Up to 36 hours normal use (Up to 72 hours in Low Power Mode)'
    },
    colors: ['Natural Titanium with Ocean Band', 'Black Titanium with Trail Loop'],
    isNew: true,
    stock: 12,
    isBestSeller: true,
    status: 'Published'
  },
  {
    id: 'prod-galaxywatchultra',
    name: 'Samsung Galaxy Watch Ultra',
    description: 'Engineered to push limits with Titanium cushion design, 3nm processor, dual-frequency GPS, BioActive Sensor, and multi-sport tracking for peak outdoor endurance.',
    priceGHS: 9800,
    priceUSD: 650,
    category: 'Smartwatches & Wearables',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 35,
    specs: {
      'Case': '47mm Grade 4 Titanium Cushion Design',
      'Processor': 'Exynos W1000 (3nm 5-Core)',
      'Display': '1.5-inch Super AMOLED, 3000 nits brightness',
      'Battery': '590 mAh (Up to 100 hours runtime in Power Saving)',
      'Durability': '10ATM + IP68 Waterproof + MIL-STD-810H Certified'
    },
    colors: ['Titanium Gray', 'Titanium White', 'Titanium Silver'],
    isNew: true,
    stock: 15,
    isNewArrival: true,
    status: 'Published'
  },
  {
    id: 'prod-ps5slimdigital',
    name: 'PlayStation 5 Slim Console (Digital Edition)',
    description: 'Unleash new gaming possibilities with custom 1TB SSD storage, ray tracing graphics, 4K 120Hz output, and Tempest 3D AudioTech in a sleek slim form factor.',
    priceGHS: 8200,
    priceUSD: 540,
    category: 'Gaming',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 68,
    specs: {
      'Storage': '1TB Custom High-Speed NVMe SSD (5.5GB/s Read)',
      'Processor': 'x86-64 AMD Ryzen Zen 2 (8 Cores / 16 Threads)',
      'Graphics': 'AMD Radeon RDNA 2-based graphics engine with Ray Tracing',
      'Output': '4K 120Hz TV support, 8K output, HDR technology',
      'Audio': 'Tempest 3D AudioTech'
    },
    colors: ['Ultra White'],
    isNew: true,
    stock: 10,
    isBestSeller: true,
    status: 'Published'
  },
  {
    id: 'prod-steamdeckoled',
    name: 'Steam Deck OLED 1TB Handheld PC',
    description: 'The ultimate handheld PC gaming machine. Stunning 7.4-inch HDR OLED display, faster Wi-Fi 6E download speeds, longer battery life, and premium anti-glare etched glass.',
    priceGHS: 10500,
    priceUSD: 690,
    category: 'Gaming',
    brand: 'Valve',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 5.0,
    reviewsCount: 52,
    specs: {
      'Display': '7.4-inch HDR OLED (1280 x 800), 90Hz, 1000 nits peak',
      'APU': '6nm AMD APU (Zen 2 4c/8t + RDNA 2 8 CUs)',
      'RAM / Storage': '16GB LPDDR5 + 1TB NVMe High-Speed SSD',
      'Battery': '50Whr (3-12 hours gameplay)',
      'Connectivity': 'Wi-Fi 6E (2.4GHz, 5GHz, 6GHz) + Bluetooth 5.3'
    },
    colors: ['Matte Black with Premium Etched Glass'],
    isNew: true,
    stock: 8,
    isNewArrival: true,
    status: 'Published'
  },
  {
    id: 'prod-eufycam3-4k',
    name: 'eufyCam 3 4K Solar Security Camera 2-Cam Kit',
    description: '4K Ultra HD wireless solar security camera system with integrated solar panels for infinite power, BionicMind AI facial recognition, and expandable local storage without monthly fees.',
    priceGHS: 7500,
    priceUSD: 490,
    category: 'Smart Home',
    brand: 'Anker eufy',
    image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 29,
    specs: {
      'Resolution': '4K Ultra HD (3840 x 2160) with 8x Zoom',
      'Solar Power': 'Integrated Solar Panel (2 hours direct sunlight = forever power)',
      'AI Detection': 'BionicMind AI (Self-learning Facial, Human, Vehicle, Pet Recognition)',
      'Night Vision': 'Starlight Color Night Vision with built-in spotlight',
      'Storage': '16GB EMMC on HomeBase 3 (Expandable up to 16TB 2.5" HDD/SSD)'
    },
    colors: ['Clean White'],
    isNew: true,
    stock: 12,
    status: 'Published'
  },
  {
    id: 'prod-ankerprime20k',
    name: 'Anker Prime 20,000mAh Power Bank (200W)',
    description: 'Ultra-powerful 200W total output power bank capable of charging two laptops simultaneously at 100W each. Smart digital display shows battery percentage and live wattage.',
    priceGHS: 1950,
    priceUSD: 130,
    category: 'Accessories',
    brand: 'Anker',
    image: 'https://images.unsplash.com/photo-1609592424074-884249bc8063?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1609592424074-884249bc8063?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 84,
    specs: {
      'Capacity': '20,000 mAh (72Wh / Flight Approved)',
      'Ports': '2x USB-C (100W Max each) + 1x USB-A (65W Max)',
      'Total Output': '200W Max Simultaneous Output',
      'Recharge Speed': '100W Fast Input Recharge (0 to 100% in 75 mins)',
      'Display': 'Smart Color LCD Screen (Live Input/Output wattage, battery %)'
    },
    colors: ['Graphite Black'],
    isNew: true,
    stock: 25,
    isBestSeller: true,
    status: 'Published'
  },
  {
    id: 'prod-djimini4pro',
    name: 'DJI Mini 4 Pro Drone (Fly More Combo)',
    description: 'Flagship mini camera drone under 249g. 4K/60fps HDR true vertical video, omnidirectional obstacle sensing, ActiveTrack 360°, and 20km O4 FHD video transmission.',
    priceGHS: 16500,
    priceUSD: 1080,
    category: 'Accessories',
    brand: 'DJI',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 5.0,
    reviewsCount: 38,
    specs: {
      'Takeoff Weight': '<249 g (Ultralight & Foldable)',
      'Camera Sensor': '1/1.3-inch CMOS 48MP, Dual Native ISO Fusion',
      'Video Resolution': '4K/60fps HDR & 4K/100fps Slow Motion (True Vertical Shooting)',
      'Sensing System': 'Omnidirectional Binocular Vision + 3D Infrared Sensor',
      'Video Transmission': 'DJI O4 (Up to 20km 1080p/60fps live feed)',
      'Flight Time': 'Up to 34 minutes per battery (3x Intelligent Flight Batteries included)'
    },
    colors: ['Arctic White'],
    isNew: true,
    stock: 5,
    isFeatured: true,
    status: 'Published'
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
