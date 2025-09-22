const axios = require('axios');

async function testOrderAPI() {
    try {
        console.log('Testing Order API...');

        // Test getting all orders (admin endpoint)
        const response = await axios.get('http://localhost:5000/api/orders', {
            headers: {
                'Authorization': 'Bearer your-admin-token-here' // You'll need to replace this
            }
        });

        console.log('Orders found:', response.data.length);
        console.log('Sample order:', response.data[0]);

    } catch (error) {
        console.error('Error testing API:', error.response?.data || error.message);
    }
}

testOrderAPI();


