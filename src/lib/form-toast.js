import { 
  showFormSuccessToast, 
  showFormErrorToast, 
  showValidationErrorToast,
  showFileUploadSuccessToast,
  showFileUploadErrorToast
} from './toast';
import { ApiErrorHandler } from './api-error-handler';



export class FormToastHelper {
  /**
   * Validate form fields and show toast for errors
   */
  static validateFields(fields) {
    for (const field of fields) {
      const value = field.value.trim();

      // Required field validation
      if (field.required && !value) {
        showValidationErrorToast(`${field.name} is required`);
        return false;
      }

      // Skip further validation if field is empty and not required
      if (!value && !field.required) {
        continue;
      }

      // Email validation
      if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          showValidationErrorToast(`Please enter a valid ${field.name.toLowerCase()}`);
          return false;
        }
      }

      // Phone validation
      if (field.type === 'tel') {
        const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
          showValidationErrorToast(`Please enter a valid ${field.name.toLowerCase()}`);
          return false;
        }
      }

      // Length validation
      if (field.minLength && value.length < field.minLength) {
        showValidationErrorToast(`${field.name} must be at least ${field.minLength} characters long`);
        return false;
      }

      if (field.maxLength && value.length > field.maxLength) {
        showValidationErrorToast(`${field.name} must not exceed ${field.maxLength} characters`);
        return false;
      }

      // Pattern validation
      if (field.pattern) {
        const regex = new RegExp(field.pattern);
        if (!regex.test(value)) {
          showValidationErrorToast(`${field.name} format is invalid`);
          return false;
        }
      }

      // Number validation
      if (field.type === 'number') {
        const num = parseFloat(value);
        if (isNaN(num)) {
          showValidationErrorToast(`${field.name} must be a valid number`);
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Handle form submission with toast notifications
   */
  static async submitForm(
    url,
    method: 'POST' | 'PUT' | 'PATCH' = 'POST',
    data,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        await ApiErrorHandler.handleFetch(response, `Failed to submit ${formName}`);
        return null;
      }

      const result = await response.json();
      
      if (result.success) {
        showFormSuccessToast(formName);
        onSuccess?.(result);
        return result;
      } else {
        ApiErrorHandler.handleFormError({ response: { data);
        return null;
      }
    } catch (error) {
      ApiErrorHandler.handleFormError(error);
      onError?.(error);
      return null;
    }
  }

  /**
   * Handle file upload with toast notifications
   */
  static async uploadFile(
    file,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
      // Validate file
      if (!file) {
        showValidationErrorToast('Please select a file');
        return null;
      }

      // File size validation (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showValidationErrorToast('File size must not exceed 5MB');
        return null;
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await fetch(url, {
        method: 'POST',
        body);

      if (!response.ok) {
        await ApiErrorHandler.handleFetch(response, 'File upload failed');
        return null;
      }

      const result = await response.json();
      
      if (result.success) {
        showFileUploadSuccessToast(file.name);
        onSuccess?.(result);
        return result;
      } else {
        showFileUploadErrorToast(file.name);
        return null;
      }
    } catch (error) {
      ApiErrorHandler.handleFileUploadError(error);
      onError?.(error);
      return null;
    }
  }

  /**
   * Handle multiple file uploads
   */
  static async uploadMultipleFiles(
    files,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
      if (!files || files.length === 0) {
        showValidationErrorToast('Please select files to upload');
        return null;
      }

      // Validate file sizes
      const maxSize = 5 * 1024 * 1024;
      for (const file of files) {
        if (file.size > maxSize) {
          showValidationErrorToast(`File ${file.name} exceeds 5MB limit`);
          return null;
        }
      }

      // Create form data
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await fetch(url, {
        method: 'POST',
        body);

      if (!response.ok) {
        await ApiErrorHandler.handleFetch(response, 'File upload failed');
        return null;
      }

      const result = await response.json();
      
      if (result.success) {
        showFileUploadSuccessToast(`${files.length} files uploaded`);
        onSuccess?.(result);
        return result;
      } else {
        showFileUploadErrorToast();
        return null;
      }
    } catch (error) {
      ApiErrorHandler.handleFileUploadError(error);
      onError?.(error);
      return null;
    }
  }

  /**
   * Handle contact form submission
   */
  static async submitContactForm(
    data: { name: string; email: string; phone: string; message,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
    // Validate fields
    const fields = [
      { name: 'Name', value,
      { name: 'Email', value, type: 'email' },
      { name: 'Phone', value, type: 'tel' },
      { name: 'Message', value, minLength: 10 }
    ];

    if (!this.validateFields(fields)) {
      return null;
    }

    return this.submitForm('/api/contact', 'POST', data, 'contact form', onSuccess, onError);
  }

  /**
   * Handle newsletter subscription
   */
  static async subscribeNewsletter(
    email,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
    // Validate email
    const fields = [
      { name: 'Email', value, type: 'email' }
    ];

    if (!this.validateFields(fields)) {
      return null;
    }

    const data = { email, name: name || '' };
    return this.submitForm('/api/newsletter/subscribe', 'POST', data, 'newsletter subscription', onSuccess, onError);
  }

  /**
   * Handle review submission
   */
  static async submitReview(
    data: { productId: string; rating: number; comment,
    onSuccess?: (result) => void,
    onError?: (error) => void
  ) {
    // Validate fields
    const fields = [
      { name: 'Rating', value: data.rating.toString(), required, type: 'number' },
      { name: 'Review', value, minLength: 10 }
    ];

    if (!this.validateFields(fields)) {
      return null;
    }

    return this.submitForm('/api/reviews', 'POST', data, 'review', onSuccess, onError);
  }
}

/**
 * Hook for form operations with toast notifications
 */
export function useFormToast() {
  return {
    validateFields,
    submitReview: FormToastHelper.submitReview
  };
}
