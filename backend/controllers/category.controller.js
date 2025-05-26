const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    // Get product count for each category
    const Product = require('../models/Product');
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id });
        return { ...cat.toObject(), productCount: count };
      })
    );
    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Kategori dengan id ${req.params.id} tidak ditemukan`
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin/Officer only)
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin/Officer only)
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Kategori dengan id ${req.params.id} tidak ditemukan`
      });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin/Officer only)
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Kategori dengan id ${req.params.id} tidak ditemukan`
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
}; 