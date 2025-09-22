import axios from '@/config/axiosInstance';
import { API } from '@/config/apiEndpoints';

// Test function to verify transaction types API works
export const testTransactionTypesAPI = async () => {
  try {
    console.log('Testing transaction types API...');
    console.log('URL:', API.TRANSACTION_TYPES);

    // Make the API call exactly like your curl
    const response = await axios.get(API.TRANSACTION_TYPES);

    console.log('✅ Transaction Types API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Transaction Types API test failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
};

// You can call this from browser console: testTransactionTypesAPI()
(window as any).testTransactionTypesAPI = testTransactionTypesAPI;
