const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require(process.env.NODE_ENV === 'development' ? '../config/development' : '../config/production');

const razorpay = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID || 'rzp_live_SmwWeG1u2O6wdg',
    key_secret: config.RAZORPAY_KEY_SECRET || 'tr6VgUpY4mNiBIYFhyYyQ1eg',
});

exports.createOrder = async (amount, receipt) => {
    return razorpay.orders.create({
        amount: Math.round(amount * 100), // convert to paise
        currency: config.RAZORPAY_CURRENCY || 'INR',
        receipt,
    });
};

exports.fetchPayment = async (paymentId) => {
    return razorpay.payments.fetch(paymentId);
};

exports.verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, signature) => {
    const secret = config.RAZORPAY_KEY_SECRET || 'tr6VgUpY4mNiBIYFhyYyQ1eg';
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
    return expected === signature;
};

exports.getWebhookSecret = () =>
    config.RAZORPAY_WEBHOOK_SECRET || 'RazorpayWebhook#4uT8xP2mN7qLz9KsV5cD';

exports.verifyWebhookSignature = (rawBody, signature) => {
    const secret = config.RAZORPAY_WEBHOOK_SECRET || 'RazorpayWebhook#4uT8xP2mN7qLz9KsV5cD';
    const expected = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
    return expected === signature;
};

exports.initiateRefund = async (paymentId, amount) => {
    return razorpay.payments.refund(paymentId, {
        amount: Math.round(amount * 100),
    });
};
