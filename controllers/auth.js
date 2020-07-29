const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const { status } = require('../enums/responseStatus');
const success = true;


// @desc     Sign in and get that web token
// @route    POST /api/v1/auth/authenticate
// @access   PUBLIC
exports.authenticate = asyncHandler(async(req, res, next) => {
   const { email, password } = req.body;

   if (!email || !password) {
      const errResponse = new ErrorResponse('Please provide an email and a password', status.error.BAD_REQUEST);
      return next(errResponse);
   }

   const user = await User
      .findOne({ email })
      .select('_id role +password');

   if (!user || !await user.validatePassword(password)) {
      const errResponse = new ErrorResponse('Invalid credentials', status.error.UNAUTHORIZED);
      return next(errResponse);
   }
   
   sendTokenResponse(user, status.success.OK, res);
});

// @desc     Get current logged in user
// @route    POST /api/v1/auth/me
// @access   PRIVATE
exports.getLoggedInUser = asyncHandler(async(req, res, next) => {
   const user = await User.findById(req.user.id);

   res
      .status(status.success.OK)
      .json({
         success,
         data: user,
      });
})

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgot-password
// @access  PUBLIC
exports.forgotPassword = asyncHandler(async(req, res, next) => {
   const { email } = req.body;

   const user = await User.findOne({ email });

   if (!user) {
      const errResponse = (new ErrorResponse('No user found with this email', status.error.NOT_FOUND));
      return next(errResponse);
   }

   const resetToken = user.getResetPasswordToken();

   await user.save();

   const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
   const text = `You are receivign this email because you (or someone else) has requested to reset the password for Pedro's awesome devCamper API which utilizes mongoDB.\nTo complete the reset, make a PUT request to :\n\n${resetUrl}`;
   const subject = 'Reset password';
   const options = {
      to: email,
      subject,
      text,
   };

   try {
      await sendEmail(options);
   } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      const errResponse = new ErrorResponse(`Error sending password reset email to ${email}`, status.error.SERVER_ERROR);
      return next(errResponse);
   }

   res
      .status(status.success.OK)
      .json({ success });
});

// @desc    Reset Password
// @route   PUT /api/v1/auth/reset-password/:resetToken
// @access  PUBLIC
exports.resetPassword = asyncHandler(async(req, res, next) => {
   const { resetToken } = req.params;
   const newPassword = req.body.password;
   let errResponse;
   const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

   const userQuery = {
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
   }

   const user = await User
      .findOne(userQuery)
      .select('+password');

   if (!user) {
      errResponse = new ErrorResponse('Invalid reset token', status.error.BAD_REQUEST);
   } else if (await user.validatePassword(newPassword)) {
      errResponse = new ErrorResponse('New password cannot be the same as the old password', status.error.BAD_REQUEST);
   }

   if (errResponse) return next(errResponse);

   user.password = newPassword;
   user.resetPasswordToken = undefined;
   user.resetPasswordExpire = undefined;

   await user.save();

   res
      .status(status.success.OK)
      .json({
         success,
         message: 'Password successfully reset'
      });
});

// @desc    Update Password
// @route   PUT /api/v1/auth/update-password
// @access  PRIVATE
exports.updatePassword = asyncHandler(async(req, res, next) => {
   const { email, password, newPassword } = req.body;
   let errResponse;

   if (!email || !password) {
      const errResponse = new ErrorResponse('Please provide an email and a password', status.error.BAD_REQUEST);
      return next(errResponse);
   }

   const user = await User
      .findOne({ email })
      .select('+password');

   if (!user
      || user._id.toString() !== req.user.id
      || !await user.validatePassword(password)) {
      errResponse = new ErrorResponse('Invalid credentials', status.error.UNAUTHORIZED);
   } else if (newPassword === password) {
      errResponse = new ErrorResponse('New password cannot be the same as old password.', status.error.BAD_REQUEST);
   }

   if (errResponse) return next(errResponse);

   user.password = newPassword;

   await user.save();

   res
      .status(status.success.OK)
      .json({ success });
   
});

function sendTokenResponse(user, statusCode, res) {
   const token = user.getSignedJwtToken();

   const options = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 60 * 1000),
      httpOnly: true,
   }

   if (process.env.NODE_ENV === 'production') options.secure = true;

   res
      .status(statusCode)
      .cookie('token', token, options)
      .json({ success, token });
}