const User = require('../models/User');

exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (role !== 'admin' && role !== 'officer') {
      return res.status(400).json({
        success: false,
        message: 'Peran harus admin atau petugas'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mohon masukkan email dan kata sandi'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kredensial tidak valid'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Kredensial tidak valid'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan setelah autentikasi.'
      });
    }

    // Jika user adalah customer, ambil data lengkap dari koleksi Customer
    if (req.user.role === 'customer') {
      const Customer = require('../models/Customer');
      const customer = await Customer.findById(req.user._id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Data customer tidak ditemukan.'
        });
      }
      return res.status(200).json({
        success: true,
        data: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          role: 'customer',
          address: customer.address,
          phoneNumber: customer.phoneNumber
        }
      });
    }

    // Jika admin/officer
    res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      }
    });
  } catch (err) {
    console.error('[GET ME ERROR]', err);
    next(err);
  }
};

exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    Object.keys(fieldsToUpdate).forEach(
      key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Kata sandi saat ini salah'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {}
  });
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};