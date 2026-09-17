const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync('./seed_data.json', 'utf-8'));
  
  // 1. Seed Brands
  const brands = data['Brand Directory'];
  for (const b of brands) {
    await prisma.brand.upsert({
      where: { id: b['Brand ID'] },
      update: {},
      create: {
        id: b['Brand ID'],
        name: b['Brand Name'],
        category: b['Category'],
        subCategory: b['Sub-Category'],
        size: b['Size'],
        mrp: parseFloat(b['MRP']),
        segment: b['Segment']
      }
    });
  }
  console.log(`Seeded ${brands.length} brands.`);

  // 2. Seed Shops
  const shops = data['Shop Directory'];
  for (const s of shops) {
    await prisma.shop.upsert({
      where: { id: s['Shop ID'] },
      update: {},
      create: {
        id: s['Shop ID'],
        name: s['Shop Name'],
        licenseType: s['License Type'],
        locationName: s['Location'],
        lat: parseFloat(s['Lat']),
        lng: parseFloat(s['Lng'])
      }
    });
  }
  console.log(`Seeded ${shops.length} shops.`);

  // 3. Seed Inventory Map
  const map = data['Complete Shop Catalog Map'];
  let count = 0;
  for (const m of map) {
    // Only insert if both shop and brand exist
    try {
      await prisma.inventory.upsert({
        where: {
          shopId_brandId: {
            shopId: m['Shop ID'],
            brandId: m['Brand ID']
          }
        },
        update: {
          status: m['Live App Status']
        },
        create: {
          shopId: m['Shop ID'],
          brandId: m['Brand ID'],
          stock: m['Live App Status'] === 'IN_STOCK' ? 45 : 0,
          status: m['Live App Status']
        }
      });
      count++;
    } catch(e) {
      console.log("Error seeding inventory map:", e);
    }
  }
  console.log(`Seeded ${count} inventory mappings.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
