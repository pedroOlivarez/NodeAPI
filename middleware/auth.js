const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const { status } = require('../enums/responseStatus');

exports.protect = asyncHandler(async (req, res, next) => {
   let token;
   const { authorization } = req.headers;
   if (authorization && authorization.startsWith('Bearer')) {
      token = authorization.split(' ')[1];
   } else if (req.cookies.token) token = req.cookies.token;
   
   if (!token) {
      const errResponse = new ErrorResponse('Not authorized', status.error.UNAUTHORIZED);
      return next(errResponse);
   }

   try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decodedToken.id);
      next();
   } catch {
      const errResponse = new ErrorResponse('Not authorized', status.error.UNAUTHORIZED);
      next(errResponse);
   }
});

exports.authorizeRoles = (...roles) => {
   return (req, res, next) => {
      if(!roles.includes(req.user.role)) {
         const errResponse = new ErrorResponse(`User role: '${req.user.role}' is not authorized to access this resource`, status.error.FORBIDDEN);
         return next(errResponse);
      } next();
   }
}