const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const { status } = require('../enums/responseStatus');
const { roles } = require('../enums/roles');
const success = true;

// @desc     Register user
// @route    POST /api/v1/auth/register
// @access   PUBLIC
exports.register = asyncHandler(async(req, res, next) => {
   const { password } = req.body;
   let {
      name,
      email,
      role,
   } = req.body;

   if (name) name = name.trim();
   if (email) email = email.toLowerCase().trim();
   if (role) role = role.toLowerCase().trim();

   if (role === roles.ADMIN && req.user.role !== roles.ADMIN) {
      const errResponse = new ErrorResponse('Only an admin can register another admin.', status.error.UNAUTHORIZED);
      return next(errResponse);
   }

   const user = await User.create({
      name,
      email,
      password,
      role,
   });

   const data = {
      name,
      email,
      role: user.role,
   }

   res
      .status(status.success.CREATED)
      .json({ success, data });
});

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

   if (!user) {
      const errResponse = new ErrorResponse('Invalid credentials', status.error.UNAUTHORIZED);
      return next(errResponse);
   }

   if (!await user.validatePassword(password)) {
      const errResponse = new ErrorResponse('Invalid credentials', status.error.UNAUTHORIZED);
      return next(errResponse);
   } else sendTokenResponse(user, status.success.OK, res);
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
// @route   POST /api/v1/auth/forgotPassword
// @access  PUBLIC
exports.forgotPassword = asyncHandler(async(req, res, next) => {
   const { email } = req.body;
   const validateBeforeSave = false;

   const user = await User.findOne({ email });

   if (!user) {
      const errResponse = (new ErrorResponse('No user found with this email', status.error.NOT_FOUND));
      return next(errResponse);
   }

   const resetToken = user.getResetPasswordToken();

   await user.save({ validateBeforeSave });

   const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${resetToken}`;
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
      await user.save({ validateBeforeSave });
      const errResponse = new ErrorResponse(`Error sending password reset email to ${email}`, status.error.SERVER_ERROR);
      return next(errResponse);
   }

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