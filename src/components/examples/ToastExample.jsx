'use client';

import { useState } from 'react';
import { 
  showSuccessToast, 
  showErrorToast, 
  showInfoToast, 
  showWarningToast,
  showAddedToCartToast,
  showRemovedFromCartToast,
  showLoginSuccessToast,
  showLogoutSuccessToast,
  showFormSuccessToast,
  showOrderPlacedToast
} from '@/lib/toast';
import { useCartToast } from '@/lib/cart-toast';
import { useAuthToast } from '@/lib/auth-toast';
import { useFormToast } from '@/lib/form-toast';
import { Button } from '@/components/ui/button';

export default function ToastExample() {
  const [isLoading, setIsLoading] = useState(false);
  const cartToast = useCartToast();
  const authToast = useAuthToast();
  const formToast = useFormToast();

  // Sample product data
  const sampleProduct = {
    productId: 'sample-123',
    name: 'Sample Product',
    price: 999,
    image: '/images/sample.jpg',
    stock: 10
  };

  // Basic toast examples
  const handleSuccessToast = () => {
    showSuccessToast('This is a success message!');
  };

  const handleErrorToast = () => {
    showErrorToast('This is an error message!');
  };

  const handleInfoToast = () => {
    showInfoToast('This is an info message!');
  };

  const handleWarningToast = () => {
    showWarningToast('This is a warning message!');
  };

  // Cart toast examples
  const handleAddToCart = () => {
    cartToast.quickAddToCart(sampleProduct, () => {
      console.log('Product added to cart successfully!');
    });
  };

  const handleRemoveFromCart = () => {
    cartToast.removeFromCart(sampleProduct.productId, sampleProduct.name, () => {
      console.log('Product removed from cart successfully!');
    });
  };

  // Auth toast examples
  const handleLogin = () => {
    authToast.login(
      { email: 'user@example.com', password: 'password123' },
      (result) => {
        console.log('Login successful:', result);
      },
      (error) => {
        console.log('Login failed:', error);
      }
    );
  };

  const handleLogout = () => {
    authToast.logout(() => {
      console.log('Logout successful');
    });
  };

  // Form toast examples
  const handleSubmitForm = () => {
    setIsLoading(true);
    
    formToast.submitForm(
      '/api/example',
      'POST',
      { name: 'John Doe', email: 'john@example.com' },
      'example form',
      (result) => {
        console.log('Form submitted successfully:', result);
        setIsLoading(false);
      },
      (error) => {
        console.log('Form submission failed:', error);
        setIsLoading(false);
      }
    );
  };

  const handleContactForm = () => {
    formToast.submitContactForm(
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+8801234567890',
        message: 'This is a test message'
      },
      (result) => {
        console.log('Contact form submitted:', result);
      },
      (error) => {
        console.log('Contact form failed:', error);
      }
    );
  };

  // Order toast examples
  const handlePlaceOrder = () => {
    // Simulate order placement
    const orderId = 'ORD-' + Date.now();
    showOrderPlacedToast(orderId);
  };

  // API error handling example
  const handleApiError = () => {
    // Simulate API error
    const error = {
      response: {
        data: { message: 'This is a simulated API error' },
        status: 400
      }
    };
    
    // This would normally be handled by ApiErrorHandler
    showErrorToast(error.response?.data?.message || 'API error occurred');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Toast Notification Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Toast Examples */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Toasts</h2>
          <div className="space-y-3">
            <Button onClick={handleSuccessToast} className="w-full">
              Success Toast
            </Button>
            <Button onClick={handleErrorToast} variant="destructive" className="w-full">
              Error Toast
            </Button>
            <Button onClick={handleInfoToast} variant="outline" className="w-full">
              Info Toast
            </Button>
            <Button onClick={handleWarningToast} variant="secondary" className="w-full">
              Warning Toast
            </Button>
          </div>
        </div>

        {/* Cart Toast Examples */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Cart Actions</h2>
          <div className="space-y-3">
            <Button onClick={handleAddToCart} className="w-full">
              Add to Cart
            </Button>
            <Button onClick={handleRemoveFromCart} variant="outline" className="w-full">
              Remove from Cart
            </Button>
          </div>
        </div>

        {/* Auth Toast Examples */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Authentication</h2>
          <div className="space-y-3">
            <Button onClick={handleLogin} className="w-full">
              Simulate Login
            </Button>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Simulate Logout
            </Button>
          </div>
        </div>

        {/* Form Toast Examples */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Form Submissions</h2>
          <div className="space-y-3">
            <Button 
              onClick={handleSubmitForm} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Submitting...' : 'Submit Form'}
            </Button>
            <Button onClick={handleContactForm} variant="outline" className="w-full">
              Contact Form
            </Button>
          </div>
        </div>

        {/* Order Toast Examples */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Order Actions</h2>
          <div className="space-y-3">
            <Button onClick={handlePlaceOrder} className="w-full">
              Place Order
            </Button>
          </div>
        </div>

        {/* API Error Examples */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">API Errors</h2>
          <div className="space-y-3">
            <Button onClick={handleApiError} variant="destructive" className="w-full">
              Simulate API Error
            </Button>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Usage Instructions</h2>
        <div className="space-y-4 text-sm">
          
            <h3 className="font-medium mb-2">Basic Usage:</h3>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
{`import { showSuccessToast, showErrorToast } from '@/lib/toast';

showSuccessToast('Operation completed successfully!');
showErrorToast('Something went wrong!');`}
            </pre>
          </div>
          
          
            <h3 className="font-medium mb-2">Cart Operations:</h3>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
{`import { useCartToast } from '@/lib/cart-toast';

const cartToast = useCartToast();
cartToast.quickAddToCart(product);`}
            </pre>
          </div>
          
          
            <h3 className="font-medium mb-2">Form Submissions:</h3>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
{`import { useFormToast } from '@/lib/form-toast';

const formToast = useFormToast();
formToast.submitForm('/api/endpoint', 'POST', data, 'form name');`}
            </pre>
          </div>
          
          
            <h3 className="font-medium mb-2">API Error Handling:</h3>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
{`import { ApiErrorHandler } from '@/lib/api-error-handler';

try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) {
    await ApiErrorHandler.handleFetch(response);
  }
} catch (error) {
  ApiErrorHandler.handle(error);
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
