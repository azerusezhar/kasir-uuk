const Customer = require('../models/Customer');
const User = require('../models/User');

// @desc    Register customer
// @route   POST /api/customers/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, address, phoneNumber } = req.body;


    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    const customer = await Customer.create({
      name,
      email,
      password,
      address,
      phoneNumber
    });

    sendTokenResponse(customer, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login customer
// @route   POST /api/customers/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mohon masukkan email dan kata sandi'
      });
    }


    const customer = await Customer.findOne({ email }).select('+password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Kredensial tidak valid'
      });
    }

    // Check if password matches
    const isMatch = await customer.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Kredensial tidak valid'
      });
    }

    sendTokenResponse(customer, 200, res);
  } catch (err) {
    next(err);
  }
};

const sendTokenResponse = (customer, statusCode, res) => {

  const token = customer.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      role: 'customer',
      address: customer.address,
      phoneNumber: customer.phoneNumber
    }
  });
};

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private (Admin/Officer only)
exports.getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find();

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private (Admin/Officer/Owner)
exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Pelanggan dengan id ${req.params.id} tidak ditemukan`
      });
    }


    if (
      req.user.role === 'customer' &&
      customer._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Tidak diizinkan mengakses data pelanggan ini'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new customer profile
// @route   POST /api/customers
// @access  Private (Customer only)
exports.createCustomer = async (req, res, next) => {
  try {
    const existingCustomer = await Customer.findOne({ user: req.user.id });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Profil pelanggan untuk pengguna ini sudah ada'
      });
    }

    req.body.user = req.user.id;

    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (Owner or Admin/Officer)
exports.updateCustomer = async (req, res, next) => {
  try {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Pelanggan dengan id ${req.params.id} tidak ditemukan`
      });
    }

    if (
      req.user.role === 'customer' &&
      customer._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Tidak diizinkan mengubah data pelanggan ini'
      });
    }


    if (req.body.password) {
      delete req.body.password;
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin/Officer only)
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Pelanggan dengan id ${req.params.id} tidak ditemukan`
      });
    }

    await customer.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
}; 