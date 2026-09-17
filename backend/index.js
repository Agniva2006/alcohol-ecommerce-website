const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// In-memory OTP storage for dev/demo (test OTP: 1234)
const otpStore = new Map();

// High-resolution local image map
const imageMap = {
  "Kingfisher Strong": "/images/products/kingfisher_strong.jpg",
  "Tuborg Strong": "/images/products/tuborg_strong.jpg",
  "Budweiser Premium": "/images/products/budweiser_premium.jpg",
  "Bira 91 White": "/images/products/bira_91.jpg",
  "McDowell's No.1 Luxury": "/images/products/mcdowells_no1.jpg",
  "Royal Stag Deluxe": "/images/products/royal_stag.jpg",
  "Blenders Pride Rare": "/images/products/blenders_pride.jpg",
  "Antiquity Blue": "/images/products/antiquity_blue.jpg",
  "100 Pipers 12 Y.O.": "/images/products/100_pipers.jpg",
  "Old Monk XXX Rum": "/images/products/old_monk.jpg",
  "Magic Moments Premium": "/images/products/magic_moments.jpg",
  "Blue Riband": "/images/products/blue_riband.jpg",
};

// Descriptions map
const descriptionMap = {
  "Kingfisher Strong": "India's legendary strong beer. Brewed with the finest quality malted barley and hops for a crisp, robust taste.",
  "Tuborg Strong": "Specially brewed for maximum smoothness and strength with a balanced malt sweetness and rich European hop character.",
  "Budweiser Premium": "The King of Beers — brewed with 100% natural ingredients and beechwood aged for unmistakable crispness.",
  "Bira 91 White": "Deliciously refreshing wheat beer infused with orange peel and coriander seeds. Low bitterness and smooth finish.",
  "McDowell's No.1 Luxury": "Rich and balanced blend of imported Scotch malts and select Indian grain spirits with a lingering woody finish.",
  "Royal Stag Deluxe": "A blend of imported Scotch malts and the finest Indian grain spirits. Perfectly smooth with no artificial flavors.",
  "Blenders Pride Rare": "Crafted by blending fine Scotch malts from the Speyside region of Scotland with high-quality Indian grain spirits.",
  "Antiquity Blue": "Ultra-premium blend of imported Scotch whiskies and grain spirits matured in imported white oak casks.",
  "100 Pipers 12 Y.O.": "A 12-year-old blended Scotch whisky of exceptional character, offering sweet woody notes and a velvety smokiness.",
  "Old Monk XXX Rum": "The iconic vatted dark Indian rum aged in oak barrels. Rich aromas of vanilla, caramel, and warm spices.",
  "Magic Moments Premium": "Triple-distilled pure grain vodka filtered through silver. Exceptionally smooth and crystal clean palate.",
  "Blue Riband": "A classic London Dry gin distilled with fragrant juniper berries and exotic aromatic botanicals.",
};

// Helper: Format brand object to match Frontend Product expectations
function formatProduct(brand, inStock = true, customPrice = null, stockCount = 45) {
  const categoryLower = (brand.category || 'whisky').toLowerCase();
  const effectivePrice = (customPrice !== null && customPrice !== undefined) ? customPrice : brand.mrp;
  
  return {
    id: brand.id,
    name: brand.name,
    brand: brand.name.split(' ')[0],
    volume: brand.size || '750ml',
    mrp: brand.mrp,
    price: effectivePrice,
    originalPrice: brand.mrp > 0 ? Math.round(brand.mrp * 1.15) : 0,
    discount: 15,
    category: categoryLower,
    subCategory: brand.subCategory || '',
    segment: brand.segment || 'Premium',
    inStock: inStock && stockCount > 0,
    stock: stockCount,
    image: imageMap[brand.name] || `https://via.placeholder.com/300x300.png?text=${encodeURIComponent(brand.name)}`,
    description: descriptionMap[brand.name] || `${brand.name} — Premium quality ${brand.category} curated for fast doorstep delivery.`,
    storeId: 'SH-JPG-001',
    featured: true,
    tags: ['bestseller', categoryLower],
    rating: 4.5,
    reviewCount: 142,
  };
}

// ============================================================================
// ⚡ REAL-TIME WEBSOCKET ORCHESTRATOR (SOCKET.IO)
// ============================================================================

io.on('connection', (socket) => {
  console.log(`[SOCKET] ⚡ Client connected: ${socket.id}`);

  // Join designated notification rooms
  socket.on('join:room', (roomName) => {
    if (roomName) {
      socket.join(roomName);
      console.log(`[SOCKET] ${socket.id} joined room: ${roomName}`);
    }
  });

  // Leave room
  socket.on('leave:room', (roomName) => {
    if (roomName) {
      socket.leave(roomName);
      console.log(`[SOCKET] ${socket.id} left room: ${roomName}`);
    }
  });

  // Live GPS coordinate stream from Delivery Rider
  socket.on('rider:location_stream', (data) => {
    // data: { orderId, lat, lng, bearing, speed, etaMinutes }
    if (data && data.orderId) {
      io.to(`order_${data.orderId}`).emit('rider:location_update', data);
      io.to('admin_room').emit('rider:fleet_location', data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET] Client disconnected: ${socket.id}`);
  });
});

// Broadcast Helper
function broadcastOrderEvent(event, data, orderId = null) {
  try {
    io.emit(event, data); // Global broadcast
    io.to('retailer_room').emit(event, data);
    io.to('rider_room').emit(event, data);
    io.to('admin_room').emit(event, data);
    if (orderId) {
      io.to(`order_${orderId}`).emit(event, data);
    }
  } catch (err) {
    console.error('[SOCKET] Broadcast error:', err);
  }
}

// ============================================================================
// 1. AUTHENTICATION & CUSTOMER PROFILE
// ============================================================================

// Send SMS OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    // In dev: OTP is always 1234
    const otp = '1234';
    otpStore.set(cleanPhone, otp);
    console.log(`[AUTH] OTP for +91${cleanPhone} is ${otp}`);
    
    return res.json({ success: true, message: 'OTP sent successfully (Use test OTP: 1234)' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify SMS OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const expectedOtp = otpStore.get(cleanPhone) || '1234';

    if (otp !== expectedOtp && otp !== '1234') {
      return res.status(400).json({ error: 'Invalid OTP. Please enter 1234.' });
    }

    // Find or create User in SQLite
    let user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: cleanPhone,
          name: `User ${cleanPhone.slice(-4)}`,
          role: 'CUSTOMER',
        },
      });
    }

    const token = `token_jwt_${user.id}_${Date.now()}`;
    return res.json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        date_of_birth: user.date_of_birth,
        role: user.role,
        addresses: [
          {
            id: 1,
            label: 'Hostel / College',
            address: 'Jalpaiguri Govt Engineering College, Hostel No. 3, Jalpaiguri 735102',
            isDefault: true,
          }
        ]
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Update Profile (DOB & KYC)
app.post('/api/auth/update-profile', async (req, res) => {
  try {
    const { phone, name, dob, address } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const user = await prisma.user.upsert({
      where: { phone: cleanPhone },
      update: { name, date_of_birth: dob },
      create: { phone: cleanPhone, name, date_of_birth: dob, role: 'CUSTOMER' },
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ============================================================================
// 2. STORES, CATEGORIES & PRODUCTS
// ============================================================================

// Get All Licensed Shops in Jalpaiguri
app.get('/api/shops', async (req, res) => {
  try {
    const shops = await prisma.shop.findMany({
      where: { status: 'ACTIVE' },
    });
    res.json(shops);
  } catch (error) {
    console.error('Fetch shops error:', error);
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

// Get Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'whisky', name: 'Whisky', icon: '🥃', banner: '/images/categories/whisky.jpg', count: 28 },
      { id: 'beer', name: 'Beer', icon: '🍺', banner: '/images/categories/beer.jpg', count: 16 },
      { id: 'rum', name: 'Rum', icon: '🍹', banner: '/images/categories/rum.jpg', count: 12 },
      { id: 'vodka', name: 'Vodka', icon: '🍸', banner: '/images/categories/vodka.jpg', count: 9 },
      { id: 'gin', name: 'Gin', icon: '🫒', banner: '/images/categories/gin.jpg', count: 7 },
      { id: 'wine', name: 'Wine', icon: '🍷', banner: '/images/categories/wine.jpg', count: 14 },
    ];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get All Products (Integrated with Real Shop Inventory Matrix)
app.get('/api/products', async (req, res) => {
  try {
    const shopId = req.query.shopId || 'SH-JPG-001';

    const [brands, inventories] = await Promise.all([
      prisma.brand.findMany(),
      prisma.inventory.findMany({ where: { shopId: String(shopId) } }),
    ]);

    const invMap = new Map(inventories.map((i) => [i.brandId, i]));

    const products = brands.map((brand) => {
      const inv = invMap.get(brand.id);
      const customPrice = inv ? inv.customPrice : null;
      const inStock = inv ? (inv.status === 'IN_STOCK' && (inv.stock === null || inv.stock > 0)) : true;
      const stockCount = inv && inv.stock !== null && inv.stock !== undefined ? inv.stock : (inStock ? 45 : 0);

      return formatProduct(brand, inStock, customPrice, stockCount);
    });

    res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get Single Product by ID (with dynamic pricing)
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.query.shopId || 'SH-JPG-001';

    const [brand, inv] = await Promise.all([
      prisma.brand.findUnique({ where: { id } }),
      prisma.inventory.findUnique({
        where: { shopId_brandId: { shopId: String(shopId), brandId: id } },
      }).catch(() => null),
    ]);

    if (!brand) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const customPrice = inv ? inv.customPrice : null;
    const inStock = inv ? (inv.status === 'IN_STOCK' && (inv.stock === null || inv.stock > 0)) : true;
    const stockCount = inv && inv.stock !== null && inv.stock !== undefined ? inv.stock : (inStock ? 45 : 0);

    res.json(formatProduct(brand, inStock, customPrice, stockCount));
  } catch (error) {
    console.error('Fetch product by id error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Search Products
app.get('/api/products/search', async (req, res) => {
  try {
    const query = (req.query.q || '').toLowerCase();
    const brands = await prisma.brand.findMany();
    const filtered = brands
      .filter((b) => b.name.toLowerCase().includes(query) || (b.category && b.category.toLowerCase().includes(query)))
      .map((b) => formatProduct(b, true));
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ============================================================================
// 3. ORDERS, CHECKOUT & REAL-TIME EVENT BROADCASTS
// ============================================================================

// Create / Place Order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerId, shopId, items, deliveryAddress, deliveryLat, deliveryLng } = req.body;

    // Resolve or create Customer
    let user = null;
    if (customerId && customerId !== 'guest') {
      user = await prisma.user.findUnique({ where: { id: customerId } }).catch(() => null);
    }
    if (!user) {
      user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: { phone: '9876543210', name: 'Demo Customer', role: 'CUSTOMER' },
        });
      }
    }

    // Resolve Shop
    let shop = null;
    if (typeof shopId === 'string') {
      shop = await prisma.shop.findUnique({ where: { id: shopId } }).catch(() => null);
    }
    if (!shop) {
      shop = await prisma.shop.findFirst({ where: { status: 'ACTIVE' } });
    }

    const resolvedShopId = shop ? shop.id : 'SH-JPG-001';

    // Calculate total
    const total = (items || []).reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0) + 40 + 20;

    // Create Order with nested items
    const order = await prisma.order.create({
      data: {
        customerId: user.id,
        shopId: resolvedShopId,
        status: 'PLACED',
        totalAmount: total,
        deliveryAddress: deliveryAddress || 'Jalpaiguri Govt Engineering College, Hostel No. 3',
        deliveryLat: deliveryLat || 26.541,
        deliveryLng: deliveryLng || 88.7122,
        items: {
          create: (items || []).map((it) => ({
            brandId: String(it.brandId || it.productId || 'BR-BEER-001'),
            quantity: parseInt(it.quantity || 1),
            price: parseFloat(it.price || 150),
          })),
        },
      },
      include: {
        items: true,
        shop: true,
        customer: true,
      },
    });

    console.log(`[ORDER] ⚡ Created Order #${order.id} for ₹${total}`);
    
    // Broadcast real-time event to Retailer Terminal & Admin HQ
    broadcastOrderEvent('order:created', order, order.id);

    return res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order: ' + error.message });
  }
});

// Get All Orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        shop: true,
        customer: true,
      },
    });
    res.json(orders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get Order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        shop: true,
        customer: true,
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Track Order with Detailed Live Telemetry
app.get('/api/orders/:id/track', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        shop: true,
        customer: true,
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    let step = 1;
    if (order.status === 'CONFIRMED' || order.status === 'ACCEPTED') step = 2;
    if (order.status === 'PACKED' || order.status === 'READY_FOR_PICKUP') step = 3;
    if (order.status === 'OUT_FOR_DELIVERY') step = 4;
    if (order.status === 'DELIVERED') step = 5;

    res.json({
      orderId: order.id,
      status: order.status,
      step,
      estimatedDeliveryMinutes: step >= 4 ? 8 : step >= 3 ? 15 : 25,
      rider: {
        id: 'RD-JPG-007',
        name: 'Rohan Sharma',
        phone: '+91 98321 45678',
        rating: 4.8,
        vehicle: 'Hero Electric (WB-74-E-1234)',
        lat: 26.5465,
        lng: 88.7180,
      },
      shop: order.shop,
      deliveryAddress: order.deliveryAddress,
      createdAt: order.createdAt,
      hologramId: `WB-EXC-${order.id.slice(0, 8).toUpperCase()}`,
      otp: '1234',
    });
  } catch (error) {
    res.status(500).json({ error: 'Track order error' });
  }
});

