const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Data tidak ditemukan`;
    error = { message, status: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Data dengan nilai yang sama sudah ada';
    error = { message, status: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, status: 400 };
  }

  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Terjadi kesalahan pada server'
  });
};

module.exports = errorHandler; 