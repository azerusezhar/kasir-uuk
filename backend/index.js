const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, 
}));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/customers', require('./routes/customer.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Root route
app.get('/', (req, res) => {
  res.send('Selamat Datang di API Kasir UUK');
});

// Error handler middleware
app.use(errorHandler);

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kasir-uuk';

// Set file upload path
process.env.FILE_UPLOAD_PATH = path.join(__dirname, 'public/uploads');
process.env.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Terhubung ke MongoDB');
    app.listen(PORT, () => {
      console.log(`Server berjalan pada port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Gagal terhubung ke MongoDB', err);
    process.exit(1);
  }); 