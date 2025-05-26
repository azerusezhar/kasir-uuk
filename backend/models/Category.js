const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Mohon tambahkan nama kategori'],
    trim: true,
    maxlength: [50, 'Nama tidak boleh lebih dari 50 karakter'],
    unique: true
  },
  description: {
    type: String,
    maxlength: [500, 'Deskripsi tidak boleh lebih dari 500 karakter']
  },
  icon: {
    type: String,
    default: 'Package' // Default icon
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', CategorySchema); 