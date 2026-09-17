# 🍸 Sip & Savor (v2.0 Enterprise) — Hyperlocal Alcohol E-Commerce & Delivery Ecosystem

<div align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-5.0-000000?style=flat&logo=express" alt="Express">
  <img src="https://img.shields.io/badge/Prisma-5.10-2D3748?style=flat&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/Vite-8.1-646CFF?style=flat&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
</div>

> **Sip & Savor** is a full-stack, legally compliant hyperlocal alcohol D2C delivery platform connecting state-licensed Foreign Liquor OFF (FL OFF) shops directly to verified adult consumers (21+) with real-time inventory synchronization, digital age gating, and multi-portal operations.

---

## 🏛️ Platform Architecture: The 4-Portal Ecosystem

Sip & Savor is structured into **4 distinct, interconnected applications** powered by a unified Express + Prisma relational backend:

```text
                                 ┌─────────────────────────────┐
                                 │   Express Backend API       │
                                 │   (Port 5000 / Node.js)     │
                                 └──────────────┬──────────────┘
                                                │
                ┌───────────────────┬───────────┴───────────┬───────────────────┐
                ▼                   ▼                       ▼                   ▼
       ┌─────────────────┐ ┌─────────────────┐     ┌─────────────────┐ ┌─────────────────┐
       │ 1. Customer D2C │ │ 2. Retailer Hub │     │ 3. Rider Radar  │ │  4. Admin HQ    │
       │     Portal      │ │   (FL OFF Shop) │     │ (Delivery Fleet)│ │ (Command Center)│
       └─────────────────┘ └─────────────────┘     └─────────────────┘ └─────────────────┘
```

| Portal | URL Path | Target Persona | Key Responsibilities |
|---|---|---|---|
| 🛍️ **1. Customer D2C** | `/`, `/search`, `/checkout` | 21+ Consumers | Smart catalog search, filter by ABV/category, DigiLocker 21+ KYC, Razorpay checkout, live order tracking. |
| 🏪 **2. Retailer Terminal** | `/retailer/login`, `/retailer/orders` | FL OFF Shop Owners | Live order acceptance, catalog stock toggling, custom pricing, inventory batch management. |
| 🛵 **3. Delivery Radar** | `/delivery/login`, `/delivery/dashboard` | Delivery Riders | Order pickup dispatch, route navigation, doorstep customer face match, OTP completion. |
| 👑 **4. Admin Command HQ** | `/admin/login`, `/admin/dashboard` | Platform HQ & Auditors | GMV metrics, retail license compliance, legal excise audit logs, dispute settlement. |

---

## ✨ Key Features & Capabilities

- 🔞 **21+ Digital Age & Identity Verification:** DigiLocker Aadhaar/DL OCR + live selfie comparison to guarantee zero underage sales before cart checkout.
- 🏷️ **Excise-Mandated MRP Pricing:** Direct synchronization with official state liquor price matrices preventing predatory overcharging.
- ⚡ **Hyperlocal Instant Delivery (Under 45 Mins):** Geo-routed order matching to the nearest licensed FL OFF shop within a 5 km radius.
- 📦 **End-to-End Order Lifecycle:** 6-stage order tracking (`PLACED` → `CONFIRMED` → `PACKED` → `OUT_FOR_DELIVERY` → `DELIVERED`).
- 🔐 **Doorstep OTP Handover:** Two-factor delivery verification with digital proof-of-delivery signatures.
- 📊 **Real-time Inventory Management:** Shop owners can toggle in-stock items, adjust discounts, and track daily sales volumes.

---

## 🏗️ Project Structure

