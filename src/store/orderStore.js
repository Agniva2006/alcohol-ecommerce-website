import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api';

const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      activeOrder: null,
      trackingStep: 1,

      fetchOrders: async () => {
        try {
          const res = await api.get('/orders');
          const formatted = res.data.map(o => ({
            id: o.id,
            date: new Date(o.createdAt).toISOString().split('T')[0],
            status: o.status === 'DELIVERED' ? 'delivered' : o.status === 'REJECTED' ? 'cancelled' : 'confirmed',
            rawStatus: o.status,
            total: o.totalAmount,
            deliveryFee: 40,
            platformFee: 15,
            paymentMethod: 'Online Payment (Razorpay)',
            address: o.deliveryAddress,
            items: o.items.map(i => ({ productId: i.brandId, name: `Brand ${i.brandId}`, quantity: i.quantity, price: i.price }))
          }));
          set({ orders: formatted });
        } catch (error) {
          console.error('Failed to fetch orders:', error);
        }
      },

      // ─── Place a new order ─────────────────────────────────────
      placeOrder: async ({ items, address, paymentMethod, summary, customerId }) => {
        const orderPayload = {
          customerId: customerId || 'guest',
          shopId: 1, // Defaulting to shop 1 for MVP
          items: items.map(item => ({
            brandId: item.id || 1, // Mocking brandId if not real
            quantity: item.quantity,
            price: item.price
          })),
          deliveryAddress: address,
          deliveryLat: 26.5410,
          deliveryLng: 88.7122
        };

        try {
          const res = await api.post('/orders', orderPayload);
          
          const newOrder = {
            id: res.data.id || Math.random().toString(36).substring(7),
            date: new Date().toISOString().split('T')[0],
            status: 'confirmed',
            total: summary.total,
            deliveryFee: summary.deliveryFee,
            platformFee: summary.platformFee,
            paymentMethod,
            address,
            items: items.map((item) => ({
              productId: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              volume: item.volume,
            })),
          };

          set((state) => ({
            orders: [newOrder, ...state.orders],
            activeOrder: newOrder,
            trackingStep: 1,
          }));

          return newOrder.id;
        } catch (error) {
          console.error('Failed to place order:', error);
          throw error;
        }
      },

      // ─── Update tracking ───────────────────────────────────────
      advanceTracking: () => {
        set((state) => ({
          trackingStep: Math.min(state.trackingStep + 1, 4),
        }));
      },

      setTrackingStep: (step) => set({ trackingStep: step }),

      // ─── Cancel order ──────────────────────────────────────────
      cancelOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'cancelled' } : o
          ),
          activeOrder:
            state.activeOrder?.id === orderId
              ? { ...state.activeOrder, status: 'cancelled' }
              : state.activeOrder,
        }));
      },

      // ─── Get orders by status ──────────────────────────────────
      getOrdersByStatus: (status) => {
        if (!status || status === 'all') return get().orders;
        return get().orders.filter((o) => o.status === status);
      },

      // ─── Clear active order ────────────────────────────────────
      clearActiveOrder: () => set({ activeOrder: null, trackingStep: 0 }),
    }),
    {
      name: 'sipandsavor-orders',
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);

export default useOrderStore;
