import { create } from 'zustand';
import api from '../api';

const useDeliveryStore = create((set, get) => ({
  activeDeliveries: [],
  history: [],
  isOnline: true,
  
  toggleOnlineStatus: () => set((state) => ({ isOnline: !state.isOnline })),
  
  fetchDeliveries: async () => {
    try {
      const res = await api.get('/delivery/available-jobs');
      const all = res.data;
      set({
        activeDeliveries: all.filter(d => d.status !== 'delivered'),
        history: all.filter(d => d.status === 'delivered')
      });
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
    }
  },

  updateDeliveryStatus: async (deliveryId, newStatus) => {
    try {
      const item = get().activeDeliveries.find(d => d.id === deliveryId);
      if (item) {
        await api.post('/delivery/update-status', {
          orderId: item.orderId,
          status: newStatus
        });
        get().fetchDeliveries();
      }
    } catch (error) {
      console.error('Failed to update delivery status:', error);
    }
  },
}));

export default useDeliveryStore;
