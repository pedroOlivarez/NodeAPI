const express = require('express');
const Bootcamp = require('../models/Bootcamp');
const courseRouter = require('./courses');
const advancedQuerying = require('../middleware/advancedQuerying');
const {
   protect,
   authorizeRoles,
} = require('../middleware/auth');
const { 
   getBootcamp, 
   getBootcamps, 
   createBootcamp, 
   updateBootcamp, 
   deleteBootcamp, 
   getBootcampsInRadius,
   uploadBootcampPhoto,
} = require('../controllers/bootcamps');
const { roles } = require('../enums/roles');

const router = express.Router();
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance')
   .get(getBootcampsInRadius);

router.route('/:id/photo')
   .put(
      protect,
      authorizeRoles(roles.PUBLISHER, roles.ADMIN),
      uploadBootcampPhoto
   );

router.route('/')
   .get(advancedQuerying(Bootcamp, 'courses'), getBootcamps)
   .post(
      protect,
      authorizeRoles(roles.PUBLISHER, roles.ADMIN),
      createBootcamp
   );

router.route('/:id')
   .get(getBootcamp)
   .put(
      protect,
      authorizeRoles(roles.PUBLISHER, roles.ADMIN),
      updateBootcamp
   )
   .delete(protect, deleteBootcamp);

module.exports = router;
