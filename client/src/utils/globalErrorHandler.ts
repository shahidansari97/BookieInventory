import { errorService } from '@/services/errorService';

/**
 * Initialize global error handlers for unhandled errors
 */
export const initializeGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    errorService.handleError(event.reason, {
      customTitle: "Unhandled Error",
      customMessage: "An unexpected error occurred. Please try again.",
      showToast: true,
      logError: true
    });

    // Prevent the default browser behavior
    event.preventDefault();
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    
    errorService.handleError(event.error, {
      customTitle: "Application Error",
      customMessage: "An unexpected error occurred. Please refresh the page.",
      showToast: true,
      logError: true
    });
  });

  // Handle console errors (optional)
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Call original console.error
    originalConsoleError.apply(console, args);
    
    // Check if it's an error object
    const error = args.find(arg => arg instanceof Error);
    if (error && process.env.NODE_ENV === 'development') {
      errorService.handleError(error, {
        showToast: false, // Don't show toast for console errors
        logError: true
      });
    }
  };
};

/**
 * Cleanup global error handlers
 */
export const cleanupGlobalErrorHandlers = () => {
  window.removeEventListener('unhandledrejection', () => {});
  window.removeEventListener('error', () => {});
};
