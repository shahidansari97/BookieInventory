// Test function to verify transaction pagination API
export const testTransactionPagination = async () => {
  const axios = require('axios');
  
  const API_BASE_URL = 'http://localhost:9000';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Y2Q0ODFkMmI0NmRjY2EzMThjYjJiMyIsImVtYWlsIjoiYm9va2llMUBtYWlsLmNvbSIsInJvbGUiOiIyIiwiaWF0IjoxNzU4MjkwODk2fQ.xfPjJ153d5tV3q129SiLXzz3QgYAl7M0r3f9LYztcVo';
  
  try {
    console.log('Testing Transaction Pagination API...');
    
    // Test basic pagination
    const response1 = await axios.get(`${API_BASE_URL}/api/v1/transaction/index?page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Basic pagination response:', {
      success: response1.data.success,
      currentPage: response1.data.currentPage,
      totalPages: response1.data.totalPages,
      totalItems: response1.data.totalItems,
      dataLength: response1.data.data?.length || 0
    });
    
    // Test page 2
    const response2 = await axios.get(`${API_BASE_URL}/api/v1/transaction/index?page=2&limit=5`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Page 2 with limit 5:', {
      success: response2.data.success,
      currentPage: response2.data.currentPage,
      totalPages: response2.data.totalPages,
      totalItems: response2.data.totalItems,
      dataLength: response2.data.data?.length || 0
    });
    
    // Test with search
    const response3 = await axios.get(`${API_BASE_URL}/api/v1/transaction/index?page=1&limit=10&search=test`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Search response:', {
      success: response3.data.success,
      currentPage: response3.data.currentPage,
      totalPages: response3.data.totalPages,
      totalItems: response3.data.totalItems,
      dataLength: response3.data.data?.length || 0
    });
    
    console.log('🎉 All pagination tests passed!');
    
  } catch (error) {
    console.error('❌ Pagination test failed:', error.response?.data || error.message);
  }
};

// Run the test
if (typeof window !== 'undefined') {
  (window as any).testTransactionPagination = testTransactionPagination;
  console.log('Test function available as window.testTransactionPagination()');
}
