import { create } from 'zustand';
import api from '../api';

const useAdminStore = create((set, get) => ({
  retailers: [],
  metrics: {
    totalRevenue: 154000,
    activeDeliveries: 2,
    totalOrders: 12,
    activeRetailers: 5,
  },

  fetchAdminData: async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/shops')
      ]);
      set({
        metrics: mRes.data,
        retailers: sRes.data
      });
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    }
  },
  
  updateRetailerStatus: async (retailerId, newStatus) => {
    try {
      await api.patch(`/admin/shops/${retailerId}`, { status: newStatus });
      get().fetchAdminData();
    } catch (error) {
      console.error('Failed to update shop status:', error);
    }
  },
}));

export default useAdminStore;
