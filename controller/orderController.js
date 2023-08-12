const Order = require('../models/order.js');
const Product = require('../models/product.js');
const bigPromise = require('../middleware/bigPromise.js');
const CustomError = require('../utils/errorHandling.js');

exports.createOrder = bigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOneOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (!order) return next(new CustomError('Please check order id', 401));

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getLoggedOrder = bigPromise(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) return next(new CustomError('Please check order id', 401));

  res.status(200).json({
    success: true,
    order,
  });
});

exports.admingetOrders = bigPromise(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === 'Delivered')
    return next(new CustomError('Order is already marked for delivered', 401));

  order.orderStatus = req.body.orderStatus;

  order.orderItems.forEach(async (prod) => {
    await updateProductStock(prod.product, prod.quantity);
  });

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

exports.adminDeleteOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  await order.deleteOne();

  res.status(200).json({
    success: true,
  });
});

//stock upadate method:
async function updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);

  if (product.stock < quantity) throw new Error('Out of stock');
  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
}
