# Backend Kasir UUK

API backend untuk sistem kasir yang dibangun dengan Node.js, Express, dan MongoDB.

## Persiapan

1. Clone repository
2. Install dependensi
   ```
   npm install
   ```
3. Buat file `.env` di direktori root dengan variabel berikut:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/kasir-uuk
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```
4. Jalankan server
   ```
   # Mode pengembangan
   npm run dev
   
   # Mode produksi
   npm start
   ```

## Endpoint API

### Autentikasi

- `POST /api/auth/register` - Daftar pelanggan baru
- `POST /api/auth/login` - Login pengguna
- `GET /api/auth/me` - Mendapatkan data pengguna saat ini (memerlukan autentikasi)
- `GET /api/auth/logout` - Logout pengguna (memerlukan autentikasi)
- `PUT /api/auth/updatedetails` - Memperbarui detail pengguna (memerlukan autentikasi)
- `PUT /api/auth/updatepassword` - Memperbarui kata sandi pengguna (memerlukan autentikasi)
- `POST /api/auth/create-staff` - Membuat admin/petugas (memerlukan peran admin)
- `GET /api/auth/users` - Mendapatkan semua pengguna (memerlukan peran admin)

### Pelanggan

- `GET /api/customers` - Mendapatkan semua pelanggan (memerlukan peran admin/petugas)
- `GET /api/customers/:id` - Mendapatkan satu pelanggan (memerlukan autentikasi)
- `POST /api/customers` - Membuat profil pelanggan (memerlukan peran pelanggan)
- `PUT /api/customers/:id` - Memperbarui pelanggan (memerlukan autentikasi)
- `DELETE /api/customers/:id` - Menghapus pelanggan (memerlukan peran admin/petugas)

### Kategori

- `GET /api/categories` - Mendapatkan semua kategori (publik)
- `GET /api/categories/:id` - Mendapatkan satu kategori (publik)
- `POST /api/categories` - Membuat kategori baru (memerlukan peran admin/petugas)
- `PUT /api/categories/:id` - Memperbarui kategori (memerlukan peran admin/petugas)
- `DELETE /api/categories/:id` - Menghapus kategori (memerlukan peran admin/petugas)

### Produk

- `GET /api/products` - Mendapatkan semua produk (publik)
- `GET /api/products/:id` - Mendapatkan satu produk (publik)
- `POST /api/products` - Membuat produk baru (memerlukan peran admin/petugas)
- `PUT /api/products/:id` - Memperbarui produk (memerlukan peran admin/petugas)
- `DELETE /api/products/:id` - Menghapus produk (memerlukan peran admin/petugas)
- `PUT /api/products/:id/image` - Mengunggah gambar produk (memerlukan peran admin/petugas)
- `GET /api/products/stock` - Mendapatkan stok produk (memerlukan peran admin/petugas)

### Transaksi

- `GET /api/transactions` - Mendapatkan semua transaksi (memerlukan autentikasi)
- `GET /api/transactions/:id` - Mendapatkan satu transaksi (memerlukan autentikasi)
- `POST /api/transactions` - Membuat transaksi baru (memerlukan peran pelanggan)
- `PUT /api/transactions/:id` - Memperbarui status transaksi (memerlukan peran admin/petugas)
- `GET /api/transactions/report` - Menghasilkan laporan transaksi (memerlukan autentikasi)

## Autentikasi

API menggunakan JWT untuk autentikasi. Sertakan token di header Authorization:

```
Authorization: Bearer <token>
```

## Peran

- `admin` - Akses penuh ke semua fitur
- `officer` - Akses sama seperti admin kecuali manajemen pengguna
- `customer` - Dapat mendaftar, membuat profil, melakukan pembelian, dan melihat transaksi mereka sendiri 