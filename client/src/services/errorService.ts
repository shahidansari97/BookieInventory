import { toast } from '@/hooks/use-toast';
import { handleApiError, isNetworkError, isTimeoutError, isValidationError, isAuthError, isServerError } from '@/utils/errorHandler';

export interface ErrorConfig {
  showToast?: boolean;
  logError?: boolean;
  customMessage?: string;
  customTitle?: string;
}

class ErrorService {
  private static instance: ErrorService;

  private constructor() {}

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Handle any error globally with customizable options
   */
  public handleError(error: any, config: ErrorConfig = {}): void {
    const {
      showToast = true,
      logError = true,
      customMessage,
      customTitle
    } = config;

    // Log error to console in development
    if (logError && process.env.NODE_ENV === 'development') {
      console.error('Global Error Handler:', error);
    }

    // Don't show toast if disabled
    if (!showToast) return;

    const { title, message } = this.getErrorDetails(error, customTitle, customMessage);
    
    toast({
      title,
      description: message,
      variant: "destructive"
    });
  }

  /**
   * Handle API errors specifically
   */
  public handleApiError(error: any, config: ErrorConfig = {}): void {
    this.handleError(error, { ...config, logError: true });
  }

  /**
   * Handle network errors
   */
  public handleNetworkError(error: any, config: ErrorConfig = {}): void {
    this.handleError(error, {
      ...config,
      customTitle: "Connection Error",
      customMessage: "Unable to connect to server. Please check your internet connection."
    });
  }

  /**
   * Handle timeout errors
   */
  public handleTimeoutError(error: any, config: ErrorConfig = {}): void {
    this.handleError(error, {
      ...config,
      customTitle: "Timeout Error",
      customMessage: "Request timed out. Please try again."
    });
  }

  /**
   * Handle validation errors
   */
  public handleValidationError(error: any, config: ErrorConfig = {}): void {
    this.handleError(error, {
      ...config,
      customTitle: "Validation Error",
      customMessage: "Please check your input and try again."
    });
  }

  /**
   * Handle authentication errors
   */
  public handleAuthError(error: any, config: ErrorConfig = {}): void {
    this.handleError(error, {
      ...config,
      customTitle: "Authentication Error",
      customMessage: "Please login again to continue."
    });
  }

  /**
   * Handle server errors
   */
  public handleServerError(error: any, config: ErrorConfig = {}): void {
    this.handleError(error, {
      ...config,
      customTitle: "Server Error",
      customMessage: "Something went wrong on our end. Please try again later."
    });
  }

  /**
   * Handle success messages
   */
  public handleSuccess(message: string, title: string = "Success"): void {
    toast({
      title,
      description: message,
      variant: "default"
    });
  }

  /**
   * Handle info messages
   */
  public handleInfo(message: string, title: string = "Info"): void {
    toast({
      title,
      description: message,
      variant: "default"
    });
  }

  /**
   * Get error details based on error type
   */
  private getErrorDetails(error: any, customTitle?: string, customMessage?: string): { title: string; message: string } {
    // Use custom messages if provided
    if (customTitle && customMessage) {
      return { title: customTitle, message: customMessage };
    }

    // Handle specific error types
    if (isNetworkError(error)) {
      return {
        title: customTitle || "Connection Error",
        message: customMessage || "Unable to connect to server. Please check your internet connection."
      };
    }

    if (isTimeoutError(error)) {
      return {
        title: customTitle || "Timeout Error",
        message: customMessage || "Request timed out. Please try again."
      };
    }

    if (isValidationError(error)) {
      return {
        title: customTitle || "Validation Error",
        message: customMessage || "Please check your input and try again."
      };
    }

    if (isAuthError(error)) {
      return {
        title: customTitle || "Authentication Error",
        message: customMessage || "Please login again to continue."
      };
    }

    if (isServerError(error)) {
      return {
        title: customTitle || "Server Error",
        message: customMessage || "Something went wrong on our end. Please try again later."
      };
    }

    // Default error handling
    const apiError = handleApiError(error);
    return {
      title: customTitle || this.getDefaultTitle(error),
      message: customMessage || apiError.message
    };
  }

  /**
   * Get default title based on error status
   */
  private getDefaultTitle(error: any): string {
    const status = error.response?.status;
    
    switch (status) {
      case 400:
        return "Bad Request";
      case 401:
        return "Authentication Failed";
      case 403:
        return "Access Denied";
      case 404:
        return "Not Found";
      case 422:
        return "Validation Error";
      case 429:
        return "Too Many Requests";
      case 500:
        return "Server Error";
      case 502:
        return "Bad Gateway";
      case 503:
        return "Service Unavailable";
      case 504:
        return "Gateway Timeout";
      default:
        return "Error";
    }
  }
}

// Export singleton instance
export const errorService = ErrorService.getInstance();

// Export convenience functions
export const handleGlobalError = (error: any, config?: ErrorConfig) => errorService.handleError(error, config);
export const handleApiError = (error: any, config?: ErrorConfig) => errorService.handleApiError(error, config);
export const handleNetworkError = (error: any, config?: ErrorConfig) => errorService.handleNetworkError(error, config);
export const handleTimeoutError = (error: any, config?: ErrorConfig) => errorService.handleTimeoutError(error, config);
export const handleValidationError = (error: any, config?: ErrorConfig) => errorService.handleValidationError(error, config);
export const handleAuthError = (error: any, config?: ErrorConfig) => errorService.handleAuthError(error, config);
export const handleServerError = (error: any, config?: ErrorConfig) => errorService.handleServerError(error, config);
export const showSuccess = (message: string, title?: string) => errorService.handleSuccess(message, title);
export const showInfo = (message: string, title?: string) => errorService.handleInfo(message, title);
