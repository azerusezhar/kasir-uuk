const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Mohon tambahkan nama'],
    trim: true,
    maxlength: [50, 'Nama tidak boleh lebih dari 50 karakter']
  },
  email: {
    type: String,
    required: [true, 'Mohon tambahkan email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Mohon masukkan email yang valid'
    ]
  },
  password: {
    type: String,
    required: [true, 'Mohon tambahkan kata sandi'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'officer'],
    default: 'officer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  // Pastikan JWT_SECRET memiliki nilai
  const secret = process.env.JWT_SECRET || 'rahasia123456';
  const expire = process.env.JWT_EXPIRE || '30d';
  
  return jwt.sign({ id: this._id, role: this.role }, secret, {
    expiresIn: expire
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema); 