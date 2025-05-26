const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    let query = {};

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    const products = await Product.find(query)
      .populate('category', 'name');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Produk dengan id ${req.params.id} tidak ditemukan`
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin/Officer only)
exports.createProduct = async (req, res, next) => {
  try {
    const category = await Category.findById(req.body.category);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Kategori dengan id ${req.body.category} tidak ditemukan`
      });
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin/Officer only)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Produk dengan id ${req.params.id} tidak ditemukan`
      });
    }

    // Check if category exists if updating category
    if (req.body.category) {
      const category = await Category.findById(req.body.category);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Kategori dengan id ${req.body.category} tidak ditemukan`
        });
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin/Officer only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Produk dengan id ${req.params.id} tidak ditemukan`
      });
    }

    // Delete product image if it exists and is not the default
    if (product.image && product.image !== 'no-image.jpg') {
      const imagePath = path.join(__dirname, '../public/uploads', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload product image
// @route   PUT /api/products/:id/image
// @access  Private (Admin/Officer only)
exports.uploadProductImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Produk dengan id ${req.params.id} tidak ditemukan`
      });
    }

    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: 'Mohon unggah sebuah file'
      });
    }

    const file = req.files.file;

    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        message: 'Mohon unggah file gambar'
      });
    }

    // Check file size
    if (file.size > process.env.MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: `Mohon unggah gambar dengan ukuran kurang dari ${process.env.MAX_FILE_SIZE / 1000000}MB`
      });
    }


    file.name = `product_${product._id}${path.parse(file.name).ext}`;


    if (product.image && product.image !== 'no-image.jpg') {
      const oldImagePath = path.join(__dirname, '../public/uploads', product.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: 'Terjadi masalah saat mengunggah file'
        });
      }

      await Product.findByIdAndUpdate(req.params.id, { image: file.name });

      res.status(200).json({
        success: true,
        data: file.name
      });
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get product stock
// @route   GET /api/products/stock
// @access  Private (Admin/Officer only)
exports.getProductStock = async (req, res, next) => {
  try {
    const products = await Product.find()
      .select('name stock price category')
      .populate('category', 'name');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get best seller products
// @route   GET /api/products/best-sellers
// @access  Private (Admin/Officer only)
exports.getBestSellerProducts = async (req, res, next) => {
  try {
    const TransactionDetail = require('../models/TransactionDetail');
    const bestSellers = await TransactionDetail.aggregate([
      {
        $group: {
          _id: '$product',
          totalSold: { $sum: '$quantity' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    const result = bestSellers.map(item => ({
      id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      description: item.product.description,
      sold: item.totalSold
    }));

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}; 