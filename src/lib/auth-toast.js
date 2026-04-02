import { 
  showLoginSuccessToast, 
  showLogoutSuccessToast, 
  showLoginErrorToast, 
  showRegisterSuccessToast, 
  showRegisterErrorToast,
  showValidationErrorToast 
} from './toast';
import { ApiErrorHandler } from './api-error-handler';

export class AuthToastHelper {
  /**
   * Handle login with toast notifications
   */
  static async login(
    credentials: { email: string; password,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
      // Validate input
      if (!credentials.email || !credentials.password) {
        showValidationErrorToast('Please enter email and password');
        return;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        await ApiErrorHandler.handleFetch(response, 'Login failed');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        showLoginSuccessToast();
        onSuccess?.(result);
      } else {
        showLoginErrorToast(result.message);
        onError?.(result);
      }
    } catch (error) {
      ApiErrorHandler.handleAuthError(error);
      onError?.(error);
    }
  }

  /**
   * Handle registration with toast notifications
   */
  static async register(
    userData: { name: string; email: string; password: string; phone?,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
      // Validate input
      if (!userData.name || !userData.email || !userData.password) {
        showValidationErrorToast('Please fill in all required fields');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        showValidationErrorToast('Please enter a valid email address');
        return;
      }

      // Password validation
      if (userData.password.length < 6) {
        showValidationErrorToast('Password must be at least 6 characters long');
        return;
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        await ApiErrorHandler.handleFetch(response, 'Registration failed');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        showRegisterSuccessToast();
        onSuccess?.(result);
      } else {
        showRegisterErrorToast(result.message);
        onError?.(result);
      }
    } catch (error) {
      ApiErrorHandler.handleAuthError(error);
      onError?.(error);
    }
  }

  /**
   * Handle logout with toast notification
   */
  static async logout(
    onSuccess?: () => void,
    onError?: (error) => void
  ) {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });

      if (!response.ok) {
        await ApiErrorHandler.handleFetch(response, 'Logout failed');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        showLogoutSuccessToast();
        onSuccess?.();
      } else {
        ApiErrorHandler.handle({ response: { data);
      }
    } catch (error) {
      ApiErrorHandler.handle(error'Logout failed');
      onError?.(error);
    }
  }

  /**
   * Handle password reset request
   */
  static async requestPasswordReset(
    email,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showValidationErrorToast('Please enter a valid email address');
        return;
      }

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        await ApiErrorHandler.handleFetch(response, 'Failed to send reset email');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        // Use success toast for password reset
        showLoginSuccessToast();
        onSuccess?.(result);
      } else {
        ApiErrorHandler.handle({ response: { data);
      }
    } catch (error) {
      ApiErrorHandler.handle(error'Failed to send reset email');
      onError?.(error);
    }
  }

  /**
   * Handle password reset
   */
  static async resetPassword(
    token,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
      // Validate password
      if (newPassword.length < 6) {
        showValidationErrorToast('Password must be at least 6 characters long');
        return;
      }

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });

      if (!response.ok) {
        await ApiErrorHandler.handleFetch(response, 'Password reset failed');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        showLoginSuccessToast();
        onSuccess?.(result);
      } else {
        ApiErrorHandler.handle({ response: { data);
      }
    } catch (error) {
      ApiErrorHandler.handle(error'Password reset failed');
      onError?.(error);
    }
  }

  /**
   * Handle profile update
   */
  static async updateProfile(
    profileData: { name?: string; email?: string; phone?,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        await ApiErrorHandler.handleFetch(response, 'Profile update failed');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        showLoginSuccessToast();
        onSuccess?.(result);
      } else {
        ApiErrorHandler.handle({ response: { data);
      }
    } catch (error) {
      ApiErrorHandler.handle(error'Profile update failed');
      onError?.(error);
    }
  }

  /**
   * Handle password change
   */
  static async changePassword(
    currentPassword,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
      // Validate passwords
      if (!currentPassword || !newPassword) {
        showValidationErrorToast('Please enter current and new password');
        return;
      }

      if (newPassword.length < 6) {
        showValidationErrorToast('New password must be at least 6 characters long');
        return;
      }

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        await ApiErrorHandler.handleFetch(response, 'Password change failed');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        showLoginSuccessToast();
        onSuccess?.(result);
      } else {
        ApiErrorHandler.handle({ response: { data);
      }
    } catch (error) {
      ApiErrorHandler.handle(error'Password change failed');
      onError?.(error);
    }
  }
}

/**
 * Hook for authentication operations with toast notifications
 */
export function useAuthToast() {
  return {
    login,
    changePassword: AuthToastHelper.changePassword
  };
}
