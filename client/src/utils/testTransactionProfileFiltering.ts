// Test function to verify transaction profile filtering logic
import axios from 'axios';
import { API } from '@/config/apiEndpoints';

export async function testTransactionProfileFiltering() {
  try {
    console.log('🧪 Testing Transaction Profile Filtering...');

    // Test 1: Get UPLINK profiles
    console.log('\n1. Testing UPLINK profiles:');
    const uplinkResponse = await axios.post(API.PROFILE_BY_TRANSACTION_TYPE, {
      transactionTypeId: "68cac49d1ff8decd1908630a" // UPLINK ID
    });
    console.log('UPLINK profiles:', uplinkResponse.data);

    // Test 2: Get DOWNLINE profiles (if they exist)
    console.log('\n2. Testing DOWNLINE profiles:');
    try {
      const downlineResponse = await axios.post(API.PROFILE_BY_TRANSACTION_TYPE, {
        transactionTypeId: "downline_id_here" // Replace with actual DOWNLINE ID
      });
      console.log('DOWNLINE profiles:', downlineResponse.data);
    } catch (error) {
      console.log('DOWNLINE profiles not found or error:', error);
    }

    console.log('\n✅ Profile filtering test completed!');
  } catch (error) {
    console.error('❌ Profile filtering test failed:', error);
  }
}

// Usage: Call this function in browser console or component
// testTransactionProfileFiltering();
