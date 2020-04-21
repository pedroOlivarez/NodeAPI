const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps

//@access   PUBLIC
exports.getBootcamps = asyncHandler(async (req, res, next) => {
   let promise = 
      !!req.query 
         ? Bootcamp.find(req.query) 
         : Bootcamp.find();
   // bootcamps =
   if (req.select) promise = promise.select(req.select)
   promise = promise.sort(req.sort);
   const bootcamps = await promise;
   res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
});

//@desc     Get single bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   PUBLIC
exports.getBootcamp = asyncHandler(async (req, res, next) => {
   const bootcamp = await Bootcamp.findById(req.params.id);

   if (!bootcamp) {
      const errResponse = new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404);
      return next(errResponse);
   }

   res.status(200).json({ success: true, data: bootcamp });
});

//@desc     Create new bootcamp
//@route    POST /api/v1/bootcamps/
//@access   PRIVATE
exports.createBootcamp = asyncHandler(async (req, res, next) => {
   const bootcamp = await Bootcamp.create(req.body);

   res.status(201).json({
      success: true,
      data: bootcamp,
   });
});

//@desc     Update bootcamp
//@route    PUT /api/v1/bootcamps/:id
//@access   PRIVATE
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
   const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   });

   if (!bootcamp) {
      const errResponse = new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404);
      return next(errResponse);
   }

   res.status(200).json({ success: true, data: bootcamp });
});

//@desc     Delete bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@access   PRIVATE
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
   const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

   if (!bootcamp) {
      const errResponse = new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404);
      return next(errResponse);
   }

   res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Get Bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
   const { zipcode, distance } = req.params;

   const location = await geocoder.geocode(zipcode);
   const lat = location[0].latitude;
   const long = location[0].longitude;
   const earthRadius = 3963;

   const radius = distance / earthRadius;

   const bootcamps = await Bootcamp.find({
      location: {
         $geoWithin: {
            $centerSphere: [[long, lat], radius],
         },
      },
   });

   res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps,
   });
});
