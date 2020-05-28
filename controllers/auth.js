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