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
      logError: false // Disable logging to prevent circular dependency
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
      logError: false // Disable logging to prevent circular dependency
    });
  });
};

/**
 * Cleanup global error handlers
 */
export const cleanupGlobalErrorHandlers = () => {
  window.removeEventListener('unhandledrejection', () => {});
  window.removeEventListener('error', () => {});
};
