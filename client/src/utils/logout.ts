import axios from '@/config/axiosInstance';
import { API } from '@/config/apiEndpoints';

export const logout = async (showSuccessMessage: boolean = true) => {
  try {
    // Get user token from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      if (userData.token) {
        // Call logout API exactly like your curl command
        // POST http://localhost:9000/api/v1/user/logout
        // Authorization: Bearer {token}
        await axios.post(API.LOGOUT, {}, {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Logout API called successfully');
      }
    }
  } catch (error) {
    // Log error but don't prevent logout
    console.warn('Logout API call failed:', error);
  } finally {
    // Clear ALL localStorage data
    localStorage.clear();
    
    // Redirect to login page
    window.location.href = '/login';
  }
};

export const clearUserData = () => {
  // Clear ALL localStorage data
  localStorage.clear();
};
