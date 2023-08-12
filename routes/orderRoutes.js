const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOneOrder,
  getLoggedOrder,
  admingetOrders,
  adminUpdateOrder,
  adminDeleteOrder,
} = require('../controller/orderController.js');
const { isLoggedIn, customRole } = require('../middleware/user.js');

router.route('/order/create').post(isLoggedIn, createOrder);
router.route('/order/orderInfo/:id').get(isLoggedIn, getOneOrder);
router.route('/order').get(isLoggedIn, getLoggedOrder);

//admin routes:
router
  .route('/admin/orders')
  .get(isLoggedIn, customRole('admin'), admingetOrders);

router
  .route('/admin/order/:id')
  .put(isLoggedIn, customRole('admin'), adminUpdateOrder);

router
  .route('/admin/order/:id')
  .delete(isLoggedIn, customRole('admin'), adminDeleteOrder);

module.exports = router;
