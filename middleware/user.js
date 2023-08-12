const bigPromise = require('./bigPromise');
const CustomError = require('../utils/errorHandling.js');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

//LoggedIn check:
exports.isLoggedIn = bigPromise(async (req, res, next) => {
  //get token:
  const token =
    req.cookies.token || req.header('Authorization').replace('Bearer ', '');

  //if token is not present:
  if (!token) {
    return next(new CustomError('Login first to access this page', 401));
  }

  //decode to get the user info:
  const decode = jwt.verify(token, process.env.SECRETE_KEY);
  req.user = await User.findById(decode.id);

  next();
});

//custom role:
exports.customRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError('You are not allowed for this resource', 403)
      );
    }
    next();
  };
};
