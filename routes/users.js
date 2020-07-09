const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { 
   register,
   updateUser
} = require('../controllers/users');
const { roles } = require('../enums/roles');

const router = express.Router();

router
   .route('/')
   .post(
      protect,
      authorizeRoles(roles.ADMIN),
      register
   );

router
   .route('/:id')
   .put(
      protect,
      authorizeRoles(roles.ADMIN),
      updateUser
   );

module.exports = router;