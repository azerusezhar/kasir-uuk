const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kasir-uuk';

async function createAdmin() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const name = 'Admin'; 
  const email = 'admin@admin.com'; 
  const password = 'admin123'; 

  
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin dengan email ini sudah ada!');
    process.exit(0);
  }

  const admin = new User({
    name,
    email,
    password,
    role: 'admin',
  });
  await admin.save();
  console.log('Admin berhasil dibuat:', email);
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('Gagal membuat admin:', err);
  process.exit(1);
});