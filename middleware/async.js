const excludedFields = [
   'select',
   'sort'
];

function asyncHandler(fn) {
   return function (req, res, next) {
      if (req.query) {
         let queryStr;
         const ourQuery = {...req.query};

         excludedFields.forEach(param => delete ourQuery[param]);

         queryStr = JSON.stringify(ourQuery);
         queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

         if (req.query.select) req.select = req.query.select.replace(/,/g, ' ');

         if(req.query.sort) req.sort = req.query.sort.replace(/,/g, ' ');
         else req.sort = '-createdAt';
         
         req.query = JSON.parse(queryStr);
      }
      return Promise.resolve(fn(req, res, next)).catch(next);
   };
}

module.exports = asyncHandler;