```text
alcohol-ecommerce-website/
├── backend/
│   ├── index.js                  # Express API Server (All 4-Portal Endpoints)
│   ├── package.json              # Backend Dependencies (Express, Prisma, CORS)
│   ├── seed.js                   # Database Seeder (Jalpaiguri FL OFF Catalog)
│   ├── seed_data.json            # Pre-seeded brand, pricing & category dataset
│   └── prisma/
│       └── schema.prisma         # Prisma ORM Schema (Users, Shops, Products, Orders)
├── src/
│   ├── App.jsx                   # Main Router & Route Guards
│   ├── api.js                    # Axios API Client with JWT Interceptors
│   ├── main.jsx                  # React 19 Entry Point
│   ├── index.css                 # Custom Styling & Glassmorphism Tokens
│   ├── components/
│   │   ├── layout/               # Navbar, Footer, AgeGate, Navigation
│   │   ├── product/              # ProductCard, CategoryChips, PriceTag
│   │   └── ui/                   # Modal, Badge, Button, Input components
│   ├── pages/
│   │   ├── Home.jsx              # Customer D2C Storefront
│   │   ├── ProductDetails.jsx    # Single Product View with ABV & Tasting Notes
│   │   ├── Cart.jsx              # Cart & Quantity Selector
│   │   ├── Checkout.jsx          # Address & Razorpay Payment Simulator
│   │   ├── OrderTracking.jsx     # Real-time Order Progress Stepper
│   │   ├── admin/                # Admin HQ Dashboard & User Management
│   │   ├── retailer/             # Retailer Orders & Manage Inventory Hub
│   │   └── delivery/             # Delivery Rider Dashboard & Doorstep OTP
│   ├── store/                    # Zustand Stores (Cart, Auth, Location)
│   └── utils/                    # Formatters, Validation & Helpers
├── public/                       # High-resolution bottle imagery & assets
├── STARTUP_MASTER_ROADMAP.md     # Complete Business & Operational Roadmap
├── PRODUCT_EXECUTION_PHASES.md   # Feature Engineering & Milestones
├── extract_data.py               # Excel-to-JSON Catalog Extraction Utility
├── index.html                    # Root HTML5 Template
├── tailwind.config.js            # Tailwind Theme Extensions
├── vite.config.js                # Vite Bundler Configuration
└── package.json                  # Frontend Dependencies (React 19, Zustand, Lucide)
```

---

## 🚀 Quick Start & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1️⃣ Backend Setup (Express + Prisma)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma Client & Push SQLite schema
npx prisma generate
npx prisma db push

# Seed initial Jalpaiguri liquor inventory & test accounts
node seed.js

# Start backend server (runs on http://localhost:5000)
npm run dev
# Or: node index.js
```

### 2️⃣ Frontend Setup (React 19 + Vite)

Open a second terminal window in the root repository directory:

```bash
# Install frontend dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

---

## 🔑 Demo & Test Credentials

The database is pre-seeded with sample credentials for instant testing across all portals:

| Portal | Login URL | Default Username | Default Password |
|---|---|---|---|
| 🛍️ **Customer** | `/login` | `customer@sipandsavor.in` | `Customer@123` |
| 🏪 **Retailer** | `/retailer/login` | `retailer@jalpaiguri.in` | `Retailer@123` |
| 🛵 **Delivery Rider** | `/delivery/login` | `rider@sipandsavor.in` | `Rider@123` |
| 👑 **Admin HQ** | `/admin/login` | `admin@sipandsavor.in` | `Admin@123` |

---

## 🔌 Core API Endpoints

### Products & Catalog
- `GET /api/products` — Fetch all products with category and search filters
- `GET /api/products/:id` — Retrieve detailed single product view with tasting notes
- `GET /api/categories` — List all alcohol categories (Whisky, Beer, Rum, Vodka, Gin, Wine)

### Orders & Checkout
- `POST /api/orders` — Create new order with itemized cart and customer details
- `GET /api/orders/:id` — Real-time order tracking status
- `PATCH /api/orders/:id/status` — Update order stage (`CONFIRMED`, `PACKED`, `DELIVERED`)
- `POST /api/orders/:id/verify-otp` — Verify customer doorstep 4-digit OTP

### Retailer & Inventory
- `GET /api/retailer/inventory` — View shop stock levels and prices
- `PATCH /api/retailer/inventory/:id` — Toggle in-stock status and set custom price

---

## ⚖️ Legal & Excise Compliance

Sip & Savor is engineered in accordance with the **West Bengal State Excise (Delivery of Intoxicants) Regulations**:
1. **Zero Underage Sales:** Mandatory government ID verification (21+).
2. **MRP Price Lock:** All prices strictly capped at West Bengal State Excise Gazette rates.
3. **Restricted Delivery Hours:** Orders only accepted during legal retail operating hours (10:00 AM – 8:00 PM).
4. **Dry Day Enforcements:** Automatic checkout freeze on state-mandated dry days.

---

## 🧑‍💻 Author & Contributing

**Agniva Ghosh**  
GitHub: [@Agniva2006](https://github.com/Agniva2006)

Licensed under the [MIT License](LICENSE).