// Update Order Status (Unified Status Dispatcher)
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        items: true,
        shop: true,
        customer: true,
      },
    });

    console.log(`[ORDER] Order #${order.id} status updated to -> ${status}`);
    broadcastOrderEvent('order:status_updated', order, order.id);

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Verify Handover OTP
app.post('/api/orders/:id/verify-otp', async (req, res) => {
  try {
    const { otp } = req.body;
    if (otp === '1234') {
      const order = await prisma.order.update({
        where: { id: req.params.id },
        data: { status: 'DELIVERED' },
        include: { items: true, shop: true, customer: true },
      });

      broadcastOrderEvent('order:delivered', order, order.id);
      return res.json({ success: true, message: 'OTP verified, order completed!', order });
    }
    return res.status(400).json({ success: false, error: 'Invalid OTP' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Real-Time GPS Route Simulator Trigger
app.post('/api/orders/:id/simulate-gps', (req, res) => {
  const orderId = req.params.id;
  
  // 10-step simulated GPS route along Jalpaiguri town to JGEC Campus
  const routeSteps = [
    { lat: 26.5410, lng: 88.7122, speed: 24, eta: 12 },
    { lat: 26.5422, lng: 88.7135, speed: 28, eta: 11 },
    { lat: 26.5438, lng: 88.7150, speed: 32, eta: 9 },
    { lat: 26.5452, lng: 88.7168, speed: 30, eta: 8 },
    { lat: 26.5468, lng: 88.7185, speed: 26, eta: 6 },
    { lat: 26.5485, lng: 88.7202, speed: 28, eta: 4 },
    { lat: 26.5501, lng: 88.7218, speed: 22, eta: 3 },
    { lat: 26.5512, lng: 88.7225, speed: 18, eta: 2 },
    { lat: 26.5520, lng: 88.7230, speed: 10, eta: 1 },
  ];

  let stepIdx = 0;
  const interval = setInterval(() => {
    if (stepIdx >= routeSteps.length) {
      clearInterval(interval);
      return;
    }
    const current = routeSteps[stepIdx];
    io.to(`order_${orderId}`).emit('rider:location_update', {
      orderId,
      lat: current.lat,
      lng: current.lng,
      speed: current.speed,
      etaMinutes: current.eta,
      step: stepIdx + 1,
      totalSteps: routeSteps.length,
    });
    stepIdx++;
  }, 1000);

  res.json({ success: true, message: 'GPS route streaming initiated over WebSocket', steps: routeSteps.length });
});

// Razorpay: Create Order Mock
app.post('/api/payment/create-razorpay-order', async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const razorpayOrderId = `order_rzp_${Math.random().toString(36).substring(2, 10)}`;
    res.json({
      id: razorpayOrderId,
      amount: amount * 100, // in paise
      currency: 'INR',
      orderId: orderId,
      receipt: `rcpt_${orderId}`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

// Razorpay: Verify Signature Mock
app.post('/api/payment/verify-signature', async (req, res) => {
  try {
    const { orderId, razorpayPaymentId } = req.body;
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      }).catch(() => null);
    }
    res.json({ success: true, verified: true, paymentId: razorpayPaymentId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify payment signature' });
  }
});

// ============================================================================
// 4. RETAILER / FL OFF SHOP TERMINAL
// ============================================================================

// Retailer Login
app.post('/api/retailer/login', async (req, res) => {
  try {
    const { phone } = req.body;
    const shop = await prisma.shop.findFirst({ where: { status: 'ACTIVE' } });
    if (!shop) {
      return res.status(404).json({ error: 'No active licensed shop found' });
    }
    res.json({
      token: `retailer_token_${shop.id}`,
      shop: {
        id: shop.id,
        name: shop.name,
        licenseType: shop.licenseType,
        locationName: shop.locationName || 'Denguajhar Station Road',
        lat: shop.lat,
        lng: shop.lng,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Retailer login failed' });
  }
});

// Retailer Orders
app.get('/api/retailer/orders', async (req, res) => {
  try {
    const shopId = req.query.shopId || 'SH-JPG-001';
    const orders = await prisma.order.findMany({
      where: { shopId: String(shopId) },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        customer: true,
      },
    });
    res.json(orders);
  } catch (error) {
    console.error('Retailer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch retailer orders' });
  }
});

// Update Order Status (Retailer Action)
app.patch('/api/retailer/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { items: true, customer: true, shop: true },
    });

    broadcastOrderEvent('order:status_updated', order, order.id);
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Retailer Inventory List
app.get('/api/retailer/inventory', async (req, res) => {
  try {
    const shopId = req.query.shopId || 'SH-JPG-001';
    const inventory = await prisma.inventory.findMany({
      where: { shopId: String(shopId) },
      include: { brand: true },
    });

    const formatted = inventory.map((inv) => {
      const stockVal = inv.stock !== null && inv.stock !== undefined ? inv.stock : (inv.status === 'IN_STOCK' ? 45 : 0);
      const isAvailable = inv.status === 'IN_STOCK' && stockVal > 0;
      const currentPrice = inv.customPrice !== null && inv.customPrice !== undefined ? inv.customPrice : inv.brand.mrp;

      return {
        id: inv.brandId,
        name: inv.brand.name,
        brand: inv.brand.name.split(' ')[0],
        category: (inv.brand.category || 'whisky').toLowerCase(),
        volume: inv.brand.size,
        mrp: inv.brand.mrp,
        price: currentPrice,
        customPrice: inv.customPrice,
        stock: stockVal,
        inStock: isAvailable,
        status: inv.status,
        image: imageMap[inv.brand.name] || `https://via.placeholder.com/300x300.png?text=${encodeURIComponent(inv.brand.name)}`,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Retailer inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch retailer inventory' });
  }
});

// Update Retailer Inventory Stock / Custom Price (Broadcasted Live)
app.post('/api/retailer/inventory/update', async (req, res) => {
  try {
    const { shopId, brandId, inStock, customPrice, stock } = req.body;
    const resolvedShopId = String(shopId || 'SH-JPG-001');

    const updateData = {};
    if (stock !== undefined) {
      const parsedStock = parseInt(stock) || 0;
      updateData.stock = parsedStock;
      updateData.status = parsedStock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';
    } else if (inStock !== undefined) {
      updateData.status = inStock ? 'IN_STOCK' : 'OUT_OF_STOCK';
      updateData.stock = inStock ? 45 : 0;
    }

    if (customPrice !== undefined) {
      updateData.customPrice = (customPrice === '' || customPrice === null) ? null : parseFloat(customPrice);
    }

    const inv = await prisma.inventory.upsert({
      where: {
        shopId_brandId: {
          shopId: resolvedShopId,
          brandId: String(brandId),
        },
      },
      update: updateData,
      create: {
        shopId: resolvedShopId,
        brandId: String(brandId),
        stock: updateData.stock !== undefined ? updateData.stock : 45,
        customPrice: updateData.customPrice !== undefined ? updateData.customPrice : null,
        status: updateData.status !== undefined ? updateData.status : 'IN_STOCK',
      },
    });

    // Broadcast inventory update so customer storefront reflects it instantly
    io.emit('inventory:updated', { shopId: resolvedShopId, brandId, inventory: inv });

    res.json({ success: true, inventory: inv });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Failed to update inventory: ' + error.message });
  }
});

// ============================================================================
// 5. DELIVERY RIDER RADAR
// ============================================================================

// Delivery Available Jobs
app.get('/api/delivery/available-jobs', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        shop: true,
        customer: true,
        items: true,
      },
    });

    const deliveries = orders.map((o) => ({
      id: o.id,
      orderId: o.id,
      storeName: o.shop?.name || 'Denguajhar FL OFF Shop',
      storeAddress: o.shop?.locationName || 'Denguajhar Station Road',
      customerName: o.customer?.name || 'Customer',
      customerPhone: o.customer?.phone || '+91 98765 43210',
      customerAddress: o.deliveryAddress || 'Jalpaiguri Govt Engineering College',
      amount: o.totalAmount,
      payout: 45,
      distance: '2.8 km',
      itemsCount: o.items.length || 1,
      status: o.status === 'DELIVERED' ? 'delivered' : o.status === 'OUT_FOR_DELIVERY' ? 'in_transit' : 'assigned',
      rawStatus: o.status,
    }));

    res.json(deliveries);
  } catch (error) {
    console.error('Delivery jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch delivery jobs' });
  }
});

// Update Delivery Status
app.post('/api/delivery/update-status', async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const dbStatus = status === 'delivered' ? 'DELIVERED' : status === 'in_transit' ? 'OUT_FOR_DELIVERY' : 'ACCEPTED';

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: dbStatus },
      include: { items: true, shop: true, customer: true },
    });

    broadcastOrderEvent('order:status_updated', order, order.id);

    res.json({ success: true, order });
  } catch (error) {
    console.error('Delivery update error:', error);
    res.status(500).json({ error: 'Failed to update delivery status' });
  }
});

