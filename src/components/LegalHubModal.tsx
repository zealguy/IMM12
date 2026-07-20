import React, { useState, useMemo } from 'react';
import { 
  X, Scale, Shield, FileText, Truck, Wrench, Award, CreditCard, 
  HelpCircle, Info, Phone, Briefcase, Newspaper, Leaf, Search, 
  Printer, Check, ExternalLink, Globe, Eye, EyeOff, Terminal, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LegalHubModalProps {
  onClose: () => void;
  initialTab?: string;
}

export default function LegalHubModal({ onClose, initialTab = 'terms' }: LegalHubModalProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Categories definition
  const categories = [
    {
      id: 'agreements',
      label: 'Legal Agreements',
      items: [
        { id: 'terms', label: 'Terms & Conditions', icon: Scale },
        { id: 'privacy', label: 'Privacy Policy', icon: Shield },
        { id: 'acceptable-use', label: 'Acceptable Use Policy', icon: FileText },
        { id: 'disclaimer', label: 'General Disclaimer', icon: Info },
      ]
    },
    {
      id: 'customer',
      label: 'Customer Support & Policies',
      items: [
        { id: 'refunds', label: 'Refund & Return Policy', icon: CreditCard },
        { id: 'shipping', label: 'Shipping & Delivery Policy', icon: Truck },
        { id: 'repairs', label: 'Repair Service Policy', icon: Wrench },
        { id: 'warranty', label: 'Warranty Policy', icon: Award },
        { id: 'payment', label: 'Payment Policy', icon: CreditCard },
        { id: 'cookies', label: 'Cookie Policy', icon: Globe },
        { id: 'returns-exchanges', label: 'Returns & Exchanges Guide', icon: FileText },
        { id: 'shipping-info', label: 'Shipping Information Desk', icon: Truck },
        { id: 'warranty-info', label: 'Warranty Registration Info', icon: Award },
        { id: 'repair-service-terms', label: 'Repair Service Terms', icon: Wrench },
      ]
    },
    {
      id: 'corporate',
      label: 'Corporate & Community',
      items: [
        { id: 'about', label: 'About Immortal Electronics', icon: Info },
        { id: 'contact', label: 'Contact Us', icon: Phone },
        { id: 'faq', label: 'Frequently Asked Questions', icon: HelpCircle },
        { id: 'accessibility', label: 'Accessibility Statement', icon: Globe },
        { id: 'security', label: 'Security Policy', icon: Shield },
        { id: 'vendor-policy', label: 'Vendor & Supplier Policy', icon: Briefcase },
        { id: 'careers', label: 'Careers & Vacancies', icon: Briefcase },
        { id: 'press', label: 'Press & Media Center', icon: Newspaper },
        { id: 'sustainability', label: 'Sustainability & E-Waste', icon: Leaf },
        { id: 'community', label: 'Community Guidelines', icon: HelpCircle },
      ]
    }
  ];

  // All documents contents mapped by id
  const documentContents: Record<string, { title: string; lastUpdated: string; content: React.ReactNode }> = {
    'terms': {
      title: 'Terms & Conditions',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Welcome to <strong>Immortal Electronics</strong>. By accessing or using our website, services, physical repair stations, and order frameworks, you agree to comply with and be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our website.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-[#0066FF] font-mono">1.</span> About Us
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Immortal Electronics is a premier certified electronics retailer, diagnostics center, and device trade-in/swap service desk based in Circle Ebony, Accra, Ghana. We specialize in:
            </p>
            <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>New and Premium Certified Pre-Owned (UK Used) Smartphones</li>
              <li>High-Performance Laptops, Computing stations, and Workstations</li>
              <li>Gaming Devices, Accessories, and Peripheral Hardware</li>
              <li>Advanced Micro-Repair Operations, Diagnostics, Software Installation, and Data Recovery</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-[#0066FF] font-mono">2.</span> Eligibility
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              You must be at least 18 years old or have explicit permission from a parent or legal guardian to make purchases, book repairs, or submit device valuation swaps through our channels.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-[#0066FF] font-mono">3.</span> Product Information & Accuracy
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              We strive to ensure all product descriptions, high-contrast images, specifications, and prices are completely accurate. However, product colors may vary slightly depending on your display settings. Specifications and availability remain subject to change and stock limitations. Prices may fluctuate based on global currency rates and import duties.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-[#0066FF] font-mono">4.</span> Orders, Reservations, & Fraud Prevention
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              We reserve the right to accept or decline any order, cancel transactions that trigger high-risk fraud alerts, or request additional verification before dispatching couriers. To prevent malicious intent, duplicate or false orders will result in immediate account suspension.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-[#0066FF] font-mono">5.</span> Pricing & Regional Dispatch Fees
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Prices are displayed in Ghana Cedis (GHS) unless otherwise toggle-selected (e.g., USD). Regional taxes, customs duties, and local delivery fees will be applied during final checkout validation depending on your selected courier dispatch tier.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-[#0066FF] font-mono">6.</span> Payment Gateways
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              We support standard local mobile payment pathways including <strong>MTN Mobile Money (MoMo)</strong>, <strong>Telecel Cash</strong>, and <strong>AT Money</strong>, alongside standard credit/debit networks (Visa, Mastercard) and secure bank transfers. Orders are only scheduled for courier dispatch after verified payment confirmation.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-[#0066FF] font-mono">7.</span> Repair Service Declarations
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              All repair estimates and quotations are formulated based on the initial diagnosis. Additional device faults uncovered during repair surgery may require further customer authorization. Immortal Electronics is not liable for data loss during repair or software errors arising from third-party applications. Back up your data before booking diagnostics.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-[#0066FF] font-mono">8.</span> Limitation of Liability
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Immortal Electronics, its executives, and repair technicians shall not be liable for indirect, incidental, or consequential damages resulting from the use of our services, except where strictly mandated under the laws of the Republic of Ghana.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-[#0066FF] font-mono">9.</span> Governing Law
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              These Terms and Conditions are governed by and construed in accordance with the laws of the Republic of Ghana, and you submit to the exclusive jurisdiction of the courts in Accra for the resolution of any legal disputes.
            </p>
          </section>
        </div>
      )
    },
    'privacy': {
      title: 'Privacy Policy',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            At Immortal Electronics, we value your privacy and security. This Privacy Policy details how we collect, store, and safeguard your personal details when you interact with our website, book diagnostic procedures, purchase accessories, or process trade-in valuations.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Information We Collect</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              To provide you with a smooth ecommerce and repair dispatch system, we collect:
            </p>
            <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li><strong>Contact Information:</strong> Your name, active email, and Ghanaian mobile number.</li>
              <li><strong>Physical Data:</strong> Shipping coordinates, residential/business address, and city coordinates.</li>
              <li><strong>Payment Telemetry:</strong> Secure gateway receipts, transaction hash indicators, and MoMo network metadata.</li>
              <li><strong>Device Diagnosis Data:</strong> Hardware descriptions, serial numbers, IMEI indexes, and device fault descriptions.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">How We Use Your Information</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Your details are used solely to process orders, deliver purchased items via motorcycle dispatch, track scheduled repairs, calculate trade-in estimates, verify identity during store pickups, and prevent fraudulent transactions on our MoMo gateway.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Data Protection Measures</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              We implement comprehensive security infrastructure to ensure your data is guarded:
            </p>
            <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>Full 256-bit SSL encryption across all data pathways.</li>
              <li>Secure tokenized authentication for administrative operations.</li>
              <li>Database encryption on rest, back-ups, and restricted server access rules.</li>
              <li>Third-party tokenization of payment records (we do not store credit card or mobile money PINs).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Your Data Rights</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              You possess the right to query what information we store about you, update inaccurate addresses, request deletion of your account history, or withdraw communication consents at any time.
            </p>
          </section>
        </div>
      )
    },
    'acceptable-use': {
      title: 'Acceptable Use Policy',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            This Acceptable Use Policy defines the rules governing user conduct when interacting with the online services of Immortal Electronics.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Prohibited System Behaviors</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Users are strictly forbidden from executing any of the following malicious activities:
            </p>
            <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>Attempting unauthorized server logins, database crawling, or privilege escalation.</li>
              <li>Distributing malicious spyware, automated scripts, worms, or trojans.</li>
              <li>Faking orders, placing duplicate sham orders with empty mobile money accounts, or inputting fabricated shipping addresses.</li>
              <li>Spamming our AI assistance desk, filing fake bulk inquiries, or manipulating review structures.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">System Enforcement</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Violations of this policy will lead to immediate IP blacklisting, cancellation of pending physical deliveries, and notification of the National Cyber Security Authority of Ghana for active prosecution under the Cybersecurity Act 2020.
            </p>
          </section>
        </div>
      )
    },
    'disclaimer': {
      title: 'General Disclaimer',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Please read this disclaimer carefully before exploring or procuring any services from Immortal Electronics.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">General Information Only</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              The details, specs, and price valuations presented on this website are for general promotional purposes. While we strive for daily catalog updates, manufacturers may modify specs, and local marketplace rates may fluctuate before we can update our digital portal.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">UK Used & Refurbished Grading</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              UK Used smartphones, computers, and devices are pre-owned. Each item undergoes an extensive 40-point diagnostic check; however, minor cosmetic surface wear should be expected, and original battery health will vary from factory specifications.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Repairs & External Software Faults</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Repair actions may occasionally uncover fatal motherboards or liquid-compromised defects. We diagnose and proceed in good faith but are not liable for subsequent software crashes triggered by third-party installations or unrelated system failures after our workbench operations are complete.
            </p>
          </section>
        </div>
      )
    },
    'refunds': {
      title: 'Refund & Return Policy',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Our goal is to ensure you are entirely satisfied with your premium electronics purchases. Please review our refund guidelines, formulated in accordance with the Consumer Protection framework of Ghana.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Return Eligibility Period</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Eligible items can be returned within <strong>7 calendar days</strong> from the delivery timestamp. Returns are initiated by contacting our customer desk or visiting our shop location in Accra with your original store invoice receipt.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Items Eligible for Returns</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Products are accepted for returns if:
            </p>
            <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>They possess verified manufacturer hardware defects or functional blockages on startup.</li>
              <li>The incorrect model, color, capacity, or specifications were delivered by our dispatch rider.</li>
              <li>They remain completely in their original, unopened manufacturer packaging with intact seal bands (applicable to Brand New items only).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Products Non-Eligible for Returns</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              We cannot offer refunds or swaps for:
            </p>
            <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>Physical, liquid, screen crack, or display-line damage caused after purchase.</li>
              <li>Devices showing software locks, firmware alterations, jailbreaks, or attempts at third-party repair outside of Immortal Electronics.</li>
              <li>Used consumables (opened screen protectors, customized device skins, battery units, or cables).</li>
              <li>Devices returned without their corresponding original packaging, box accessories, or warranty stickers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Refund Processing Mode</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Once returned devices are thoroughly audited by our lead technicians and approved, we will process the refund to your original payment account (e.g., MTN MoMo, Telecel Cash, or bank card) within 48 business hours. Processing times may vary depending on local carrier settlements.
            </p>
          </section>
        </div>
      )
    },
    'shipping': {
      title: 'Shipping & Delivery Policy',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Immortal Electronics offers swift, reliable, and trackable courier delivery options across Accra and nationwide within Ghana.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Available Delivery Options</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl">
                <span className="font-bold block text-[#0066FF] mb-1">Standard Accra Dispatch</span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Within 24 hours of confirmation. Standard delivery to most Accra suburbs.</p>
                <span className="block mt-2 font-mono font-bold text-gray-800 dark:text-gray-200">GHS 35</span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl">
                <span className="font-bold block text-[#0066FF] mb-1">Expedited Motorcycle Courier</span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Same-day delivery by motorcycle couriers for rush orders.</p>
                <span className="block mt-2 font-mono font-bold text-gray-800 dark:text-gray-200">GHS 55</span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl">
                <span className="font-bold block text-[#0066FF] mb-1">In-Store Pickup</span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Collect your item immediately at our Circle Ebony store in Accra.</p>
                <span className="block mt-2 font-mono font-bold text-gray-800 dark:text-gray-200">FREE</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Delivery Inspections</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              For your security, we advise you to thoroughly inspect your package in the presence of our courier dispatch rider before signing the delivery acceptance receipt. Report any physical transit damage immediately to our helpline.
            </p>
          </section>
        </div>
      )
    },
    'repairs': {
      title: 'Repair Service Policy',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Our diagnostic team operates a certified hardware and micro-soldering workstation in Accra. We utilize premium, grade-A replacement screens, batteries, and charging ports.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Customer Responsibilities</h4>
            <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>Back up all physical storage directories, pictures, and contacts before handing devices to our staff.</li>
              <li>Remove external storage microSD expansions and SIM cards if possible.</li>
              <li>Provide our technicians with any required diagnostic passcode if necessary for internal verification.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Unclaimed Repaired Devices</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Repaired devices left unclaimed at our Accra station for more than 45 days after repair completion alerts are dispatched will accrue a storage premium of GHS 10 per additional day. Devices unclaimed for over 90 days may be legally disposed of to offset repair parts and labor expenses, as permitted under Ghanaian commercial regulations.
            </p>
          </section>
        </div>
      )
    },
    'warranty': {
      title: 'Warranty Policy',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Immortal Electronics stands by our grading and hardware repairs. We supply standard store warranties to give you absolute peace of mind.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Warranty Coverage Tiers</h4>
            <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li><strong>Brand New Products:</strong> Covered under standard manufacturer warranty, typically ranging from 12 to 24 months.</li>
              <li><strong>UK Used Premium Smartphones:</strong> Covered under our comprehensive <strong>90-Day Store Warranty</strong> guarding internal hardware motherboards, sensors, and IC components.</li>
              <li><strong>Workship & Repair Tasks:</strong> Covered under our <strong>30-Day Workmanship Warranty</strong> specifically covering the replaced hardware parts (e.g. replaced screen, battery, or port).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Strict Warranty Exclusions</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Warranties are immediately voided under the following scenarios:
            </p>
            <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>Evidence of physical force, drops, screen cracks, or chassis dents.</li>
              <li>Liquid entry, moisture exposure, or chemical corrosion.</li>
              <li>Attempted repair surgeries by uncertified external mechanics.</li>
              <li>Overvoltage surges, lightning strikes, or generator power fluctuations.</li>
            </ul>
          </section>
        </div>
      )
    },
    'payment': {
      title: 'Payment Policy',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Our payment guidelines ensure secure and rapid processing of all ecommerce checkout operations.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Accepted Mobile & Card Gateways</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3.5 bg-[#F5B800]/10 border border-[#F5B800]/20 rounded-xl text-yellow-800 dark:text-yellow-400">
                <span className="font-bold block text-sm">MTN MoMo</span>
                <p className="text-[10px] mt-0.5">Most popular mobile payment. Prompts directly via USSD on your phone.</p>
              </div>
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 dark:text-red-400">
                <span className="font-bold block text-sm">Telecel Cash</span>
                <p className="text-[10px] mt-0.5">Voucher code required. Securely integrated with carrier API protocols.</p>
              </div>
              <div className="p-3.5 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-800 dark:text-teal-400">
                <span className="font-bold block text-sm">AT Money</span>
                <p className="text-[10px] mt-0.5">AirtelTigo payment system. Rapid network clearance.</p>
              </div>
              <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-800 dark:text-blue-400">
                <span className="font-bold block text-sm">Visa / Mastercard</span>
                <p className="text-[10px] mt-0.5">Secure payment card processing with 3D-Secure layers.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Cash on Delivery Rules</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              We offer Cash on Delivery strictly for approved, verified residential coordinates in central Accra suburbs. For high-value premium smartphones and custom computed hardware, our dispatch team may require a minimal MoMo deposit as freight security before dispatching the rider.
            </p>
          </section>
        </div>
      )
    },
    'cookies': {
      title: 'Cookie Policy',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Our website uses cookies to optimize your catalog navigation experience and speed up transaction checkpoints.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Why We Deploy Cookies</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Cookies help us keep your shopping cart loaded, preserve currency preferences (GHS vs USD), remember recent searches, and provide diagnostic performance metrics to our server architecture.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Managing Cookies</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              You can block or purge cookies through your personal browser configuration settings. Be advised that blocking cookies may disrupt catalog filtration, cart retention, and other responsive scripts on our server.
            </p>
          </section>
        </div>
      )
    },
    'returns-exchanges': {
      title: 'Returns & Exchanges Guide',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            This guide outlines the precise steps required to complete a hardware exchange or store credit adjustment at Immortal Electronics.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">The Return Loop - Steps to Follow</h4>
            <ol className="list-decimal pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>Contact our support team via WhatsApp with your Invoice ID.</li>
              <li>Submit 3 clear pictures showing the current hardware condition and the specific defect.</li>
              <li>Wait for our technician validation approval email or message.</li>
              <li>Bring the device to our Circle Ebony shop or schedule our motorcycle courier for pickup.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Exchanges for Capacity or Colors</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              If you purchased an item and wish to upgrade the internal storage capacity (e.g. 128GB to 256GB) or swap color housings, you may do so within 3 calendar days of purchase, provided the device remains in unused, immaculate condition. Value difference adjustments must be settled via MoMo or cash on the spot.
            </p>
          </section>
        </div>
      )
    },
    'shipping-info': {
      title: 'Shipping Information Desk',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Find details regarding our delivery parameters, courier networks, and packaging safety rules.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Nationwide Dispatch Outside Accra</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              For clients residing outside of Accra (including Kumasi, Tamale, Takoradi, Koforidua, and Sunyani), we partner with vetted regional bus networks and courier groups (e.g., VIP, STC, and Fedex Ghana). Deliveries to these hubs are secured in protective, tamper-proof packages and dispatched within 24 hours of mobile payment confirmation.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Packaging Security Measures</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Every dispatched smartphone and laptop is enveloped in triple-layer bubble wrap, secured with heavy-gauge sealing tapes, and housed in customized shock-absorbent boxes. This completely prevents hardware stress during transit.
            </p>
          </section>
        </div>
      )
    },
    'warranty-info': {
      title: 'Warranty Registration Info',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            How to verify, register, and file standard warranty claims for your newly acquired electronics and computing devices.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Automatic Store Registration</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              At Immortal Electronics, you do not need to fill out tedious paper forms. Your warranty is automatically registered electronically on our servers the exact moment your MoMo checkout validates or your cash invoice is generated, keyed directly to your device IMEI or Serial Number.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">How to File a Warranty Claim</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              If your device experiences screen flickering, motherboards loops, or charge port faults within your warranty bracket, contact us immediately. Avoid opening the casing or inviting third-party testing, as this will immediately void the electronic tracking sticker placed inside the device casing.
            </p>
          </section>
        </div>
      )
    },
    'repair-service-terms': {
      title: 'Repair Service Terms',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            These terms define the commercial contract established when you submit a device for micro-soldering, diagnostics, or screen replacements.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Diagnostic Pricing Structure</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              We charge a standard diagnosis fee of GHS 50 to cover labor, diagnostic tools, and workbench analysis. This diagnosis fee is fully waived if you proceed with our repair recommendation.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Parts Procurement Contract</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              For highly complex computing systems or rare smartphone repairs, custom hardware components may need to be imported. This requires a 50% non-refundable part-booking deposit before shipment is initiated.
            </p>
          </section>
        </div>
      )
    },
    'about': {
      title: 'About Immortal Electronics',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <strong>Immortal Electronics</strong> is Accra's foremost technology station and digital retail hub, serving thousands of Ghanaian consumers with unparalleled hardware quality and tech-longevity services.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Our Mission</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Our mission is to democratize high-end flagships and premium workstations by supplying affordable certified pre-owned gadgets, accompanied by world-class technical diagnostics, ensuring electronics have a sustainable, circular lifespan. We believe high-quality tech shouldn't expire.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Our Founders & Technicians</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Founded in Accra, Ghana, and led by tech visionary Benjamin Danso, Immortal Electronics comprises an elite crew of hardware engineers, certified software technicians, and prompt customer representatives. Our physical operations center is situated in the heart of Circle Ebony, the active tech district of Accra.
            </p>
          </section>
        </div>
      )
    },
    'contact': {
      title: 'Contact Information & Shop Location',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Get in touch with our customer representatives, book store pickups, or locate our physical diagnostic center in Accra.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-150 dark:border-white/5 rounded-xl space-y-2">
              <span className="font-bold block text-[#0066FF] uppercase font-mono">Store Coordinates</span>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li><strong>District:</strong> Circle Ebony</li>
                <li><strong>City:</strong> Accra, Republic of Ghana</li>
                <li><strong>Locator landmark:</strong> Behind VIP Station</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-150 dark:border-white/5 rounded-xl space-y-2">
              <span className="font-bold block text-[#0066FF] uppercase font-mono">Direct Communication</span>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li><strong>Phone/WhatsApp:</strong> +233 54 795 6875</li>
                <li><strong>Alternative Mobile:</strong> +233 59 872 9101</li>
                <li><strong>Support Email:</strong> support@immortalgadgets.com</li>
              </ul>
            </div>
          </div>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Business Hours</h4>
            <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-150 dark:border-white/5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span>Monday – Saturday</span>
                <span className="font-bold text-[#0066FF]">8:00 AM – 6:00 PM</span>
              </div>
              <div className="flex justify-between py-1 mt-1 text-red-500 font-medium">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </section>
        </div>
      )
    },
    'faq': {
      title: 'Frequently Asked Questions (FAQ)',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Find rapid, direct answers to common queries regarding our products, repairs, and billing policies.
          </p>

          <div className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-150 dark:border-white/5 rounded-xl">
              <span className="font-bold text-xs block text-gray-900 dark:text-white">Q: What exactly is a "UK Used" smartphone?</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                A: "UK Used" refers to Grade-A certified pre-owned devices imported directly from major UK cellular networks. They are completely functional, sanitized, and undergo a 40-point quality check.
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-150 dark:border-white/5 rounded-xl">
              <span className="font-bold text-xs block text-gray-900 dark:text-white">Q: Do you accept payment plans or credit installments?</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                A: We offer custom corporate payment terms for approved business partnerships. For individual consumers, we accept mobile money payments and bank card clearance before dispatch.
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-150 dark:border-white/5 rounded-xl">
              <span className="font-bold text-xs block text-gray-900 dark:text-white">Q: How can I track my courier delivery or repair progress?</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                A: You will receive a unique dispatch tracking code upon purchase or repair registration. Use the tracking fields in our customer dashboard to view status in real time.
              </p>
            </div>
          </div>
        </div>
      )
    },
    'accessibility': {
      title: 'Accessibility Statement',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Immortal Electronics is committed to ensuring our digital storefront is fully accessible to all individuals, regardless of physical ability or device constraint.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Implemented Web Standards</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              We conform strictly to WCAG 2.1 level AA standards. This includes maintaining proper color contrast, support for keyboard-only navigation pathways, proper text sizing, alt texts for device diagrams, and accessibility labels for text readers.
            </p>
          </section>
        </div>
      )
    },
    'security': {
      title: 'Security Policy',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Our technology team works around the clock to secure our transactional gateways, user accounts, and physical shop workstations.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Core Security Vectors</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              All browser connections operate on strict HTTPS/TLS protocols. Client data is backed up daily to multi-zone cloud facilities. Physical access to our diagnostics workshop is strictly restricted to certified security-vetted engineers.
            </p>
          </section>
        </div>
      )
    },
    'vendor-policy': {
      title: 'Vendor & Supplier Policy',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            We hold our global suppliers and regional distributors to the highest commercial standards to prevent fraudulent imports or compromised device shipments.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Certification Standards</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Every imported device supplier must provide authenticated proof-of-origin invoices and clearance stickers. We enforce strict audits to prevent the purchase or resale of stolen blacklisted electronics.
            </p>
          </section>
        </div>
      )
    },
    'careers': {
      title: 'Careers & Vacancies',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Join the fastest-growing certified electronics enterprise and diagnostic workstation crew in Ghana!
          </p>

          <div className="space-y-3">
            <span className="text-xs font-bold block text-gray-900 dark:text-white">Current Open Positions:</span>
            <div className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-150 dark:border-white/5 rounded-xl text-xs space-y-1">
              <span className="font-bold text-[#0066FF]">1. Senior Micro-Soldering Technician</span>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Accra Station. Experience in logic board diagnostics, IC reballing, and schematic analysis required.</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-150 dark:border-white/5 rounded-xl text-xs space-y-1">
              <span className="font-bold text-[#0066FF]">2. Customer Relations & Support Officer</span>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Circle Ebony Showroom. Exceptional communication skills, knowledge of smartphone specs, and friendly demeanor.</p>
            </div>
          </div>
        </div>
      )
    },
    'press': {
      title: 'Press & Media Center',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Read corporate updates, leadership notes, and download official press assets for Immortal Electronics Ghana.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Corporate Milestones</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Immortal Electronics recently expanded its micro-repair footprint in Circle Ebony, incorporating advanced infrared diagnosis tools. For media inquiries, contact our media desk at press@immortalgadgets.com.
            </p>
          </section>
        </div>
      )
    },
    'sustainability': {
      title: 'Sustainability & E-Waste',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            At Immortal Electronics, we believe technology should be circular. We actively advocate and engineer for a greener, cleaner Ghana.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Our E-Waste Initiatives</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              We extract and recycle usable materials from fatally damaged logic boards. We provide local e-waste drop-off bins at our Accra store, preventing battery toxins and metal chemicals from entering the local landfills.
            </p>
          </section>
        </div>
      )
    },
    'community': {
      title: 'Community Guidelines',
      lastUpdated: '10/07/2026',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Our community guidelines govern our forums, blog discussion sections, and customer feedback boards.
          </p>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Be Respectful & Constructive</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              We encourage active tech conversations. Insults, offensive language, spam, advertisement of third-party products, or fraudulent links are strictly prohibited and will result in post deletion and immediate block.
            </p>
          </section>
        </div>
      )
    }
  };

  // Memoized search list
  const filteredNavItems = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories.map(cat => {
      const filteredItems = cat.items.filter(
        item => item.label.toLowerCase().includes(query) || 
                documentContents[item.id]?.title.toLowerCase().includes(query)
      );
      return { ...cat, items: filteredItems };
    }).filter(cat => cat.items.length > 0);
  }, [searchQuery]);

  const activeDoc = documentContents[activeTab] || documentContents['terms'];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?legal=${activeTab}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden text-gray-900 dark:text-white font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-6xl h-[92vh] sm:h-[85vh] bg-white dark:bg-[#0B0B0B] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="legal-hub-modal-container"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-850 bg-gray-50/50 dark:bg-black/25 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0066FF] to-[#00CCFF] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#0066FF]/10">
              ⚡
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight uppercase flex items-center gap-1.5 text-gray-900 dark:text-white">
                <span>Immortal Policy & Legal Hub</span>
                <span className="text-[9px] bg-[#0066FF]/10 text-[#0066FF] px-1.5 py-0.5 rounded font-mono font-bold">ACCRA HQ</span>
              </h3>
              <p className="text-[10px] text-gray-400 font-mono tracking-tight">Compliance, Warranties, Terms, and Customer Rights</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Print Button */}
            <button 
              onClick={handlePrint}
              title="Print Document"
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition"
            >
              <Printer size={14} />
            </button>
            {/* Copy Link Button */}
            <button 
              onClick={handleCopyLink}
              title="Copy link to document"
              className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 text-[10px] font-bold font-mono transition flex items-center gap-1"
            >
              {copySuccess ? <Check size={11} className="text-green-500" /> : <ExternalLink size={11} />}
              <span>{copySuccess ? 'LINK COPIED' : 'SHARE LINK'}</span>
            </button>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              id="close-legal-hub-btn"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search Header for documents */}
        <div className="px-4 py-2 border-b border-gray-150 dark:border-gray-850 bg-gray-50/20 dark:bg-black/10 flex items-center gap-2">
          <Search size={14} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search policies, refunds, warranty terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-0 p-1"
            id="legal-search-input"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-gray-200">Clear</button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-850 overflow-y-auto bg-gray-50/20 dark:bg-[#080808] p-3 hidden md:block space-y-4">
            {filteredNavItems.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[9px] font-black font-mono tracking-wider text-gray-400 uppercase block px-2 mb-1.5">{cat.label}</span>
                <div className="space-y-0.5">
                  {cat.items.map(item => {
                    const IconComp = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition ${
                          isActive 
                            ? 'bg-[#0066FF] text-white font-bold' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-150 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <IconComp size={13} className={isActive ? 'text-white' : 'text-gray-400'} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredNavItems.length === 0 && (
              <div className="text-center py-8 text-gray-500 font-mono text-[10px]">No legal matches found.</div>
            )}
          </div>

          {/* Mobile responsive selector */}
          <div className="block md:hidden p-3 border-b border-gray-200 dark:border-gray-850 w-full absolute top-28 left-0 right-0 bg-white dark:bg-[#0B0B0B] z-10">
            <label className="block text-[9px] font-bold font-mono uppercase text-gray-400 mb-1">Select Legal Document</label>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 p-2 rounded-lg text-xs"
            >
              {categories.map((cat, idx) => (
                <optgroup key={idx} label={cat.label}>
                  {cat.items.map(item => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Right Document Display Panel */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-20 md:pt-8 bg-white dark:bg-gradient-to-br dark:from-[#0B0B0B] dark:to-[#080808]" id="legal-document-viewer-box">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Document Header banner */}
              <div className="border-b border-gray-150 dark:border-gray-850 pb-5 space-y-2">
                <span className="text-[10px] font-mono text-[#0066FF] bg-[#0066FF]/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                  Immortal Electronics Limited
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {activeDoc.title}
                </h1>
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                  <span>Accra, Republic of Ghana</span>
                  <span>Last Updated: {activeDoc.lastUpdated}</span>
                </div>
              </div>

              {/* Custom Warning banner style */}
              <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 text-gray-700 dark:text-amber-300 text-[11px] leading-relaxed flex items-start gap-2.5 font-mono">
                <Terminal size={14} className="mt-0.5 text-amber-500 shrink-0" />
                <div>
                  <span className="font-extrabold text-amber-500 block uppercase">Operational Startpoint Disclaimer</span>
                  This document serves as a high-fidelity operational policy template for Immortal Electronics. It does not constitute binding legal counsel. Please verify with a licensed attorney in Ghana prior to launch.
                </div>
              </div>

              {/* Active document content render */}
              <div className="prose prose-sm dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white text-gray-700 dark:text-gray-300 max-w-none">
                {activeDoc.content}
              </div>

              {/* Document Footer */}
              <div className="border-t border-gray-150 dark:border-gray-850 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-gray-400 font-mono">
                <span>© {new Date().getFullYear()} Immortal Electronics Ltd.</span>
                <span className="flex items-center gap-1">
                  <Sparkles size={10} className="text-amber-500" />
                  <span>Verified Grade-A Ghanaian Compliance</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
