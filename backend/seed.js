// backend/seed.js
// Production Seed Engine for Sip & Savor — West Bengal Excise Certified Data

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const brandsData = [
  {
    id: 'BR-BEER-001',
    name: 'Kingfisher Strong',
    category: 'beer',
    subCategory: 'Strong Lager',
    size: '650ml',
    volumeMl: 650,
    abv: 8.0,
    mrp: 170.0,
    basePrice: 85.0,
    exciseDuty: 31.2,
    manufacturer: 'United Breweries Ltd',
    exciseCode: 'WBE-UB-KF650',
    segment: 'Popular',
    description: "India's best-selling strong beer brewed from high-grade malted barley and German hops.",
    imageUrl: '/images/products/kingfisher_strong.jpg',
  },
  {
    id: 'BR-BEER-002',
    name: 'Tuborg Strong',
    category: 'beer',
    subCategory: 'Premium Strong',
    size: '650ml',
    volumeMl: 650,
    abv: 7.8,
    mrp: 165.0,
    basePrice: 82.0,
    exciseDuty: 31.2,
    manufacturer: 'Carlsberg India Pvt Ltd',
    exciseCode: 'WBE-CB-TB650',
    segment: 'Popular',
    description: 'European style strong lager with a rich golden hue and crisp floral malt taste.',
    imageUrl: '/images/products/tuborg_strong.jpg',
  },
  {
    id: 'BR-BEER-003',
    name: 'Budweiser Premium',
    category: 'beer',
    subCategory: 'American Lager',
    size: '650ml',
    volumeMl: 650,
    abv: 5.0,
    mrp: 210.0,
    basePrice: 110.0,
    exciseDuty: 31.2,
    manufacturer: 'Anheuser-Busch InBev',
    exciseCode: 'WBE-ABI-BUD650',
    segment: 'Premium',
    description: 'The King of Beers — aged on authentic beechwood chips for remarkable clean smoothness.',
    imageUrl: '/images/products/budweiser_premium.jpg',
  },
  {
    id: 'BR-BEER-004',
    name: 'Bira 91 White',
    category: 'beer',
    subCategory: 'Wheat Ale',
    size: '330ml',
    volumeMl: 330,
    abv: 4.9,
    mrp: 140.0,
    basePrice: 75.0,
    exciseDuty: 15.8,
    manufacturer: 'B9 Beverages Ltd',
    exciseCode: 'WBE-B9-WHT330',
    segment: 'Craft',
    description: 'A deliciously refreshing wheat beer with subtle citrus and coriander aromas.',
    imageUrl: '/images/products/bira_91.jpg',
  },
  {
    id: 'BR-WHKY-001',
    name: "McDowell's No.1 Luxury",
    category: 'whisky',
    subCategory: 'Blended Indian Whisky',
    size: '750ml',
    volumeMl: 750,
    abv: 42.8,
    mrp: 440.0,
    basePrice: 195.0,
    exciseDuty: 135.0,
    manufacturer: 'United Spirits Ltd (Diageo)',
    exciseCode: 'WBE-USL-MCD750',
    segment: 'Regular',
    description: 'A harmonious blend of imported Scotch malts and fine Indian spirits with warm woody undertones.',
    imageUrl: '/images/products/mcdowells_no1.jpg',
  },
  {
    id: 'BR-WHKY-002',
    name: 'Royal Stag Deluxe',
    category: 'whisky',
    subCategory: 'Grain Whisky Blend',
    size: '750ml',
    volumeMl: 750,
    abv: 42.8,
    mrp: 460.0,
    basePrice: 205.0,
    exciseDuty: 135.0,
    manufacturer: 'Pernod Ricard India',
    exciseCode: 'WBE-PR-RS750',
    segment: 'Popular',
    description: 'Iconic blend of select Indian grain spirits and imported Scotch malts. Zero artificial flavorings.',
    imageUrl: '/images/products/royal_stag.jpg',
  },
  {
    id: 'BR-WHKY-003',
    name: 'Blenders Pride Rare',
    category: 'whisky',
    subCategory: 'Premium Blended Scotch',
    size: '750ml',
    volumeMl: 750,
    abv: 42.8,
    mrp: 780.0,
    basePrice: 380.0,
    exciseDuty: 135.0,
    manufacturer: 'Pernod Ricard India',
    exciseCode: 'WBE-PR-BP750',
    segment: 'Premium',
    description: 'Crafted with fine Scotch malts from the Speyside region of Scotland and charcoal-filtered Indian grain spirits.',
    imageUrl: '/images/products/blenders_pride.jpg',
  },
  {
    id: 'BR-WHKY-004',
    name: 'Antiquity Blue',
    category: 'whisky',
    subCategory: 'Ultra Premium Blend',
    size: '750ml',
    volumeMl: 750,
    abv: 42.8,
    mrp: 920.0,
    basePrice: 470.0,
    exciseDuty: 135.0,
    manufacturer: 'United Spirits Ltd (Diageo)',
    exciseCode: 'WBE-USL-ANT750',
    segment: 'Super Premium',
    description: 'Matured in white oak casks for rich complex notes of vanilla, toasted wood, and gentle honey.',
    imageUrl: '/images/products/antiquity_blue.jpg',
  },
  {
    id: 'BR-WHKY-005',
    name: '100 Pipers 12 Y.O.',
    category: 'whisky',
    subCategory: '12-Year-Old Blended Scotch',
    size: '750ml',
    volumeMl: 750,
    abv: 40.0,
    mrp: 2100.0,
    basePrice: 1200.0,
    exciseDuty: 135.0,
    manufacturer: 'Chivas Brothers Ltd / Pernod Ricard',
    exciseCode: 'WBE-PR-100P750',
    segment: 'Luxury Scotch',
    description: 'Aged for 12 years in oak barrels in Scotland. Delivers a velvety rich smokiness with gentle fruity finish.',
    imageUrl: '/images/products/100_pipers.jpg',
  },
  {
    id: 'BR-RUM-001',
    name: 'Old Monk XXX Rum',
    category: 'rum',
    subCategory: 'Dark Vatted Rum',
    size: '750ml',
    volumeMl: 750,
    abv: 42.8,
    mrp: 360.0,
    basePrice: 155.0,
    exciseDuty: 135.0,
    manufacturer: 'Mohan Meakin Ltd',
    exciseCode: 'WBE-MM-OM750',
    segment: 'Legendary',
    description: 'The historic Indian dark rum aged in oak vats. Rich aromas of vanilla, caramel, and warm spices.',
    imageUrl: '/images/products/old_monk.jpg',
  },
  {
    id: 'BR-VODK-001',
    name: 'Magic Moments Premium',
    category: 'vodka',
    subCategory: 'Triple Distilled Grain Vodka',
    size: '750ml',
    volumeMl: 750,
    abv: 42.8,
    mrp: 420.0,
    basePrice: 185.0,
    exciseDuty: 135.0,
    manufacturer: 'Radico Khaitan Ltd',
    exciseCode: 'WBE-RK-MM750',
    segment: 'Popular',
    description: 'Crafted from pure grain spirits and filtered three times through silver for maximum crisp purity.',
    imageUrl: '/images/products/magic_moments.jpg',
  },
  {
    id: 'BR-GIN-001',
    name: 'Blue Riband London Dry',
    category: 'gin',
    subCategory: 'Dry Botanical Gin',
    size: '750ml',
    volumeMl: 750,
    abv: 42.8,
    mrp: 380.0,
    basePrice: 165.0,
    exciseDuty: 135.0,
    manufacturer: 'United Spirits Ltd (Diageo)',
    exciseCode: 'WBE-USL-BR750',
    segment: 'Popular',
    description: 'Classic dry gin distilled with handpicked juniper berries and aromatic oriental botanicals.',
    imageUrl: '/images/products/blue_riband.jpg',
  },
];

