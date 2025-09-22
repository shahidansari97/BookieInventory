export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  public status?: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const handleApiError = (error: any): ApiError => {
  // Network error
  if (!error.response) {
    return {
      message: 'Network error. Please check your internet connection.',
      code: 'NETWORK_ERROR'
    };
  }

  const { status, data } = error.response;
  
  return {
    message: data?.message || error.message || 'An unexpected error occurred.',
    status,
    code: data?.code || data?.error || 'UNKNOWN_ERROR',
    details: data?.details || data
  };
};

export const isNetworkError = (error: any): boolean => {
  return !error.response && (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error'));
};

export const isTimeoutError = (error: any): boolean => {
  return error.code === 'ECONNABORTED' || error.message?.includes('timeout');
};

export const isValidationError = (error: any): boolean => {
  return error.response?.status === 422 || error.response?.status === 400;
};

export const isAuthError = (error: any): boolean => {
  return error.response?.status === 401 || error.response?.status === 403;
};

export const isServerError = (error: any): boolean => {
  const status = error.response?.status;
  return status >= 500 && status < 600;
};
