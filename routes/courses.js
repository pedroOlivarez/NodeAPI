const express = require('express');
const Course = require('../models/Course');
const advancedQuerying = require('../middleware/advancedQuerying');
const { 
   getCourses,
   getCourse,
   addCourse,
   updateCourse,
   deleteCourse,
} = require('../controllers/courses');

const router = express.Router({ mergeParams: true });
const populate = {
   path: 'bootcamp',
   select: 'name description'
};

router.route('/')
   .get(advancedQuerying(Course, populate), getCourses)
   .post(addCourse);

router.route('/:id')
   .get(getCourse)
   .put(updateCourse)
   .delete(deleteCourse);

module.exports = router;