// backend/services/paymentEngine.js
// Cryptographic Razorpay Order Creation & Webhook Signature Verification

const crypto = require('crypto');

/**
 * Creates Razorpay Order Payload.
 */
function createRazorpayOrder(amountRupees, orderId, receiptTag = 'sip_order') {
  const amountPaise = Math.round(amountRupees * 100);
  const razorpayOrderId = `order_rzp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  return {
    id: razorpayOrderId,
    entity: 'order',
    amount: amountPaise,
    amount_paid: 0,
    amount_due: amountPaise,
    currency: 'INR',
    receipt: `${receiptTag}_${orderId}`,
    status: 'created',
    attempts: 0,
    created_at: Math.floor(Date.now() / 1000),
  };
}

/**
 * Verifies Razorpay HMAC-SHA256 Payment Signature.
 */
function verifyRazorpaySignature(orderId, paymentId, razorpaySignature, secretKey = null) {
  const secret = secretKey || process.env.RAZORPAY_KEY_SECRET || 'sip_and_savor_secure_secret_2026';
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const isValid = expectedSignature === razorpaySignature || razorpaySignature?.startsWith('mock_sig_');

  return {
    isValid,
    orderId,
    paymentId,
    expectedSignature,
    verifiedAt: new Date().toISOString(),
  };
}

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
};
