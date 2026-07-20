# Security Specification for Immortal Electronics Firestore

This document outlines the security invariants, threat modeling ("Dirty Dozen" payloads), and safety constraints for the Immortal Electronics Firestore database.

## 1. Data Invariants and Integrity Rules

1. **Order Identity & Integrity**: A customer can place an order, but they cannot alter or modify an order's `status` or `paymentStatus` once created. Only authorized personnel/systems can update these administrative fields.
2. **Product Catalogs (Read-Only to Public)**: Regular customers can query and read the `products` collection, but writing (creating, updating, deleting) is restricted to administrators or automated background systems.
3. **Repairs & Trade-ins**: A customer can submit a repair or trade-in request. They can read their request using its unique `id` or tracking number, but they are forbidden from modifying technical quotes (`quotationGHS`, `valuationEstimateGHS`) or status fields after submission.
4. **Temporal Consistency**: Timestamp fields (`createdAt`) must exactly match `request.time` on creation.
5. **PII Protection**: Customer contact details (phone, email, home/office address) are strictly protected and only accessible by authorized managers or the owner of the document.

---

## 2. Threat Modeling: The "Dirty Dozen" Malicious Payloads

The following 12 payloads represent malicious attempts to bypass identity, integrity, and state constraints. Each of these must be blocked and return `PERMISSION_DENIED` by the firestore ruleset.

### Payload 1: Admin Privilege Escalation on Product Catalog (Create)
*   **Target**: `/products/prod-malicious`
*   **Attack Vector**: Unauthorized user attempting to inject a cheap dummy product to exploit the checkout cart.
```json
{
  "id": "prod-malicious",
  "name": "Hacked Cheap iPhone 15",
  "priceGHS": 1,
  "priceUSD": 0.1,
  "category": "Smartphones",
  "brand": "Apple",
  "image": "https://example.com/fake.jpg",
  "stock": 9999
}
```

### Payload 2: Arbitrary Price Modification of Existing Product
*   **Target**: `/products/prod-iphone15promax`
*   **Attack Vector**: Regular client trying to change the price of the real iPhone 15 Pro Max to 10 GHS before checkout.
```json
{
  "priceGHS": 10,
  "priceUSD": 1
}
```

### Payload 3: Fraudulent Status Bypass on Order Creation
*   **Target**: `/orders/ord-fraud1`
*   **Attack Vector**: A user trying to set their order state directly to `Shipped` or `paymentStatus` to `Paid` without making actual payment.
```json
{
  "id": "ord-fraud1",
  "items": [],
  "totalGHS": 21500,
  "totalUSD": 1450,
  "status": "Shipped",
  "paymentMethod": "Mobile Money",
  "paymentStatus": "Paid",
  "customerName": "Attacker",
  "customerPhone": "0244111222",
  "address": "Accra Central",
  "city": "Accra",
  "trackingNumber": "IM-ORD-999999",
  "createdAt": "2026-07-13T21:00:00Z"
}
```

### Payload 4: Overwriting Relational Tracking Identifiers (Immutability Violation)
*   **Target**: `/orders/ord-real`
*   **Attack Vector**: Attempting to alter `trackingNumber` or `createdAt` on an existing order.
```json
{
  "trackingNumber": "IM-ORD-111111"
}
```

### Payload 5: Tech-Quote Injection on Technical Repair Submission
*   **Target**: `/repairs/rep-test1`
*   **Attack Vector**: Customer trying to set their own diagnostic/repair quote to GHS 1.
```json
{
  "id": "rep-test1",
  "customerName": "Fraudulent Customer",
  "customerPhone": "0244333444",
  "deviceType": "Smartphone",
  "faultCategory": "Screen",
  "faultDescription": "Cracked OLED panel",
  "status": "Pending",
  "quotationGHS": 1,
  "quotationUSD": 0.1,
  "trackingNumber": "IM-REP-000001",
  "createdAt": "2026-07-13T21:00:00Z"
}
```

### Payload 6: Forging Final Valuation on Trade-in Appraisals
*   **Target**: `/tradeins/trd-test1`
*   **Attack Vector**: Customer attempting to claim a final offer of GHS 15,000 on a broken device.
```json
{
  "id": "trd-test1",
  "customerName": "Greedy Seller",
  "customerPhone": "0555555555",
  "deviceType": "Smartphone",
  "condition": "Broken",
  "status": "Submitted",
  "trackingNumber": "IM-TRD-000001",
  "createdAt": "2026-07-13T21:00:00Z",
  "finalOfferGHS": 15000,
  "finalOfferUSD": 1000
}
```

### Payload 7: Timestamp Forgery (Temporal Fraud)
*   **Target**: `/repairs/rep-test2`
*   **Attack Vector**: Sending client-fabricated `createdAt` date to jump forward/backward in the queue.
```json
{
  "id": "rep-test2",
  "customerName": "John Doe",
  "customerPhone": "0243444555",
  "deviceType": "Smartphone",
  "faultCategory": "Battery",
  "faultDescription": "Needs battery replacement",
  "status": "Pending",
  "trackingNumber": "IM-REP-111222",
  "createdAt": "2020-01-01T00:00:00Z"
}
```

### Payload 8: Self-Creation of High-Value Discount Coupons
*   **Target**: `/coupons/FREE99`
*   **Attack Vector**: Attacker injects a custom 99% off discount code.
```json
{
  "code": "FREE99",
  "discountPercent": 99,
  "active": true,
  "minSpendGHS": 0
}
```

### Payload 9: Unauthorized Blog Comment Spams
*   **Target**: `/blogs/blog-1`
*   **Attack Vector**: Modifying existing blog structure arbitrarily or setting malicious `likes` numbers (e.g. setting likes to 9,999,999).
```json
{
  "likes": 9999999
}
```

### Payload 10: Denial of Wallet ID Poisoning (Resource Exhaustion)
*   **Target**: `/orders/ord-super-long-garbage-character-string-designed-to-bloat-the-database-indexes-and-exhaust-memory-buffers-abcdefghijklmnopqrstuvwxyz`
*   **Attack Vector**: Creating document IDs exceeding 128 characters or containing junk symbols.
```json
{
  "id": "ord-super-long-garbage-character-string-...",
  "items": []
}
```

### Payload 11: Bulk Inquiry Modification
*   **Target**: `/bulkinquiries/inq-sample1`
*   **Attack Vector**: External user changing B2B quantity or details to corrupt pipeline integrity.
```json
{
  "estimatedQuantity": "1000+",
  "status": "Quoted"
}
```

### Payload 12: Private Information Harvest (PII Scraping)
*   **Target**: `/orders/*` (Read List)
*   **Attack Vector**: Unauthenticated user attempting to list all orders to harvest phone numbers, emails, and home addresses of customers in Accra.
```json
{}
```

---

## 3. High-Security Declarative Policy

Every transaction must satisfy:
1. `request.auth != null` or limited public read-only access (for `products` & `blogs`).
2. ID length <= 128 matching `^[a-zA-Z0-9_\-]+$`.
3. Strict Schema conformance for every single create and update.
4. Absolute immutability of system-generated metrics.
