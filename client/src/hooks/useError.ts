import { useCallback } from 'react';
import { handleError, handleApiError, showSuccess, showInfo, ErrorType } from '@/utils/errorUtils';

// Simple hook for error handling
export const useError = () => {
  const handle = useCallback((error: any, type?: ErrorType, customMessage?: string) => {
    handleError(error, type, customMessage);
  }, []);

  const handleApi = useCallback((error: any, customMessage?: string) => {
    handleApiError(error, customMessage);
  }, []);

  const success = useCallback((message: string, title?: string) => {
    showSuccess(message, title);
  }, []);

  const info = useCallback((message: string, title?: string) => {
    showInfo(message, title);
  }, []);

  return {
    handle,
    handleApi,
    success,
    info,
  };
};
