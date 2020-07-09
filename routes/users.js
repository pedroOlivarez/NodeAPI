const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { register } = require('../controllers/users');
const { roles } = require('../enums/roles');

const router = express.Router();

router
   .route('/')
   .post(
      protect,
      authorizeRoles(roles.ADMIN),
      register
   );

module.exports = router;