import axios from '@/config/axiosInstance';
import { API } from '@/config/apiEndpoints';

// Test function to verify logout API works
export const testLogoutAPI = async () => {
  try {
    // Get user token from localStorage
    const user = localStorage.getItem("user");
    if (!user) {
      console.error('No user data found in localStorage');
      return false;
    }

    const userData = JSON.parse(user);
    if (!userData.token) {
      console.error('No token found in user data');
      return false;
    }

    console.log('Testing logout API with token:', userData.token.substring(0, 20) + '...');

    // Make the API call exactly like your curl
    const response = await axios.post(API.LOGOUT, {}, {
      headers: {
        'Authorization': `Bearer ${userData.token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Logout API response:', response.data);
    return true;
  } catch (error) {
    console.error('Logout API test failed:', error);
    return false;
  }
};

// You can call this from browser console: testLogoutAPI()
(window as any).testLogoutAPI = testLogoutAPI;
