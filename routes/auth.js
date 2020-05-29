const express = require('express');
const {
   register,
   authenticate,
} = require('../controllers/auth');

const router = express.Router();

router.route('/register')
   .post(register);

router.route('/authenticate')
   .post(authenticate);

module.exports = router;