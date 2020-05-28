const _pageDefault = 1;
const _limitDefault = 10;
const _excludedFields = [
   'select',
   'sort',
   'page',
   'limit',
];

function modifyRequest(req) {
   let queryStr;
   const bootcamp = req.params.bootcampId;

   if (!req.query) {
      req.page = _pageDefault;
      req.limit = _limitDefault;
      req.start = 0;
      req.end = _limitDefault;
      req.sort = '-createdAt';
      if (bootcamp) req.query = { bootcamp };
   } else {
      if (bootcamp) req.query.bootcamp = bootcamp;

      const ourQuery = {...req.query};

      if (req.query.select) req.select = req.query.select.replace(/,/g, ' ');

      req.sort = req.query.sort
         ? req.query.sort.replace(/,/g, ' ')
         : '-createdAt';

      // NaN is falsey
      req.page = parseInt(req.query.page, 10) || _pageDefault;
      req.limit = parseInt(req.query.limit, 10) || _limitDefault;
      req.start = (req.page - 1) * req.limit;
      req.end = req.page * req.limit;

      _excludedFields.forEach(param => delete ourQuery[param]);

      queryStr = JSON.stringify(ourQuery);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

      req.query = JSON.parse(queryStr);
   }
}

async function getPagination({ query, start, end, page, limit }, model) {
   const pagination = {};
   const total = await model.countDocuments(query);

   if (start > 0) {
      pagination.prev = {
         page: page - 1,
         count: limit,
      };
   }

   if (end < total) {
      const count = Math.min(limit, (total - end));
      pagination.next = {
         page: page + 1,
         count,
      };
   }

   pagination.total = total;
   
   return pagination;
}

function advancedQuerying(model, populate) {
   return async function(req, res, next) {
      modifyRequest(req);

      let query = req.query
         ? model.find(req.query)
         : model.find();

      if (req.select) query = query.select(req.select);
      if (populate) query = query.populate(populate);

      const pagination = await getPagination(req, model);
      const results = await query
         .sort(req.sort)
         .skip(req.start)
         .limit(req.limit);

      res.results = {
         success: true,
         count: results.length,
         pagination,
         data: results
      };

       next();
   }
}

module.exports = advancedQuerying;