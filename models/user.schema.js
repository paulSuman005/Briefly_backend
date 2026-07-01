import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import crypto from 'crypto';
import { type } from "os";

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'name should be required'],
    minLength: [5, 'name should be at least 5 characters'],
    maxLength: [30, 'name should be less than 30 characters'],
    trim: true
  },

  email: {
    type: String,
    required: [true, 'email is required'],
    unique: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please fill in a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minLength: [6, 'password must be at least 6 characters'],
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationOTP: {
    type: String,
    select: false
  },
  emailVerificationExpiry: {
    type: Date,
    select: false
  },
  forgetPasswordToken: {
    type: String,
    select: false
  },
  forgetPasswordExpiry: {
    type: Date,
    select: false
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods = {
  generateJWTToken: async function () {
    return JWT.sign(
      { id: this._id, email: this.email },
      process.env.JWT_SECRET,

      {
        expiresIn: process.env.JWT_EXPIRY
      }
    )
  },

  comparePassword: async function (password) {
    return await bcrypt.compare(password, this.password);
  },

  generatePasswordResetToken: async function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.forgetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.forgetPasswordExpiry = Date.now() + 15 * 60 * 1000;

    return resetToken;
  }
}

const User = model('User', userSchema);
export default User;