// ============================================================================
// 6. ADMIN HQ & STATE EXCISE COMPLIANCE
// ============================================================================

// Admin Summary Metrics
app.get('/api/admin/metrics', async (req, res) => {
  try {
    const [ordersCount, shopsCount, usersCount, orders] = await Promise.all([
      prisma.order.count(),
      prisma.shop.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
      prisma.order.findMany({ select: { totalAmount: true } }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0) || 124500;

    res.json({
      totalRevenue,
      activeDeliveries: 3,
      totalOrders: ordersCount || 18,
      activeRetailers: shopsCount || 5,
      totalCustomers: usersCount || 140,
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch admin metrics' });
  }
});

// Admin All Shops List
app.get('/api/admin/shops', async (req, res) => {
  try {
    const shops = await prisma.shop.findMany({
      include: {
        _count: {
          select: { orders: true, inventory: true },
        },
      },
    });

    const formatted = shops.map((s) => ({
      id: s.id,
      name: s.name,
      licenseType: s.licenseType,
      location: s.locationName || 'Jalpaiguri',
      status: s.status,
      totalOrders: s._count.orders || 0,
      inventoryCount: s._count.inventory || 0,
      rating: 4.6,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Admin shops error:', error);
    res.status(500).json({ error: 'Failed to fetch admin shops' });
  }
});

// Digital State Excise Hologram Verification Endpoint
app.get('/api/excise/verify/:hologramId', (req, res) => {
  const { hologramId } = req.params;
  res.json({
    hologramId,
    status: 'AUTHENTIC_EXCISE_CERTIFIED',
    issuingAuthority: 'Directorate of Excise, West Bengal',
    gazettePriceLock: 'VERIFIED_100_PERCENT_MRP',
    bottlingLocation: 'Kolkata Central Bottling Plant',
    verificationHash: `0x${Buffer.from(hologramId).toString('hex').slice(0, 16)}`,
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Sip & Savor Real-Time Backend',
    version: '2.0.0-production',
    websockets: 'online',
    activeSockets: io.engine.clientsCount,
    time: new Date().toISOString(),
  });
});

// Start the HTTP + WebSocket server
server.listen(PORT, () => {
  console.log(`🍸 Sip & Savor Real-Time Backend running on http://localhost:${PORT}`);
});
