const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { status } = require('../enums/responseStatus');
const success = true;

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   PUBLIC
exports.register = asyncHandler(async(req, res, next) => {
   const {
      name,
      email,
      password,
      role,
   } = req.body;

   const user = await User.create({
      name,
      email,
      password,
      role,
   });

   // Create token
   const data = user.getSignedJwtToken();

   res
      .status(status.success.CREATED)
      .json({ success, data });
});

//@desc     Sign in and get that web token
//@route    POST /api/v1/auth/authenticate
//@access   PUBLIC
exports.authenticate = asyncHandler(async(req, res, next) => {
   let resStatus;
   let response = { success };
   const { email, password } = req.body;

   if (!email || !password) {
      const errResponse = new ErrorResponse('Please prove and email and a password', status.error.BAD_REQUEST);
      return next(errResponse);
   }

   const user = await User
      .findOne({ email })
      .select('_id role +password');

   if (!user) {
      const errResponse = new ErrorResponse('Invalid Credentials', status.error.UNAUTHORIZED);
      return next(errResponse);
   }

   if(await user.validatePassword(password)) {
      response.token = user.getSignedJwtToken();
      resStatus = status.success.OK;
   } else {
      response.success = false;
      response.message = 'Invalid Credentials'
      resStatus = status.error.UNAUTHORIZED;
   }

   res
      .status(resStatus)
      .json(response);
})