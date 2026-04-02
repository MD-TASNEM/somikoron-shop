import { 
  showAddedToCartToast, 
  showRemovedFromCartToast, 
  showCartUpdatedToast, 
  showCartClearedToast,
  showProductOutOfStockToast,
  showValidationErrorToast 
} from './toast';
import { ApiErrorHandler } from './api-error-handler';



export class CartToastHelper {
  /**
   * Add item to cart with toast notification
   */
  static async addToCart(
    item, 'quantity'>,
    quantity: number = 1,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
      // Check stock availability
      if (item.stock < quantity) {
        showProductOutOfStockToast(item.name);
        return;
      }

      // Call API to add to cart
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId)
      });

      if (!response.ok) {
        await ApiErrorHandler.handleFetch(response, 'Failed to add item to cart');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        showAddedToCartToast(item.name);
        onSuccess?.(result);
      } else {
        ApiErrorHandler.handle({ response: { data);
      }
    } catch (error) {
      ApiErrorHandler.handle(error, 'Failed to add item to cart');
      onError?.(error);
    }
  }

  /**
   * Remove item from cart with toast notification
   */
  static async removeFromCart(
    productId,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
      const response = await fetch(`/api/cart/remove/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        await ApiErrorHandler.handleFetch(response, 'Failed to remove item from cart');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        showRemovedFromCartToast(productName);
        onSuccess?.(result);
      } else {
        ApiErrorHandler.handle({ response: { data);
      }
    } catch (error) {
      ApiErrorHandler.handle(error, 'Failed to remove item from cart');
      onError?.(error);
    }
  }

  /**
   * Update cart item quantity with toast notification
   */
  static async updateCartItem(
    productId,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
      // Validate quantity
      if (quantity < 0) {
        showValidationErrorToast('Quantity cannot be negative');
        return;
      }

      if (quantity > stock) {
        showProductOutOfStockToast(productName);
        return;
      }

      const response = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          quantity
        })
      });

      if (!response.ok) {
        await ApiErrorHandler.handleFetch(response, 'Failed to update cart');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        showCartUpdatedToast();
        onSuccess?.(result);
      } else {
        ApiErrorHandler.handle({ response: { data);
      }
    } catch (error) {
      ApiErrorHandler.handle(error, 'Failed to update cart');
      onError?.(error);
    }
  }

  /**
   * Clear cart with toast notification
   */
  static async clearCart(
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE'
      });

      if (!response.ok) {
        await ApiErrorHandler.handleFetch(response, 'Failed to clear cart');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        showCartClearedToast();
        onSuccess?.(result);
      } else {
        ApiErrorHandler.handle({ response: { data);
      }
    } catch (error) {
      ApiErrorHandler.handle(error, 'Failed to clear cart');
      onError?.(error);
    }
  }

  /**
   * Quick add to cart (single item)
   */
  static quickAddToCart(
    item, 'quantity'>,
    onSuccess?: () => void
  ) {
    this.addToCart(item, 1, onSuccess);
  }

  /**
   * Batch add multiple items to cart
   */
  static async addMultipleToCart(
    items: Array<{ productId: string; quantity: number; name: string; stock,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
      // Validate all items first
      for (const item of items) {
        if (item.stock < item.quantity) {
          showProductOutOfStockToast(item.name);
          return;
        }
      }

      const response = await fetch('/api/cart/batch-add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        await ApiErrorHandler.handleFetch(response, 'Failed to add items to cart');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        const itemCount = items.length;
        showAddedToCartToast(`${itemCount} items added to cart`);
        onSuccess?.(result);
      } else {
        ApiErrorHandler.handle({ response: { data);
      }
    } catch (error) {
      ApiErrorHandler.handle(error, 'Failed to add items to cart');
      onError?.(error);
    }
  }
}

/**
 * Hook for cart operations with toast notifications
 */
export function useCartToast() {
  return {
    addToCart,
    addMultipleToCart: CartToastHelper.addMultipleToCart
  };
}
