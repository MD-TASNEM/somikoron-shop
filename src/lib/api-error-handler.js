import { 
  showApiErrorToast, 
  showNetworkErrorToast, 
  showServerErrorToast,
  showValidationErrorToast 
} from './toast';

;
    status?: number;
  };
  message?: string;
  code?: string;
}

export class ApiErrorHandler {
  /**
   * Handle API errors and show appropriate toast messages
   */
  static handle(error) {
    console.error('API Error:', error);

    // Network error
    if (!error.response && !error.message) {
      showNetworkErrorToast();
      return;
    }

    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message || data?.error || error.message;

    switch (status) {
      case 400:
        // Bad Request - Validation errors
        if (message) {
          showValidationErrorToast(message);
        } else {
          showApiErrorToast(error, 'Invalid request. Please check your input.');
        }
        break;

      case 401:
        // Unauthorized
        showApiErrorToast(error, 'Please login to access this feature.');
        break;

      case 403:
        // Forbidden
        showApiErrorToast(error, 'You do not have permission to perform this action.');
        break;

      case 404:
        // Not Found
        showApiErrorToast(error, 'The requested resource was not found.');
        break;

      case 409:
        // Conflict
        showApiErrorToast(error, 'This action conflicts with existing data.');
        break;

      case 422:
        // Unprocessable Entity - Validation errors
        if (message) {
          showValidationErrorToast(message);
        } else {
          showApiErrorToast(error, 'Invalid data provided. Please check your input.');
        }
        break;

      case 429:
        // Too Many Requests
        showApiErrorToast(error, 'Too many requests. Please try again later.');
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        showServerErrorToast();
        break;

      default:
        // Generic error
        showApiErrorToast(error, defaultMessage);
        break;
    }
  }

  /**
   * Handle fetch API errors with response checking
   */
  static async handleFetch(response) {
    if (!response.ok) {
      let errorData = {};
      
      try {
        errorData = await response.json();
      } catch {
        // If JSON parsing fails, use status text
        errorData = { message: response.statusText };
      }

      const error = {
        response: {
          data,
          status: response.status
        }
      };

      this.handle(error, defaultMessage);
    }
  }

  /**
   * Create a wrapper for async functions to handle errors automatically
   */
  static withErrorHandling(
    fn: (...args) => Promise,
    errorMessage?) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handle(error);
        return null;
      }
    };
  }

  /**
   * Handle form submission errors
   */
  static handleFormError(error) {
    const message = error.response?.data?.message || error.message;
    
    if (error.response?.status === 400 || error.response?.status === 422) {
      // Validation errors
      showValidationErrorToast(message || 'Please check your form inputs.');
    } else {
      // Other errors
      this.handle(error, `Failed to submit ${formName}. Please try again.`);
    }
  }

  /**
   * Handle file upload errors
   */
  static handleFileUploadError(error) {
    const message = error.response?.data?.message || error.message;
    
    if (error.response?.status === 413) {
      // File too large
      showValidationErrorToast('File is too large. Please choose a smaller file.');
    } else if (error.response?.status === 415) {
      // Unsupported file type
      showValidationErrorToast('File type not supported. Please choose a valid file.');
    } else {
      // Other errors
      this.handle(error, `Failed to upload ${fileName || 'file'}.`);
    }
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error) {
    const message = error.response?.data?.message || error.message;
    
    if (error.response?.status === 401) {
      showApiErrorToast(error, 'Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      showApiErrorToast(error, 'Access denied. You do not have permission.');
    } else {
      this.handle(error, 'Authentication failed. Please try again.');
    }
  }

  /**
   * Handle payment errors
   */
  static handlePaymentError(error) {
    const message = error.response?.data?.message || error.message;
    
    if (error.response?.status === 400) {
      showValidationErrorToast(message || 'Invalid payment information.');
    } else if (error.response?.status === 402) {
      showApiErrorToast(error, 'Payment required. Please complete the payment.');
    } else {
      this.handle(error, 'Payment failed. Please try again.');
    }
  }

  /**
   * Handle cart errors
   */
  static handleCartError(error) {
    const message = error.response?.data?.message || error.message;
    
    if (error.response?.status === 400) {
      showValidationErrorToast(message || 'Invalid cart operation.');
    } else if (error.response?.status === 409) {
      showValidationErrorToast('Cart item conflict. Please refresh and try again.');
    } else {
      this.handle(error, 'Cart operation failed. Please try again.');
    }
  }
}

/**
 * Higher-order function to wrap API calls with error handling
 */
export function withApiErrorHandling(
  fn: (...args) => Promise,
  errorMessage?) {
  return ApiErrorHandler.withErrorHandling(fn, errorMessage);
}

/**
 * Utility function to check if an error is a network error
 */
export function isNetworkError(error) {
  return !error.response && (!error.message || error.message.includes('Network Error') || error.message.includes('fetch'));
}

/**
 * Utility function to check if an error is a validation error
 */
export function isValidationError(error) {
  return error.response?.status === 400 || error.response?.status === 422;
}

/**
 * Utility function to check if an error is an authentication error
 */
export function isAuthError(error) {
  return error.response?.status === 401 || error.response?.status === 403;
}

/**
 * Utility function to check if an error is a server error
 */
export function isServerError(error) {
  const status = error.response?.status;
  return status >= 500 && status < 600;
}
