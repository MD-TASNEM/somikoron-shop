import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const customStorage = {
  getItem: (name) => {
    try { return JSON.parse(localStorage.getItem(name)); } catch { return null; }
  },
  setItem: (name, value) => {
    try { localStorage.setItem(name, JSON.stringify(value)); } catch {}
  },
  removeItem: (name) => {
    try { localStorage.removeItem(name); } catch {}
  },
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      lastSyncedAt: null,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const idx = state.items.findIndex((i) => i.productId === item.productId);
          if (idx !== -1) {
            const updated = [...state.items];
            updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
            return { items: updated };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) { get().removeItem(productId); return; }
        set((state) => ({
          items: state.items.map((i) => i.productId === productId ? { ...i, quantity } : i),
        }));
      },

      clearCart: () => set({ items: [], isLoading: false, error: null, lastSyncedAt: null }),

      getTotalItems: () => get().items.reduce((t, i) => t + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((t, i) => t + i.price * i.quantity, 0),
      getItemQuantity: (productId) => get().items.find((i) => i.productId === productId)?.quantity || 0,
      isInCart: (productId) => get().items.some((i) => i.productId === productId),

      syncToMongoDB: async () => {
        try {
          set({ isLoading: true });
          await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: get().items }),
          });
          set({ isLoading: false, lastSyncedAt: new Date() });
        } catch (e) {
          set({ isLoading: false, error: e.message });
        }
      },

      loadFromMongoDB: async () => {
        try {
          set({ isLoading: true });
          const res = await fetch('/api/cart/sync');
          if (res.ok) {
            const data = await res.json();
            if (data.items?.length > 0) {
              set({ items: data.items, isLoading: false, lastSyncedAt: new Date() });
              return;
            }
          }
          set({ isLoading: false });
        } catch (e) {
          set({ isLoading: false, error: e.message });
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ items: state.items, lastSyncedAt: state.lastSyncedAt }),
      version: 1,
    }
  )
);

export const cartActions = {
  isEmpty: () => useCartStore.getState().items.length === 0,

  getCartSummary: () => {
    const { getTotalItems, getTotalPrice, items } = useCartStore.getState();
    return { totalItems: getTotalItems(), totalPrice: getTotalPrice(), items };
  },

  calculateSavings: () => {
    const { items } = useCartStore.getState();
    const totalOriginal = items.reduce((t, i) => t + ((i.originalPrice || i.price) * i.quantity), 0);
    const totalPrice = items.reduce((t, i) => t + i.price * i.quantity, 0);
    const savings = totalOriginal - totalPrice;
    return {
      savings,
      savingsPercentage: totalOriginal > 0 ? Math.round((savings / totalOriginal) * 100) : 0,
    };
  },

  validateStock: async () => {
    const { items } = useCartStore.getState();
    try {
      const res = await fetch('/api/products/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },
};
