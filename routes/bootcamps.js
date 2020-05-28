const express = require('express');
const Bootcamp = require('../models/Bootcamp');
const advancedQuerying = require('../middleware/advancedQuerying');
const courseRouter = require('./courses');
const { 
   getBootcamp, 
   getBootcamps, 
   createBootcamp, 
   updateBootcamp, 
   deleteBootcamp, 
   getBootcampsInRadius,
   uploadBootcampPhoto,
} = require('../controllers/bootcamps');

const router = express.Router();

router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance')
   .get(getBootcampsInRadius);

router.route('/:id/photo')
   .put(uploadBootcampPhoto);

router.route('/')
   .get(advancedQuerying(Bootcamp, 'courses'), getBootcamps)
   .post(createBootcamp);

router.route('/:id')
   .get(getBootcamp)
   .put(updateBootcamp)
   .delete(deleteBootcamp);

module.exports = router;
