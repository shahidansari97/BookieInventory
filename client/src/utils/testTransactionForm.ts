// Test function to debug transaction form submission
export function testTransactionForm() {
  console.log('🧪 Testing Transaction Form...');
  
  // Test form values
  const testValues = {
    transactionTypeId: "68cac49d1ff8decd1908630a",
    profileId: "68d1034f95714fcb7b4e2e2c",
    toProfileId: "",
    toUserId: null,
    date: "22-09-25",
    amount: 99999999999,
    ratePerPoint: 2,
    notes: "hello good tax",
    status: true,
    paymentStatus: true,
  };
  
  console.log('Test values:', testValues);
  
  // Test validation
  const requiredFields = ['transactionTypeId', 'profileId', 'date', 'amount', 'ratePerPoint', 'status', 'paymentStatus'];
  const missingFields = requiredFields.filter(field => !testValues[field as keyof typeof testValues]);
  
  if (missingFields.length > 0) {
    console.error('❌ Missing required fields:', missingFields);
  } else {
    console.log('✅ All required fields present');
  }
  
  // Test date format
  const dateRegex = /^\d{2}-\d{2}-\d{2}$/;
  if (!dateRegex.test(testValues.date)) {
    console.error('❌ Date format invalid:', testValues.date);
  } else {
    console.log('✅ Date format valid');
  }
  
  // Test amount
  if (testValues.amount < 1 || testValues.amount > 99999999999) {
    console.error('❌ Amount out of range:', testValues.amount);
  } else {
    console.log('✅ Amount valid');
  }
  
  // Test rate
  if (testValues.ratePerPoint < 0.01 || testValues.ratePerPoint > 999999) {
    console.error('❌ Rate out of range:', testValues.ratePerPoint);
  } else {
    console.log('✅ Rate valid');
  }
  
  console.log('✅ Transaction form test completed!');
}

// Usage: Call this function in browser console
// testTransactionForm();
