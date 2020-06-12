const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const { status } = require('../enums/responseStatus');
const { roles } = require('../enums/roles');
const success = true;

//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   PUBLIC
exports.getBootcamps = asyncHandler(async (req, res, next) => {
   res
      .status(status.success.OK)
      .json(res.results);
});

//@desc     Get single bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   PUBLIC
exports.getBootcamp = asyncHandler(async (req, res, next) => {
   const bootcamp = await Bootcamp
      .findById(req.params.id)
      .populate('courses');

   if (!bootcamp) {
      const errResponse = new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, status.error.NOT_FOUND);
      return next(errResponse);
   }

   res
      .status(status.success.OK)
      .json({
         success,
         data: bootcamp
      });
});

//@desc     Create new bootcamp
//@route    POST /api/v1/bootcamps/
//@access   PRIVATE
exports.createBootcamp = asyncHandler(async (req, res, next) => {
   req.body.user = req.user.id;
   if (req.user.role !== roles.ADMIN) {
      const publishedBootcamp = await Bootcamp.findOne({user: req.user.id});
      if (publishedBootcamp) {
         const errResponse = new ErrorResponse(`User: ${req.user.id} already has a published bootcamp in our sytem: ${publishedBootcamp.name}`, status.error.UNAUTHORIZED);
         return next(errResponse);
      }
   }
   const bootcamp = await Bootcamp.create(req.body);

   res
      .status(status.success.CREATED)
      .json({
         success,
         data: bootcamp,
      });
});

//@desc     Update bootcamp
//@route    PUT /api/v1/bootcamps/:id
//@access   PRIVATE
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
   const bootcamp = await Bootcamp
      .findByIdAndUpdate(
         req.params.id,
         req.body,
         { new: true, runValidators: true, }
      );

   if (!bootcamp) {
      const errResponse = new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, status.error.NOT_FOUND);
      return next(errResponse);
   }

   res
      .status(status.success.OK)
      .json({ success, data: bootcamp });
});

//@desc     Delete bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@access   PRIVATE
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
   const bootcamp = await Bootcamp
      .findById(req.params.id)
      .populate('courses');

   if (!bootcamp) {
      const errResponse = new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, status.error.NOT_FOUND);
      return next(errResponse);
   }

   bootcamp.remove();

   res
      .status(status.success.OK)
      .json({ success, data: bootcamp });
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

   const bootcamps = await Bootcamp
      .find({
         location: {
            $geoWithin: {
               $centerSphere: [[long, lat], radius],
            },
         },
      })
      .populate('courses');

   res
      .status(status.success.OK)
      .json({
         success,
         count: bootcamps.length,
         data: bootcamps,
      });
});

//@desc     Upload photo for bootcamp
//@route    PUT /api/v1/bootcamps/:id/photo
//@access   PRIVATE
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
   let errResponse;
   const bootcamp = await Bootcamp.findById(req.params.id);

   if (!bootcamp) {
      errResponse = new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, status.error.NOT_FOUND);
   } else if (!req.files) {
      errResponse = new ErrorResponse('Please upload a file', status.error.BAD_REQUEST);
   } else {
      const { file } = req.files;

      if (!file.mimetype.startsWith('image')) {
         errResponse = new ErrorResponse('Please upload a valid image file', status.error.BAD_REQUEST);
      } else if (file.size > process.env.MAX_FILE_UPLOAD) {
         errResponse = new ErrorResponse(
            `Please upload an image smaller than ${process.env.MAX_FILE_UPLOAD / 1000000} MB`,
            status.error.BAD_REQUEST
         );
      } else {
         file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
         file.mv(
            `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
            async(err) => {
               if(err) {
                  console.error(err);
                  return next(new ErrorResponse('Problem with file upload', status.error.SERVER_ERROR));
               }

               await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

               const data = {
                  _id: req.params.id,
                  photo: file.name,
               };
               
               res
                  .status(status.success.OK)
                  .json({ success, data, });
            }   
         );
      }
   }

   if (errResponse) return next(errResponse);
});