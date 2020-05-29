const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Please add a name'],
   },
   email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: [true, 'An account with this email already exists'],
      match: [
         /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
         'Please add a valid email'
      ],
   },
   role: {
      type: String,
      enum: ['user', 'publisher'],
      default: 'user',
   },
   password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,      
   },
   resetPasswordToken: String,
   resetPasswordExpire: Date,
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

UserSchema.pre('save', async function(next) {
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password, salt);
   next();
});

// Token time
UserSchema.methods.getSignedJwtToken = function() {
   const payload = {
      id: this._id,
      role: this.role,
   };
   
   return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
      )
}

module.exports = mongoose.model('User', UserSchema);