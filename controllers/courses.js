const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc Get all courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler(async(req, res, next) => {
   const bootcamp = req.params.bootcampId;
   const query =
            bootcamp
               ? Course.find({ bootcamp })
               : Course.find();

   const courses = await query;

   res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
   });
});