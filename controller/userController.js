const bigPromise = require('../middleware/bigPromise.js');
const CustomError = require('../utils/errorHandling.js');
const User = require('../models/user.js');
const cookieToken = require('../utils/cookieToken.js');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');
const mailHelper = require('../utils/nodeMailer.js');
const crypto = require('crypto');
const user = require('../models/user.js');

//Signup:
exports.signup = bigPromise(async (req, res, next) => {
  //handle image:
  if (!req.files) {
    return next(new CustomError('photo is required for signup', 400));
  }
  let file = req.files.photo;
  const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: 'user',
    width: 150,
    crop: 'scale',
  });

  const { name, email, password } = req.body;
  if (!email || !name || !password) {
    return next(new CustomError('Name, email and password are required!', 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  //return cookie after successfull creation of user:
  cookieToken(user, res);
});

//Signin:
exports.signin = bigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  //Check all input field:
  if (!email || !password) {
    return next(new CustomError('Email and password are required field!', 400));
  }

  //get user from db:
  const user = await User.findOne({ email }).select('+password');

  //if user do not present in db:
  if (!user) {
    return next(new CustomError('You are not registered!', 400));
  }

  //match password:
  const isPasswordCorrect = await user.isValidatedPassword(password);

  //when password is wrong:
  if (!isPasswordCorrect) {
    return next(new CustomError('Wrong! Email or Password', 400));
  }

  //return cookies:
  cookieToken(user, res);
});

//signout:
exports.logout = bigPromise(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    http: true,
  });

  res.status(200).json({
    success: true,
    message: 'You are Logout Successfully!',
  });
});

//forgot password:
exports.forgotPassword = bigPromise(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new CustomError('Email not exist!', 400));
  }

  //get forgot token:
  const forgotToken = user.getForgotPasswordToken();
  await user.save({ validateBeforeSave: false });

  const myUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/password/reset/${forgotToken}`;

  const message = `Copy paste this link in your browser and hit enter \n\n ${myUrl}`;

  try {
    await mailHelper({
      email: user.email,
      subject: 'Password reset email',
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully!',
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
  }
});

//reset password:
exports.resetPassword = bigPromise(async (req, res, next) => {
  const token = req.params.token;
  const forgotPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError('Token invalid or expired!', 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new CustomError('Password do not match!', 400));
  }

  user.password = req.body.newPassword;

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  //send a json response:
  cookieToken(user, res);
});

//LoggedIn User Details:
exports.getLoggedInUserDetails = bigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//change password:
exports.changePassword = bigPromise(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId).select('+password');
  const isCorrectPassword = await user.isValidatedPassword(
    req.body.oldPassword
  );

  if (!isCorrectPassword) {
    return next(new CustomError('Old password is incorrect!', 400));
  }

  user.password = req.body.newPassowrd;
  await user.save();
  cookieToken(user, res);
});

//update user Info:
exports.updateUserDetails = bigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.files) {
    const user = await User.findById(req.user.id);
    const imageId = user.photo.id;

    //delete the photo on cloudinary:
    const resp = await cloudinary.v2.uploader.destroy(imageId);

    //upload new photo:
    let file = req.files.photo;
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: 'user',
      width: 150,
      crop: 'scale',
    });
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
  });
});

//admin:
exports.adminAllUser = bigPromise(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

exports.admingetOneUser = bigPromise(async (req, res, next) => {
  const users = await User.findById(req.params.id);

  if (!users) {
    next(new CustomError('No user found', 400));
  }

  res.status(200).json({
    success: true,
    users,
  });
});

exports.adminUpdateOneUserDetails = bigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  if (req.files) {
    const user = await User.findById(req.params.id);
    const imageId = user.photo.id;

    //delete the photo on cloudinary:
    const resp = await cloudinary.v2.uploader.destroy(imageId);

    //upload new photo:
    let file = req.files.photo;
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: 'user',
      width: 150,
      crop: 'scale',
    });
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
  });
});

exports.adminDeleteOneUser = bigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new CustomError('No such user found', 401));

  const imageId = user.photo.id;
  await cloudinary.v2.uploader.destroy(imageId);
  await user.deleteOne();

  res.status(200).json({
    success: true,
  });
});

//manager:
exports.managerAllUser = bigPromise(async (req, res, next) => {
  const users = await User.find({ role: 'user' });

  res.status(200).json({
    success: true,
    users,
  });
});
