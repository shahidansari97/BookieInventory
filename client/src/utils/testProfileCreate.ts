import axios from '@/config/axiosInstance';
import { API } from '@/config/apiEndpoints';

// Test function to verify profile creation API works
export const testProfileCreateAPI = async () => {
  try {
    console.log('Testing profile creation API...');
    console.log('URL:', API.PROFILE_CREATE);

    // Test data matching your curl example
    const testData = {
      transactionTypeId: "68cac49d1ff8decd1908630a",
      name: "Test Profile",
      email: "test@mail.com",
      country_code: "+91",
      phone: "9854784784", // Separate phone number
      notes: "Test profile creation",
      status: true
    };

    console.log('Test data:', testData);

    // Make the API call exactly like your curl
    const response = await axios.post(API.PROFILE_CREATE, testData);

    console.log('✅ Profile Creation API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Profile Creation API test failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
};

// You can call this from browser console: testProfileCreateAPI()
(window as any).testProfileCreateAPI = testProfileCreateAPI;