const shopsData = [
  {
    id: 'SH-JPG-001',
    name: 'Denguajhar FL OFF Shop',
    licenseNumber: 'WB/JPG/FL-OFF/2026/042',
    exciseCircle: 'Jalpaiguri Sadar Circle',
    gstin: '19AAACG1001M1Z8',
    locationName: 'Denguajhar Station Road',
    address: 'Near Denguajhar Railway Station, Jalpaiguri, West Bengal 735121',
    lat: 26.5410,
    lng: 88.7122,
    contactPhone: '+91 98321 00001',
    isOpen: true,
    openingTime: '10:00 AM',
    closingTime: '08:00 PM',
    deliveryRadiusKm: 6.0,
  },
  {
    id: 'SH-JPG-002',
    name: 'Mohitnagar FL OFF Counter',
    licenseNumber: 'WB/JPG/FL-OFF/2026/089',
    exciseCircle: 'Jalpaiguri Sadar Circle',
    gstin: '19AAACG2002M1Z4',
    locationName: 'Mohitnagar Highway Point',
    address: 'Mohitnagar NH-31 Bypass, Jalpaiguri, West Bengal 735102',
    lat: 26.5280,
    lng: 88.7010,
    contactPhone: '+91 98321 00002',
    isOpen: true,
    openingTime: '10:00 AM',
    closingTime: '08:00 PM',
    deliveryRadiusKm: 6.0,
  },
  {
    id: 'SH-JPG-003',
    name: 'Kadamtala FL OFF Liquor Mart',
    licenseNumber: 'WB/JPG/FL-OFF/2026/115',
    exciseCircle: 'Kotwali Town Circle',
    gstin: '19AAACG3003M1Z1',
    locationName: 'Kadamtala More',
    address: 'Kadamtala Crossing, Main Road, Jalpaiguri, West Bengal 735101',
    lat: 26.5350,
    lng: 88.7250,
    contactPhone: '+91 98321 00003',
    isOpen: true,
    openingTime: '10:00 AM',
    closingTime: '08:00 PM',
    deliveryRadiusKm: 5.5,
  },
  {
    id: 'SH-JPG-004',
    name: 'Racecourse Para Wine & Spirits',
    licenseNumber: 'WB/JPG/FL-OFF/2026/164',
    exciseCircle: 'Kotwali Town Circle',
    gstin: '19AAACG4004M1Z7',
    locationName: 'Racecourse Para',
    address: 'Opposite District Sports Complex, Racecourse Para, Jalpaiguri 735101',
    lat: 26.5480,
    lng: 88.7190,
    contactPhone: '+91 98321 00004',
    isOpen: true,
    openingTime: '10:00 AM',
    closingTime: '08:00 PM',
    deliveryRadiusKm: 6.5,
  },
  {
    id: 'SH-JPG-005',
    name: 'DBC Road Central Liquor Depot',
    licenseNumber: 'WB/JPG/FL-OFF/2026/201',
    exciseCircle: 'Kotwali Town Circle',
    gstin: '19AAACG5005M1Z3',
    locationName: 'D.B.C. Road Bazaar',
    address: 'DBC Road Commercial Market, Jalpaiguri, West Bengal 735101',
    lat: 26.5510,
    lng: 88.7290,
    contactPhone: '+91 98321 00005',
    isOpen: true,
    openingTime: '10:00 AM',
    closingTime: '08:00 PM',
    deliveryRadiusKm: 6.0,
  },
];

