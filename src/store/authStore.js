import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAgeVerified: false,
      loginStep: 'phone', // 'phone' | 'otp' | 'done'
      isLoading: false,

      // ─── Age Verification ──────────────────────────────────────
      verifyAge: () => {
        set({ isAgeVerified: true });
      },

      resetAgeVerification: () => {
        set({ isAgeVerified: false });
      },

      // ─── Auth Flow ─────────────────────────────────────────────
      sendOtp: async (phone) => {
        set({ isLoading: true });
        try {
          await api.post('/auth/send-otp', { phone });
          set({ loginStep: 'otp', isLoading: false });
        } catch (error) {
          console.error(error);
          set({ isLoading: false });
          throw error;
        }
      },

      verifyOtp: async (otp, phone) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/verify-otp', { phone, otp });
          set({
            user: res.data.user,
            isAuthenticated: true,
            loginStep: 'done',
            isLoading: false,
          });
          if (res.data.token) {
            localStorage.setItem('auth_token', res.data.token);
          }
        } catch (error) {
          console.error(error);
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', userData);
          set({ isLoading: false });
          return res.data;
        } catch (error) {
          console.error(error);
          set({ isLoading: false });
          throw error;
        }
      },

      login: () => {
        // Fallback or testing
        set({ isAuthenticated: true, loginStep: 'done' });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          loginStep: 'phone',
        });
      },

      resetLoginStep: () => {
        set({ loginStep: 'phone' });
      },

      updateProfile: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },

      addAddress: (address) => {
        set((state) => {
          if (!state.user) return state;
          const id = Date.now();
          return {
            user: {
              ...state.user,
              addresses: [...state.user.addresses, { ...address, id }],
            },
          };
        });
      },

      removeAddress: (id) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              addresses: state.user.addresses.filter((a) => a.id !== id),
            },
          };
        });
      },
    }),
    {
      name: 'sipandsavor-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAgeVerified: state.isAgeVerified,
      }),
    }
  )
);

export default useAuthStore;
