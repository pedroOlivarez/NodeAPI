const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { status } = require('../enums/responseStatus');
const { roles } = require('../enums/roles');
const success = true;

// @desc Get all courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler(async(req, res, next) => res.status(status.success.OK).json(res.results));

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
      const errorResponse = new ErrorResponse(`No course found with the id of ${req.params.id}`, status.error.NOT_FOUND);
      return next(errorResponse);
   }

   res
      .status(status.success.OK)
      .json({
         success,
         data: course,
      });
});

// @desc Add a course
// @route POST /api/v1/bootcamps/:bootcampId/courses/
// @access Private
exports.addCourse = asyncHandler(async(req, res, next) => {
   req.body.bootcamp = req.params.bootcampId;
   req.body.user = req.user.id;
   
   const bootcamp = await Bootcamp.findById(req.params.bootcampId);
   let errResponse;

   if (!bootcamp) {
      errResponse = new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, status.error.NOT_FOUND);
   } else if (req.user.role !== roles.ADMIN && bootcamp.user.toString() !== req.user.id) {
      errResponse = new ErrorResponse('User is not authorized to add a course to this bootcamp.', status.error.UNAUTHORIZED);
   }

   if (errResponse) return next(errResponse);

   const course = await Course.create(req.body);

   res
      .status(status.success.CREATED)
      .json({
         success,
         data: course,
      });
});

// @desc Update a course
// @route PUT /api/v1/courses/:id
// @access Private
exports.updateCourse = asyncHandler(async(req, res, next) => {
   let course = await Course.findById(req.params.id);
   let errResponse;
   
   if (!course) {
      errResponse = new ErrorResponse(`No course found with the id of ${req.params.id}`, status.error.NOT_FOUND);
   } else if (req.user.role !== roles.ADMIN && course.user.toString() !== req.user.id) {
      errResponse = new ErrorResponse('User not authorized to update this course.', status.error.UNAUTHORIZED);
   }

   if (errResponse) return next(errResponse);

   course = await Course
      .findByIdAndUpdate(
         req.params.id,
         req.body, 
         {  new: true, runValidators: true, }
      ); 

   res
      .status(status.success.OK)
      .json({
         success,
         data: course,
      });
});

// @desc Delete a course
// @route DELETE /api/v1/courses/:id
// @access Private
exports.deleteCourse = asyncHandler(async(req, res, next) => {
   const course = await Course.findById(req.params.id);
   let errResponse;
   
   if (!course) {
      errResponse = new ErrorResponse(`No course found with the id of ${req.params.id}`, status.error.NOT_FOUND);
   } else if (req.user.role !== roles.ADMIN && course.user.toString() !== req.user.id) {
      errResponse = new ErrorResponse('User not authorized to delete this course.', status.error.UNAUTHORIZED);
   }

   if (errResponse) return next(errResponse);

   await course.remove()

   res
      .status(status.success.OK)
      .json({
         success,
         data: course,
      });
});