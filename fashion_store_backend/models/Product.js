const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        originalPrice: {
            type: Number,
            min: 0,
        },
        images: [
            {
                url: { type: String, required: true },
                publicId: { type: String },
                isMain: { type: Boolean, default: false },
            },
        ],
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        gender: {
            type: String,
            enum: ['men', 'women', 'children', 'unisex'],
            required: true,
        },
        subcategory: {
            type: String,
            required: true,
            // e.g. shirts, t-shirts, pants, shoes, accessories, dresses, tops, jeans
        },
        sizes: [
            {
                size: { type: String }, // XS, S, M, L, XL, XXL or numeric
                stock: { type: Number, default: 0 },
            },
        ],
        material: { type: String, default: '' },
        brand: { type: String, default: '' },
        colors: [String],
        tags: [String],
        tryOnSupported: {
            type: Boolean,
            default: false,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

productSchema.index({ gender: 1, subcategory: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
