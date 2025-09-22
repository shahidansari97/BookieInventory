import { toast } from '@/hooks/use-toast';

// Simple error types
export type ErrorType = 'network' | 'timeout' | 'validation' | 'auth' | 'server' | 'unknown';

// Simple error handler function
export const handleError = (error: any, type: ErrorType = 'unknown', customMessage?: string) => {
  let title = 'Error';
  let message = customMessage || 'Something went wrong. Please try again.';

  // Determine error type and message
  if (type === 'network' || !error.response) {
    title = 'Connection Error';
    message = 'Unable to connect to server. Please check your internet connection.';
  } else if (type === 'timeout' || error.code === 'ECONNABORTED') {
    title = 'Timeout Error';
    message = 'Request timed out. Please try again.';
  } else if (type === 'validation' || error.response?.status === 422) {
    title = 'Validation Error';
    message = error.response?.data?.message || 'Please check your input and try again.';
  } else if (type === 'auth' || error.response?.status === 401) {
    title = 'Authentication Error';
    message = error.response?.data?.message || 'Please login again to continue.';
  } else if (type === 'server' || error.response?.status >= 500) {
    title = 'Server Error';
    message = error.response?.data?.message || 'Server error. Please try again later.';
  } else if (error.response?.data?.message) {
    message = error.response.data.message;
  }

  // Show error toast
  toast({
    title,
    description: message,
    variant: "destructive"
  });

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error handled:', { error, type, message });
  }
};

// Success message
export const showSuccess = (message: string, title: string = 'Success') => {
  toast({
    title,
    description: message,
    variant: "default"
  });
};

// Info message
export const showInfo = (message: string, title: string = 'Info') => {
  toast({
    title,
    description: message,
    variant: "default"
  });
};

// Auto-detect error type
export const handleApiError = (error: any, customMessage?: string) => {
  let type: ErrorType = 'unknown';

  if (!error.response) {
    type = 'network';
  } else if (error.code === 'ECONNABORTED') {
    type = 'timeout';
  } else if (error.response.status === 422) {
    type = 'validation';
  } else if (error.response.status === 401 || error.response.status === 403) {
    type = 'auth';
  } else if (error.response.status >= 500) {
    type = 'server';
  }

  handleError(error, type, customMessage);
};
