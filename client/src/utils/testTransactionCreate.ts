// Test function to verify transaction creation API payload
import axios from 'axios';
import { API } from '@/config/apiEndpoints';

export async function testTransactionCreate() {
  try {
    console.log('🧪 Testing Transaction Creation API...');

    // Test UPLINK transaction (toUserId: null) - matches your curl exactly
    const uplinkPayload = {
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

    console.log('UPLINK Transaction Payload:', uplinkPayload);

    // Test DOWNLINE transaction (toUserId: profileId)
    const downlinePayload = {
      transactionTypeId: "downline_type_id_here",
      profileId: "68d1034f95714fcb7b4e2e2c", // From Profile (UPLINK)
      toUserId: "downline_profile_id_here", // To Profile (DOWNLINE)
      amount: 50000,
      ratePerPoint: 1.5,
      notes: "DOWNLINE transaction",
      date: "22-09-25",
      status: true,
      paymentStatus: false
    };

    console.log('DOWNLINE Transaction Payload:', downlinePayload);

    // Uncomment to test actual API call
    // const response = await axios.post(API.TRANSACTION_CREATE, uplinkPayload);
    // console.log('API Response:', response.data);

    console.log('\n✅ Transaction creation test completed!');
  } catch (error) {
    console.error('❌ Transaction creation test failed:', error);
  }
}

// Usage: Call this function in browser console or component
// testTransactionCreate();
