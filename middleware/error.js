const ErrorResponse = require("../utils/errorResponse");

function errorHandler(err, req, res, next) {
   let error = { ...err };
   console.log(err.stack.red);

   if (err.name === "CastError") {
      const message = `${err.value} is not a valid Id`;
      error = new ErrorResponse(message, 400);
   }
   res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error"
   });
}

module.exports = errorHandler;
