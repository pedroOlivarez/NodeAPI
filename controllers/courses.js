const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc Get all courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler(async(req, res, next) => {
   const bootcamp = req.params.bootcampId;
   let query =
            bootcamp
               ? Course.find({ bootcamp })
               : Course.find();
   query = query.populate({
      path: 'bootcamp',
      select: 'name description',
   });
   const courses = await query;

   res
      .status(200)
      .json({
         success: true,
         count: courses.length,
         data: courses,
      });
});

// @desc Get a single course
// @route GET /api/v1/courses/:id
// @access Public
exports.getCourse = asyncHandler(async(req, res, next) => {
   const course = await Course
      .findById(req.params.id)
      .populate({
         path: 'bootcamp',
         select: 'name description',
      });
   
   if (!course) {
      const errorResponse = new ErrorResponse(`No course found with the id of ${req.params.id}`, 404);
      return next(errorResponse);
   }

   res
      .status(200)
      .json({
         success: true,
         data: course,
      });
});

// @desc Add a course
// @route POST /api/v1/bootcamps/:bootcampId/courses/
// @access Private
exports.addCourse = asyncHandler(async(req, res, next) => {
   req.body.bootcamp = req.params.bootcampId;
   
   const bootcamp = await Bootcamp.findById(req.params.bootcampId);

   if (!bootcamp) {
      const errorResponse = new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404);
      return next(errorResponse);
   }

   const course = await Course.create(req.body);

   res
      .status(201)
      .json({
         success: true,
         data: course,
      });
});

// @desc Update a course
// @route PUT /api/v1/courses/:id
// @access Private
exports.updateCourse = asyncHandler(async(req, res, next) => {
   let course = await Course.findById(req.params.id);
   
   if (!course) {
      const errorResponse = new ErrorResponse(`No course found with the id of ${req.params.id}`, 404);
      return next(errorResponse);
   }

   course = await Course
      .findByIdAndUpdate(
         req.params.id,
         req.body, 
         {  new: true, runValidators: true, }
      ); 

   res
      .status(200)
      .json({
         success: true,
         data: course,
      });
});

// @desc Delete a course
// @route DELETE /api/v1/courses/:id
// @access Private
exports.deleteCourse = asyncHandler(async(req, res, next) => {
   const course = await Course.findById(id);
   
   if (!course) {
      const errorResponse = new ErrorResponse(`No course found with the id of ${req.params.id}`, 404);
      return next(errorResponse);
   }

   await course.remove()

   res
      .status(200)
      .json({
         success: true,
         data: course,
      });
});