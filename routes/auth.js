const express = require('express');
const { protect } = require('../middleware/auth');
const {
   register,
   authenticate,
   getLoggedInUser,
   forgotPassword,
   resetPassword,
} = require('../controllers/auth');

const router = express.Router();

router.route('/register')
   .post(protect, register);

router.route('/authenticate')
   .post(authenticate);

router.route('/me')
   .get(protect, getLoggedInUser);

router.route('/forgot-password')
   .post(forgotPassword);

router.route('/reset-password/:resetToken')
   .put(resetPassword);

module.exports = router;