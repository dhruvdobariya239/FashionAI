const Product = require('../models/Product');

// @desc  Get all products with filters
// @route GET /api/products
const getProducts = async (req, res, next) => {
    try {
        const { gender, subcategory, category, search, minPrice, maxPrice, page = 1, limit = 12, sort } = req.query;

        const filter = { isActive: true };
        if (gender) filter.gender = gender;
        if (subcategory) filter.subcategory = subcategory.toLowerCase();
        if (category) filter.category = category;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (search) filter.$text = { $search: search };

        const sortMap = {
            newest: { createdAt: -1 },
            'price-asc': { price: 1 },
            'price-desc': { price: -1 },
            rating: { rating: -1 },
        };
        const sortOption = sortMap[sort] || { createdAt: -1 };

        const skip = (Number(page) - 1) * Number(limit);
        const [products, total] = await Promise.all([
            Product.find(filter).populate('category', 'name slug').sort(sortOption).skip(skip).limit(Number(limit)),
            Product.countDocuments(filter),
        ]);

        res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        next(error);
    }
};

// @desc  Get single product
// @route GET /api/products/:id
const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name slug tryOnSupported');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        next(error);
    }
};

// @desc  Create product (admin)
// @route POST /api/products
const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, originalPrice, gender, subcategory, category, sizes, material, brand, colors, tags, isFeatured } = req.body;

        const images = req.files
            ? req.files.map((f, i) => ({ url: f.path, publicId: f.filename, isMain: i === 0 }))
            : [];

        // Auto-detect tryOnSupported
        const tryOnSubcategories = ['shirts', 't-shirts', 'pants', 'tops', 'jeans', 'dresses', 'jackets', 'hoodies', 'sweaters', 'leggings', 'skirts'];
        const tryOnSupported = tryOnSubcategories.includes(subcategory?.toLowerCase());

        const sizesArray = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;

        const product = await Product.create({
            name, description, price: Number(price), originalPrice: originalPrice ? Number(originalPrice) : undefined,
            images, gender, subcategory: subcategory?.toLowerCase(), category, tryOnSupported,
            sizes: sizesArray || [], material, brand, colors: colors || [], tags: tags || [], isFeatured: isFeatured === 'true',
        });

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

// @desc  Update product (admin)
// @route PUT /api/products/:id
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        next(error);
    }
};

// @desc  Delete product (admin)
// @route DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        next(error);
    }
};

// @desc  Get featured products
// @route GET /api/products/featured
const getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isFeatured: true, isActive: true }).limit(8).populate('category', 'name');
        res.json(products);
    } catch (error) {
        next(error);
    }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFeaturedProducts };
