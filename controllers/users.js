const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const { status } = require('../enums/responseStatus');
const success = true;

// @desc    Register user
// @route   POST /api/v1/users
// @access  PRIVATE
// @roles   Admin
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

   await User.create({
      name,
      email,
      password,
      role,
   });

   const data = {
      name,
      email,
      role,
   }

   res
      .status(status.success.CREATED)
      .json({ success, data });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  PRIVAE
// @roles   ADMIN
exports.updateUser = asyncHandler(async(req, res, next) => {
});