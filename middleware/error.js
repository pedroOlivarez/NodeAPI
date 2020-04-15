const ErrorResponse = require("../utils/errorResponse");

function errorHandler(err, req, res, next) {
   let error = { ...err };
   console.log(err.stack.red);

   if (err.name === "CastError") {
      const message = `${err.value} is not a valid Id`;
      error = new ErrorResponse(message, 400);
   }

   if (err.code && err.code === 11000) {
      const message = `Duplicate field value error. Error Message: ${err.errmsg}`;
      error = new ErrorResponse(message, 400);
   }

   if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
         .map(e => e.message)
         .join(". ");
      error = new ErrorResponse(message, 400);
   }

   if (err.statusCode === 404) {
      const message = err.message;
      error = new ErrorResponse(message, 404);
   }

   res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error",
   });
}

module.exports = errorHandler;
