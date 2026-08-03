import { create } from 'zustand';
import api from '../api';

const useProductStore = create((set, get) => ({
  products: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/products');
      set({ products: res.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch products', error);
      set({ isLoading: false });
    }
  },

  getProductById: (id) => {
    return get().products.find(p => String(p.id) === String(id));
  }
}));

export default useProductStore;
