const express = require('express');
const router = express.Router();
const {
  sendStripeKey,
  sendRazorpayKey,
  captureStripePayment,
  captureRazorpayPayment,
} = require('../controller/paymentController.js');
const { isLoggedIn } = require('../middleware/user');

router.route('/stripekey').get(isLoggedIn, sendStripeKey);
router.route('/razorpaykey').get(isLoggedIn, sendRazorpayKey);

router.route('/capturestripe').post(isLoggedIn, captureStripePayment);
router.route('/capturerazorpay').post(isLoggedIn, captureRazorpayPayment);

module.exports = router;
