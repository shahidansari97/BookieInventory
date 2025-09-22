import { useCallback } from 'react';
import { errorService, ErrorConfig } from '@/services/errorService';

export const useErrorHandler = () => {
  const handleError = useCallback((error: any, config?: ErrorConfig) => {
    errorService.handleError(error, config);
  }, []);

  const handleApiError = useCallback((error: any, config?: ErrorConfig) => {
    errorService.handleApiError(error, config);
  }, []);

  const handleNetworkError = useCallback((error: any, config?: ErrorConfig) => {
    errorService.handleNetworkError(error, config);
  }, []);

  const handleTimeoutError = useCallback((error: any, config?: ErrorConfig) => {
    errorService.handleTimeoutError(error, config);
  }, []);

  const handleValidationError = useCallback((error: any, config?: ErrorConfig) => {
    errorService.handleValidationError(error, config);
  }, []);

  const handleAuthError = useCallback((error: any, config?: ErrorConfig) => {
    errorService.handleAuthError(error, config);
  }, []);

  const handleServerError = useCallback((error: any, config?: ErrorConfig) => {
    errorService.handleServerError(error, config);
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    errorService.handleSuccess(message, title);
  }, []);

  const showInfo = useCallback((message: string, title?: string) => {
    errorService.handleInfo(message, title);
  }, []);

  return {
    handleError,
    handleApiError,
    handleNetworkError,
    handleTimeoutError,
    handleValidationError,
    handleAuthError,
    handleServerError,
    showSuccess,
    showInfo,
  };
};
