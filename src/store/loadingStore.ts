import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LoadingState {
  isLoading: boolean;
  activeRequests: number;
  showLoading: () => void;
  hideLoading: () => void;
}

export const useLoadingStore = create<LoadingState>()(
  persist(
    (set) => ({
      isLoading: false,
      activeRequests: 0,
      showLoading: () => set((state) => ({ 
        activeRequests: state.activeRequests + 1,
        isLoading: true 
      })),
      hideLoading: () => set((state) => {
        const newActiveRequests = Math.max(0, state.activeRequests - 1);
        return {
          activeRequests: newActiveRequests,
          isLoading: newActiveRequests > 0
        };
      }),
    }),
    {
      name: 'loading-storage',
      partialize: (state) => ({ isLoading: state.isLoading }),
    }
  )
); 