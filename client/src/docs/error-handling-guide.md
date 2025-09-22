# Simple Error Handling Guide

## Quick Start

### 1. Import the hook
```typescript
import { useError } from '@/hooks/useError';
```

### 2. Use in your component
```typescript
function MyComponent() {
  const { handleApi, success, info } = useError();

  const handleSubmit = async () => {
    try {
      const response = await api.post('/endpoint', data);
      success('Data saved successfully!');
    } catch (error) {
      handleApi(error); // Auto-detects error type
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

## Available Methods

### `handleApi(error)` - Auto-detect error type
```typescript
try {
  await apiCall();
} catch (error) {
  handleApi(error); // Automatically shows appropriate error message
}
```

### `handle(error, type, customMessage)` - Specify error type
```typescript
try {
  await apiCall();
} catch (error) {
  handle(error, 'network', 'Custom network error message');
}
```

### `success(message, title?)` - Show success message
```typescript
success('Operation completed!');
success('Data saved!', 'Success');
```

### `info(message, title?)` - Show info message
```typescript
info('Please check your email');
info('Feature coming soon!', 'Info');
```

## Error Types

- `'network'` - Connection issues
- `'timeout'` - Request timeout
- `'validation'` - Form validation errors
- `'auth'` - Authentication errors
- `'server'` - Server errors
- `'unknown'` - Default fallback

## Examples

### API Call with Error Handling
```typescript
const fetchData = async () => {
  try {
    const response = await axios.get('/api/data');
    success('Data loaded successfully!');
    return response.data;
  } catch (error) {
    handleApi(error);
    return null;
  }
};
```

### Form Submission
```typescript
const handleFormSubmit = async (formData) => {
  try {
    await axios.post('/api/submit', formData);
    success('Form submitted successfully!');
  } catch (error) {
    if (error.response?.status === 422) {
      handle(error, 'validation');
    } else {
      handleApi(error);
    }
  }
};
```

### Custom Error Messages
```typescript
try {
  await sensitiveOperation();
} catch (error) {
  handle(error, 'auth', 'Please login to access this feature');
}
```

## Best Practices

1. **Use `handleApi(error)` for most cases** - it auto-detects error types
2. **Use `success()` and `info()` for positive feedback**
3. **Use `handle(error, type, message)` only when you need custom behavior**
4. **Always wrap API calls in try-catch blocks**
5. **Show success messages for important actions**

## Migration from Old System

Replace this:
```typescript
// Old way
toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive"
});
```

With this:
```typescript
// New way
const { handleApi } = useError();
handleApi(error);
```
