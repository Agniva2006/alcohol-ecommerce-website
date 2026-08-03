# Sip & Savor — Go-Live & Production Launch Checklist

This document contains the complete, step-by-step checklist of everything required to take **Sip & Savor** from the current fully-connected development environment to a **100% Live Commercial Production Launch** in Jalpaiguri, West Bengal.

---

## 📋 1. Third-Party Live API Integrations

| Feature | Current Development State | Required Production API / Provider |
| :--- | :--- | :--- |
| **SMS OTP Verification** | Fixed test OTP `1234` | Plug in **Fast2SMS / MSG91 / Twilio** API key in backend `index.js` for real SMS delivery to Indian mobile numbers (+91). |
| **Online Payments** | Razorpay Sandbox (`order_rzp_...`) | Replace test key with live **Razorpay Production Key ID & Secret Key** (`rzp_live_...`) and enable server-side webhook signature verification. |
| **Govt ID & DOB KYC** | Frontend Date Input + ID Upload | Integrate **DigiLocker / HyperVerge OCR / SurePass API** for real-time Aadhaar / DL verification and server-side 21+ DOB extraction. |
| **AI Live Face Match** | Live Selfie Camera Scan Step | Connect **AWS Rekognition / Persona / Face API** to compare customer live selfie against Govt Photo ID to block minor identity spoofing. |
| **Live GPS & Navigation** | Static Jalpaiguri Coordinates (`26.5410, 88.7122`) | Connect **Google Maps JavaScript API / MapmyIndia API** for live rider location tracking, geofencing (6km JGEC radius), and turn-by-turn navigation. |
| **Push Notifications** | Browser Toast / API Polling | Integrate **Firebase Cloud Messaging (FCM)** for real-time mobile/web push notifications to Riders and FL OFF Shop Owners on new orders. |

---

## 🛡️ 2. West Bengal Excise 21+ Age & Identity Verification Pipeline

1. **Govt Photo ID OCR & Age Verification**:
   - Customer uploads Aadhaar / Driving License / Voter ID during registration (`/auth/register`).
   - Server extracts DOB and calculates `Age >= 21`. Accounts under 21 are automatically rejected.

2. **AI Face Liveness & Photo Matching**:
   - Customer captures a live selfie camera scan during registration.
   - AI Face Recognition engine compares live selfie features against the photo extracted from the Govt ID card.
   - Prevents underage minors from using their parents' or siblings' ID cards.

3. **Rider Doorstep Verification**:
   - When rider arrives at customer's doorstep, the Rider App displays the customer's verified face photo and ID number.
   - Rider conducts a physical 2-second visual check before handing over the alcohol package.

---

## 🖥️ 3. Infrastructure, Hosting & Database Setup

### A. Production Database Migration
- [ ] Migrate SQLite (`dev.db`) to a production relational database (**PostgreSQL** or **MySQL**) hosted on AWS RDS, Supabase, or Render Postgres.
- [ ] Run `npx prisma db push` or `npx prisma migrate deploy` on the production database.

### B. Backend Server Hosting
- [ ] Deploy Node.js Express server (`sip-and-savior-backend`) to **AWS EC2 / Render / Railway / DigitalOcean**.
- [ ] Setup SSL/TLS Certificate (`https://api.sipandsavor.in`).
- [ ] Configure process manager (`PM2`) for 24/7 uptime and auto-restart on system reboot.

### C. Frontend Web App Deployment
- [ ] Deploy Vite/React web app (`alcohol-ecommerce-website`) to **Vercel / Cloudflare Pages / Netlify**.
- [ ] Connect custom domain (`https://sipandsavor.in`).

### D. Production Environment Variables (`.env`)
```env
# Backend .env
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://user:password@production-db:5432/sip_and_savor"
JWT_SECRET="secure_random_production_jwt_secret_key"

# Live API Keys
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_live_razorpay_secret"
SMS_API_KEY="your_fast2sms_or_msg91_api_key"
KYC_DIGILOCKER_API_KEY="your_digilocker_or_surepass_key"
AWS_REKOGNITION_FACE_KEY="your_aws_rekognition_key"
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

---

## 🏬 4. Partner & Product Onboarding

- [ ] **Official Excise MRP Catalog**: Upload complete West Bengal Excise price list with exact MRPs and sizes (750ml, 375ml, 180ml, 650ml).
- [ ] **Jalpaiguri FL OFF Shops**: Onboard actual Jalpaiguri FL OFF licensed counters with exact GPS coordinates.
- [ ] **Delivery Rider Fleet**: Register delivery partners with valid driving licenses, vehicle registrations, and background checks.

---

## 🔄 5. Multi-Portal End-to-End Workflow Verification

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 1. Customer (D2C)
    participant Backend as Express API + AI Face Match
    actor Supplier as 2. Supplier (FL OFF Shop)
    actor Rider as 3. Delivery Rider
    actor Admin as 4. HQ Office Admin

    Customer->>Backend: SMS OTP -> Govt ID Upload -> AI Live Face Match (21+)
    Customer->>Backend: Add Alcohol -> Pay via Razorpay Live
    Backend->>Supplier: Order appears live on Retailer Terminal (/retailer/orders)
    Supplier->>Backend: Accept Order -> Status updated to READY_FOR_PICKUP
    Backend->>Rider: Job appears on Rider Radar (/delivery/dashboard)
    Rider->>Supplier: Step 1: Pickup from FL OFF Shop Counter
    Rider->>Customer: Step 2: Transit to Customer & Match Doorstep Face Photo
    Rider->>Backend: Mark DELIVERED
    Backend->>Admin: Live GMV, Total Orders, & Excise Legal Audit log updated (/admin/dashboard)
```
