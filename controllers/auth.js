const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { status } = require('../enums/responseStatus');
const success = true;

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   PUBLIC
exports.register = asyncHandler(async(req, res, next) => {
   console.log('pedro');
   const data = {
      token: 'Pedro is cool'
   };
   res.status(status.success.CREATED).json({ success, data });
});