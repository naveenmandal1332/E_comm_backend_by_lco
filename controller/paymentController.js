const Razorpay = require('razorpay');
const bigPromise = require('../middleware/bigPromise.js');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.sendStripeKey = bigPromise(async (req, res, next) => {
  res.status(200).json({
    success: true,
    stripeKey: process.env.STRIPE_API_KEY,
  });
});

exports.captureStripePayment = bigPromise(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntent.create({
    amount: req.body.amount,
    currency: 'inr',

    //optional:
    metadata: { integration_check: 'accept_a_payment' },
  });

  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

exports.sendRazorpayKey = bigPromise(async (req, res, next) => {
  res.status(200).json({
    success: true,
    razorpayKey: process.env.Razorpay_API_KEY,
  });
});

exports.captureRazorpayPayment = bigPromise(async (req, res, next) => {
  let instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  let options = {
    amount: req.body.amount,
    currency: 'INR',
  };

  const myOrder = instance.orders.create(options);

  res.status(200).json({
    success: true,
    amount: req.body.amount,
    order: myOrder,
  });
});
