var bcrypt = require('bcryptjs');
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
   const user = await User
      .findOne({ email })
      .select('_id email +password');

   if (!user) {
      const errResponse = new ErrorResponse(`${email} is not a registered email address`, status.error.NOT_FOUND);
      return next(errResponse);
   }

   if(bcrypt.compareSync(password, user.password)) {
      response.data = user.getSignedJwtToken();
      resStatus = status.success.OK;
   } else {
      response.success = false;
      response.data = 'incorrect password for user'
      resStatus = status.error.BAD_REQUEST;
   }

   res
      .status(resStatus)
      .json(response);

})