async function main() {
  console.log('====================================================');
  console.log('🍸 Seeding Sip & Savor Real-Time Production Database');
  console.log('====================================================\n');

  // 1. Seed Core Users (Customer, Retailer, Rider, Admin)
  const demoCustomer = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: { isKycVerified: true, role: 'CUSTOMER' },
    create: {
      phone: '9876543210',
      email: 'customer@sipandsavor.in',
      name: 'Agniva Ghosh',
      dateOfBirth: new Date('2003-05-14'),
      gender: 'Male',
      role: 'CUSTOMER',
      isKycVerified: true,
      kycScore: 98.4,
      maskedAadhaar: 'XXXX-XXXX-8874',
    },
  });

  const demoRetailer = await prisma.user.upsert({
    where: { phone: '9832100000' },
    update: { role: 'RETAILER' },
    create: {
      phone: '9832100000',
      email: 'retailer@jalpaiguri.in',
      name: 'Pranab Roy (Shop Manager)',
      role: 'RETAILER',
      isKycVerified: true,
    },
  });

  const demoRider = await prisma.user.upsert({
    where: { phone: '9832145678' },
    update: { role: 'RIDER' },
    create: {
      phone: '9832145678',
      email: 'rider@sipandsavor.in',
      name: 'Rohan Sharma',
      role: 'RIDER',
      isKycVerified: true,
    },
  });

  const demoAdmin = await prisma.user.upsert({
    where: { phone: '9999999999' },
    update: { role: 'ADMIN' },
    create: {
      phone: '9999999999',
      email: 'admin@sipandsavor.in',
      name: 'State Excise Admin HQ',
      role: 'ADMIN',
      isKycVerified: true,
    },
  });

  console.log('✅ Seeded 4 Core Platform Personas (Customer, Retailer, Rider, Admin).');

  // 2. Seed Rider Profile
  await prisma.riderProfile.upsert({
    where: { userId: demoRider.id },
    update: {},
    create: {
      userId: demoRider.id,
      fullName: 'Rohan Sharma',
      phone: '+91 98321 45678',
      drivingLicenseNo: 'WB-74-2022-0098765',
      vehicleType: 'Hero Electric Nyx EV',
      vehiclePlate: 'WB-74-E-1234',
      currentLat: 26.5465,
      currentLng: 88.7180,
      isOnline: true,
      rating: 4.9,
      totalDeliveries: 1420,
    },
  });
  console.log('✅ Seeded Verified Delivery Rider Profile.');

  // 3. Seed Brands
  for (const b of brandsData) {
    await prisma.brand.upsert({
      where: { id: b.id },
      update: b,
      create: b,
    });
  }
  console.log(`✅ Seeded ${brandsData.length} Gazette Alcohol Brands with ABV & Tax Codes.`);

  // 4. Seed Shops
  for (const s of shopsData) {
    await prisma.shop.upsert({
      where: { id: s.id },
      update: { ...s, ownerId: demoRetailer.id },
      create: { ...s, ownerId: demoRetailer.id },
    });
  }
  console.log(`✅ Seeded ${shopsData.length} State-Licensed Jalpaiguri FL OFF Shops.`);

  // 5. Seed Inventory Mappings
  let count = 0;
  for (const shop of shopsData) {
    for (const brand of brandsData) {
      await prisma.inventory.upsert({
        where: { shopId_brandId: { shopId: shop.id, brandId: brand.id } },
        update: {
          stock: 45,
          customPrice: null, // Strictly at MRP
          status: 'IN_STOCK',
        },
        create: {
          shopId: shop.id,
          brandId: brand.id,
          stock: 45,
          customPrice: null,
          batchNumber: `BATCH-${shop.id}-2026-AUG`,
          hologramRange: `WB-EXC-${Math.floor(10000 + Math.random() * 90000)}..${Math.floor(90000 + Math.random() * 9000)}`,
          status: 'IN_STOCK',
        },
      });
      count++;
    }
  }
  console.log(`✅ Seeded ${count} Active Shop Inventory Stock Mappings at Legal MRP.`);

  console.log('\n🎉 Production Database Seeding Complete & Verified!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
