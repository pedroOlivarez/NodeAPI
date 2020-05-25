const excludedFields = [
   'select',
   'sort',
   'page',
   'limit',
];

const _pageDefault_ = 1;
const _limitDefault_ = 10;

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

         req.page = parseInt(req.query.page, 10) || _pageDefault_;
         req.limit = parseInt(req.query.limit, 10) || _limitDefault_;
         req.start = (req.page - 1) * req.limit;
         req.end = req.page * req.limit;
         req.query = JSON.parse(queryStr);
      }
      return Promise.resolve(fn(req, res, next)).catch(next);
   };
}

module.exports = asyncHandler;
