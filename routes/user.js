const express = require('express');
const router = express.Router();
const {
  signup,
  signin,
  logout,
  forgotPassword,
  resetPassword,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
  adminAllUser,
  managerAllUser,
  admingetOneUser,
  adminUpdateOneUserDetails,
  adminDeleteOneUser,
} = require('../controller/userController');
const { isLoggedIn, customRole } = require('../middleware/user');

router.route('/signup').post(signup);
router.route('/signin').post(signin);
router.route('/logout').get(logout);
router.route('/forgotpassword').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);
router.route('/userdashboard').get(isLoggedIn, getLoggedInUserDetails);
router.route('/changepassword').post(isLoggedIn, changePassword);
router.route('/user/update').post(isLoggedIn, updateUserDetails);

//admin routes:
router.route('/admin/users').get(isLoggedIn, customRole('admin'), adminAllUser);
router
  .route('/admin/user/:id')
  .get(isLoggedIn, customRole('admin'), admingetOneUser);
router
  .route('/admin/user/:id')
  .post(isLoggedIn, customRole('admin'), adminUpdateOneUserDetails);
router
  .route('/admin/user/:id')
  .delete(isLoggedIn, customRole('admin'), adminDeleteOneUser);

//manager routes:
router
  .route('/manager/users')
  .get(isLoggedIn, customRole('manager'), managerAllUser);

module.exports = router;
