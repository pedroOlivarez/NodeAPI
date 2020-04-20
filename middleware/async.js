function asyncHandler(fn) {
   return function (req, res, next) {
      if (req.query) {
         let queryStr = JSON.stringify(req.query);
         queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
         req.query = JSON.parse(queryStr);
      }
      return Promise.resolve(fn(req, res, next)).catch(next);
   };
}

module.exports = asyncHandler;
