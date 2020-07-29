const express = require('express');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/auth');
const advancedQuerying = require('../middleware/advancedQuerying');
const {
   getUsers,
   getUser,
   register,
   updateUser,
   deleteUser,
} = require('../controllers/users');
const { roles } = require('../enums/roles');


const router = express.Router();

router.use(protect, authorizeRoles(roles.ADMIN));

router
   .route('/')
   .get(
      advancedQuerying(User),
      getUsers
   )
   .post(register);

router
   .route('/:id')
   .get(getUser)
   .put(updateUser)
   .delete(deleteUser);

module.exports = router;