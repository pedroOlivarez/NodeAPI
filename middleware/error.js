const ErrorResponse = require("../utils/errorResponse");

function errorHandler(err, req, res, next) {
   let error = { ...err };
   let message, statusCode;
   console.log(err.stack.red);

   if (err.name === "CastError") {
      message = `${err.value} is not a valid Id`;
      statusCode = 400;
   } else if (err.name === "ValidationError") {
      message = Object.values(err.errors)
         .map(e => e.message)
         .join("||");
      statusCode = 400;
   } else if (err.code === 11000) {
      message = `Duplicate field value error. Error Message: ${err.errmsg}`;
      statusCode = 400;
   } else if (err.statusCode === 404) {
      message = err.message;
      statusCode = 404;
   } else {
      message = err.message;
      statusCode = err.statusCode;
   }

   error = new ErrorResponse(message, statusCode);

   res
      .status(error.statusCode || 500)
      .json({
         success: false,
         message: error.message || "Server error",
      });
}

module.exports = errorHandler;
