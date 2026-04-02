import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const toastConfig = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored',
};

export const toastStyles = `
  .Toastify__toast { border-radius: 0.5rem; font-weight: 500; }
  .Toastify__toast--success { background: linear-gradient(135deg, #10b981, #059669); color: white; }
  .Toastify__toast--error { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
  .Toastify__toast--info { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
  .Toastify__toast--warning { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
`;

export const showSuccessToast = (message, options) =>
  toast.success(message, { icon: '✓', ...options });

export const showErrorToast = (message, options) =>
  toast.error(message, { icon: '✕', ...options });

export const showInfoToast = (message, options) =>
  toast.info(message, { icon: 'ℹ', ...options });

export const showWarningToast = (message, options) =>
  toast.warning(message, { icon: '⚠', ...options });

export const showAddedToCartToast = (name) => showSuccessToast(`${name} added to cart`);
export const showRemovedFromCartToast = (name) => showInfoToast(`${name} removed from cart`);
export const showLoginSuccessToast = () => showSuccessToast('Login successful!');
export const showLogoutSuccessToast = () => showInfoToast('Logged out successfully');
export const showOrderPlacedToast = (id) => showSuccessToast(`Order #${id} placed successfully!`);
export const showPaymentSuccessToast = () => showSuccessToast('Payment successful!');
export const showPaymentFailedToast = () => showErrorToast('Payment failed. Please try again.');
export const showSettingsSavedToast = () => showSuccessToast('Settings saved successfully!');

export { ToastContainer };
