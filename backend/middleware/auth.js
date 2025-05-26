const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

// Protect routes
exports.protect = async (req, res, next) => {
  console.log('[ProtectMiddleware] Entered for path:', req.originalUrl, 'Method:', req.method);
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log('[ProtectMiddleware] Token found in Bearer header.');
  } else {
    console.log('[ProtectMiddleware] No Bearer token found in headers.');
  }

  if (!token) {
    console.log('[ProtectMiddleware] No token, returning 401.');
    return res.status(401).json({
      success: false,
      message: 'Tidak diizinkan mengakses rute ini (tidak ada token)'
    });
  }

  try {
    console.log('[ProtectMiddleware] Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia123456');
    console.log('[ProtectMiddleware] Token decoded:', decoded);

    let userAccount = null;
    if (decoded.role === 'customer') {
      console.log(`[ProtectMiddleware] Token role is customer, finding Customer with ID: ${decoded.id}`);
      userAccount = await Customer.findById(decoded.id);
      if (userAccount) {
        userAccount.role = 'customer';
        console.log('[ProtectMiddleware] Customer found:', { id: userAccount._id, name: userAccount.name });
      } else {
        console.log('[ProtectMiddleware] Customer NOT found by ID from token.');
      }
    } else {
      console.log(`[ProtectMiddleware] Token role is ${decoded.role}, finding User with ID: ${decoded.id}`);
      userAccount = await User.findById(decoded.id);
      if (userAccount) {
        console.log('[ProtectMiddleware] Admin/Officer User found:', { id: userAccount._id, name: userAccount.name, role: userAccount.role });
      } else {
        console.log('[ProtectMiddleware] Admin/Officer User NOT found by ID from token.');
      }
    }

    if (!userAccount) {
      console.log('[ProtectMiddleware] User account not found after DB lookup, returning 401.');
      return res.status(401).json({
        success: false,
        message: 'Pengguna tidak ditemukan (dari token)'
      });
    }

    req.user = userAccount;
    console.log('[ProtectMiddleware] User attached to req.user. Calling next().');
    next();
  } catch (err) {
    console.error('[ProtectMiddleware] Error verifying token or fetching user:', err.name, err.message);

    let status = 401;
    let message = 'Tidak diizinkan mengakses rute ini (token tidak valid)';
    if (err.name === 'JsonWebTokenError') {
      message = 'Token tidak valid.';
    } else if (err.name === 'TokenExpiredError') {
      message = 'Token sudah kedaluwarsa.';
    }

    return res.status(status).json({
      success: false,
      message: message
    });
  }
};


exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log(`[AuthorizeMiddleware] Entered for path: ${req.originalUrl}. Required roles: ${roles}. User role: ${req.user ? req.user.role : 'NO USER'}`);
    if (!req.user) {

      console.log('[AuthorizeMiddleware] No user on request, blocking access (should be caught by protect).');
      return res.status(401).json({
        success: false,
        message: 'Sesi tidak valid atau pengguna tidak terautentikasi.'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`[AuthorizeMiddleware] Role mismatch. User role '${req.user.role}' not in required roles '${roles}'. Returning 403.`);
      return res.status(403).json({
        success: false,
        message: `Peran pengguna ${req.user.role} tidak diizinkan mengakses rute ini`
      });
    }
    console.log('[AuthorizeMiddleware] Role authorized. Calling next().');
    next();
  };
}; 