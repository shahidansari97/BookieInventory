// Test function to verify exact transaction creation API call
import axios from 'axios';

export async function testExactTransactionAPI() {
  try {
    console.log('🧪 Testing Exact Transaction Creation API...');

    // Exact payload from your curl command
    const exactPayload = {
      transactionTypeId: "68cac49d1ff8decd1908630a",
      profileId: "68d1034f95714fcb7b4e2e2c",
      toUserId: null,
      amount: 99999999999,
      ratePerPoint: 2,
      notes: "hello good tax",
      date: "22-09-25",
      status: true,
      paymentStatus: true
    };

    console.log('Exact Payload:', JSON.stringify(exactPayload, null, 2));

    // Test the exact API call
    const response = await axios.post('http://localhost:9000/api/v1/transaction/create', exactPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Y2Q0ODFkMmI0NmRjY2EzMThjYjJiMyIsImVtYWlsIjoiYm9va2llMUBtYWlsLmNvbSIsInJvbGUiOiIyIiwiaWF0IjoxNzU4MjkwODk2fQ.xfPjJ153d5tV3q129SiLXzz3QgYAl7M0r3f9LYztcVo'
      }
    });

    console.log('API Response:', response.data);
    console.log('\n✅ Exact transaction API test completed!');
  } catch (error) {
    console.error('❌ Exact transaction API test failed:', error);
  }
}

// Usage: Call this function in browser console
// testExactTransactionAPI();
