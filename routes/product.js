const express = require('express');
const router = express.Router();
const { isLoggedIn, customRole } = require('../middleware/user');
const {
  getAllProduct,
  addProduct,
  adminGetAllProduct,
  getSingleProduct,
  adminUpdateOneProduct,
  adminDeleteOneProduct,
  addReview,
  deleteReview,
  getOnlyReviewsForOneProduct,
} = require('../controller/productController.js');

//user routes:
router.route('/products').get(getAllProduct);
router.route('/product/:id').get(getSingleProduct);

//admin routes:
router
  .route('/admin/product/add')
  .post(isLoggedIn, customRole('admin'), addProduct);

router
  .route('/admin/products')
  .get(isLoggedIn, customRole('admin'), adminGetAllProduct);

router
  .route('/admin/product/:id')
  .put(isLoggedIn, customRole('admin'), adminUpdateOneProduct);

router
  .route('/admin/product/delete/:id')
  .delete(isLoggedIn, customRole('admin'), adminDeleteOneProduct);

//Product:
router.route('/product/review').put(isLoggedIn, addReview);
router.route('/product/review').delete(isLoggedIn, deleteReview);
router.route('/product/reviews').get(isLoggedIn, getOnlyReviewsForOneProduct);

module.exports = router;
