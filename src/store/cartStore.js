import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, selectedVariant = null) => {
        const productId = product._id || product.id;
        const variantId = selectedVariant ? selectedVariant.id : 'default';
        const cartItemId = `${productId}-${variantId}`;
        
        const items = get().items;
        const existingItem = items.find((item) => item.cartItemId === cartItemId);
        
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.cartItemId === cartItemId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ 
            items: [
              ...items, 
              { 
                ...product, 
                id: productId, 
                cartItemId,
                selectedVariant,
                price: selectedVariant ? Number(selectedVariant.price) : Number(product.price),
                quantity: 1 
              }
            ] 
          });
        }
      },
      removeItem: (cartItemId) => {
        set({ items: get().items.filter((item) => item.cartItemId !== cartItemId) });
      },
      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'somikoron-cart',
    }
  )
);
