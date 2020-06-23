const ErrorResponse = require('../utils/errorResponse');
const { status } = require('../enums/responseStatus');

function errorHandler(err, req, res, next) {
   let error = { ...err };
   let message, statusCode;
   console.log(err.stack.red);

   if (err.name === 'CastError') {
      message = `${err.value} is not a valid Id`;
      statusCode = status.error.BAD_REQUEST;
   } else if (err.name === 'ValidationError') {
      message = Object.values(err.errors)
         .map(e => e.message)
         .join('||');
      statusCode = status.error.BAD_REQUEST;
   } else if (err.code === 11000) {
      message = `Duplicate field value error. Error Message: ${err.errmsg}`;
      statusCode = status.error.BAD_REQUEST;
   } else if (err.statusCode === status.error.NOT_FOUND) {
      message = err.message;
      statusCode = status.error.NOT_FOUND;
   } else {
      message = err.message;
      statusCode = err.statusCode;
   }

   error = new ErrorResponse(message, statusCode);

   res
      .status(error.statusCode || status.error.SERVER_ERROR)
      .json({
         success: false,
         message: error.message || 'Server error',
      });
}

module.exports = errorHandler;
