// Test function to verify transaction list API
import axios from 'axios';
import { API } from '@/config/apiEndpoints';

export async function testTransactionList() {
  try {
    console.log('🧪 Testing Transaction List API...');

    // Test basic transaction list
    console.log('\n1. Testing basic transaction list:');
    const basicResponse = await axios.get(API.TRANSACTION_INDEX);
    console.log('Basic response:', basicResponse.data);

    // Test with pagination
    console.log('\n2. Testing with pagination:');
    const paginatedResponse = await axios.get(`${API.TRANSACTION_INDEX}?page=1&limit=5`);
    console.log('Paginated response:', paginatedResponse.data);

    // Test with search
    console.log('\n3. Testing with search:');
    const searchResponse = await axios.get(`${API.TRANSACTION_INDEX}?search=test`);
    console.log('Search response:', searchResponse.data);

    // Test with filters
    console.log('\n4. Testing with filters:');
    const filteredResponse = await axios.get(`${API.TRANSACTION_INDEX}?status=true&paymentStatus=true`);
    console.log('Filtered response:', filteredResponse.data);

    // Test with all parameters
    console.log('\n5. Testing with all parameters:');
    const fullResponse = await axios.get(`${API.TRANSACTION_INDEX}?page=1&limit=10&search=test&status=true&paymentStatus=true&transactionType=UPLINK`);
    console.log('Full response:', fullResponse.data);

    console.log('\n✅ Transaction list API test completed!');
  } catch (error) {
    console.error('❌ Transaction list API test failed:', error);
  }
}

// Usage: Call this function in browser console
// testTransactionList();
