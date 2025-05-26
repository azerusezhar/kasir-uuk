const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const CustomerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: [true, 'Mohon tambahkan nama pelanggan'],
    trim: true,
    maxlength: [100, 'Nama tidak boleh lebih dari 100 karakter']
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
  address: {
    type: String,
    required: [true, 'Mohon tambahkan alamat'],
    maxlength: [200, 'Alamat tidak boleh lebih dari 200 karakter']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Mohon tambahkan nomor telepon'],
    maxlength: [20, 'Nomor telepon tidak boleh lebih dari 20 karakter']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
CustomerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
CustomerSchema.methods.getSignedJwtToken = function() {
  // Pastikan JWT_SECRET memiliki nilai
  const secret = process.env.JWT_SECRET || 'rahasia123456';
  const expire = process.env.JWT_EXPIRE || '30d';
  
  return jwt.sign({ id: this._id, role: 'customer' }, secret, {
    expiresIn: expire
  });
};

// Match customer entered password to hashed password in database
CustomerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Customer', CustomerSchema); 