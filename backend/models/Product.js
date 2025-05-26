const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Mohon tambahkan nama produk'],
    trim: true,
    maxlength: [100, 'Nama tidak boleh lebih dari 100 karakter']
  },
  description: {
    type: String,
    maxlength: [500, 'Deskripsi tidak boleh lebih dari 500 karakter']
  },
  price: {
    type: Number,
    required: [true, 'Mohon tambahkan harga'],
    min: [0, 'Harga harus angka positif']
  },
  stock: {
    type: Number,
    required: [true, 'Mohon tambahkan jumlah stok'],
    min: [0, 'Stok tidak boleh negatif']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Mohon tambahkan kategori']
  },
  image: {
    type: String,
    default: 'no-image.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema); 