// Example usage of the global error service

import { 
  handleGlobalError, 
  handleApiError, 
  handleNetworkError, 
  handleTimeoutError,
  handleValidationError,
  handleAuthError,
  handleServerError,
  showSuccess,
  showInfo 
} from '@/services/errorService';

import { useErrorHandler } from '@/hooks/useErrorHandler';

// Example 1: Using the service directly
export const exampleDirectUsage = async () => {
  try {
    // Some API call
    const response = await fetch('/api/some-endpoint');
    if (!response.ok) {
      throw new Error('API call failed');
    }
  } catch (error) {
    // Handle any error globally
    handleGlobalError(error, {
      customTitle: "Custom Error Title",
      customMessage: "Custom error message",
      showToast: true,
      logError: true
    });
  }
};

// Example 2: Using specific error handlers
export const exampleSpecificHandlers = async () => {
  try {
    // API call that might fail
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('API call failed');
    }
  } catch (error) {
    // Use specific error handler based on error type
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      handleNetworkError(error);
    } else if (error.message.includes('timeout')) {
      handleTimeoutError(error);
    } else if (error.message.includes('validation')) {
      handleValidationError(error);
    } else {
      handleApiError(error);
    }
  }
};

// Example 3: Using the React hook
export const ExampleComponent = () => {
  const { 
    handleError, 
    handleApiError, 
    showSuccess, 
    showInfo 
  } = useErrorHandler();

  const handleSubmit = async (data: any) => {
    try {
      // Some API call
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        showSuccess('Data submitted successfully!');
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      handleApiError(error, {
        customTitle: "Submission Error"
      });
    }
  };

  const handleInfoClick = () => {
    showInfo('This is an informational message');
  };

  return (
    <div>
      <button onClick={() => handleSubmit({ test: 'data' })}>
        Submit Data
      </button>
      <button onClick={handleInfoClick}>
        Show Info
      </button>
    </div>
  );
};

// Example 4: Disabling toast for specific errors
export const exampleWithoutToast = async () => {
  try {
    // Some operation that might fail but we don't want to show toast
    const result = await someOperation();
  } catch (error) {
    handleGlobalError(error, {
      showToast: false, // Don't show toast
      logError: true    // But still log the error
    });
  }
};

// Example 5: Custom error configuration
export const exampleCustomConfig = async () => {
  try {
    // Some API call
    const response = await fetch('/api/sensitive-data');
  } catch (error) {
    handleApiError(error, {
      customTitle: "Data Access Error",
      customMessage: "Unable to access sensitive data. Please contact support.",
      showToast: true,
      logError: false // Don't log sensitive errors
    });
  }
};

// Example 6: Success and info messages
export const exampleSuccessMessages = () => {
  // Show success message
  showSuccess('Operation completed successfully!', 'Success');
  
  // Show info message
  showInfo('Please check your email for verification', 'Info');
  
  // Show success with default title
  showSuccess('Data saved successfully!');
  
  // Show info with default title
  showInfo('This feature is coming soon!');
};

// Example 7: Error handling in async functions
export const exampleAsyncErrorHandling = async () => {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    // The error will be handled globally
    handleApiError(error);
    throw error; // Re-throw if you want calling code to handle it
  }
};

// Helper function for example
const someOperation = async () => {
  throw new Error('Operation failed');
};

const fetchData = async () => {
  const response = await fetch('/api/data');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};
