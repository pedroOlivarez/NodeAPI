//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   PUBLIC
exports.getBootcamps = (req, res, next) => {
   res.status(200).json({ success: true, msg: "Get all bootcamps" });
};

//@desc     Get single bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   PUBLIC
exports.getBootcamp = (req, res, next) => {
   res.status(200).json({ success: true, msg: `Get bootcamp with id of ${req.params.id}` });
};

//@desc     Create new bootcamp
//@route    POST /api/v1/bootcamps/
//@access   PRIVATE
exports.createBootcamp = (req, res, next) => {
   res.status(200).json({ success: true, msg: "Create new bootcamp" });
};

//@desc     Update bootcamp
//@route    PUT /api/v1/bootcamps/:id
//@access   PRIVATE
exports.updateBootcamp = (req, res, next) => {
   res.status(200).json({ success: true, msg: `Update bootcamp ${req.params.id}` });
};

//@desc     Delete bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@access   PRIVATE
exports.deleteBootcamp = (req, res, next) => {
   res.status(200).json({ success: true, msg: `Delete bootcamp with id of ${req.params.id}` });
};
