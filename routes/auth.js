const express = require('express');
const { protect } = require('../middleware/auth');
const {
   authenticate,
   getLoggedInUser,
   forgotPassword,
   resetPassword,
   updatePassword,
} = require('../controllers/auth');

const router = express.Router();

router.route('/authenticate')
   .post(authenticate);

router.route('/me')
   .get(protect, getLoggedInUser);

router.route('/forgot-password')
   .post(forgotPassword);

router.route('/reset-password/:resetToken')
   .put(resetPassword);

router.route('/update-password')
   .put(protect, updatePassword);

module.exports = router;