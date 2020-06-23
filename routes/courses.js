const express = require('express');
const Course = require('../models/Course');
const {
   protect,
   authorizeRoles,
} = require('../middleware/auth');
const advancedQuerying = require('../middleware/advancedQuerying');
const { 
   getCourses,
   getCourse,
   addCourse,
   updateCourse,
   deleteCourse,
} = require('../controllers/courses');
const { roles } = require('../enums/roles');

const router = express.Router({ mergeParams: true });
const populate = {
   path: 'bootcamp',
   select: 'name description'
};

router.route('/')
   .get(advancedQuerying(Course, populate), getCourses)
   .post(
      protect,
      authorizeRoles(roles.PUBLISHER, roles.ADMIN),
      addCourse
   );

router.route('/:id')
   .get(getCourse)
   .put(
      protect,
      authorizeRoles(roles.PUBLISHER, roles.ADMIN),
      updateCourse
   )
   .delete(
      protect,
      authorizeRoles(roles.PUBLISHER, roles.ADMIN),
      deleteCourse
   );

module.exports = router;