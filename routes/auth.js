const express = require('express');
const { protect } = require('../middleware/auth');
const {
   register,
   authenticate,
   getLoggedInUser,
} = require('../controllers/auth');

const router = express.Router();

router.route('/register')
   .post(protect, register);

router.route('/authenticate')
   .post(authenticate);

router.route('/me')
   .get(protect, getLoggedInUser);

module.exports = router;