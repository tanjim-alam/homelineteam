// Test script to verify error handling in return request
const fetch = require('node-fetch');

async function testErrorHandling() {
    try {
        console.log('Testing error handling for return request...');

        // Test with invalid data to trigger the "Return request already exists" error
        const response = await fetch('http://localhost:5000/api/returns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid-token' // This will cause authentication error
            },
            body: JSON.stringify({
                orderId: 'invalid-order-id',
                type: 'return',
                items: []
            })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const data = await response.json();
        console.log('Response data:', data);

        if (data.message) {
            console.log('✅ Error message extracted successfully:', data.message);
        } else {
            console.log('❌ No error message found in response');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testErrorHandling();


