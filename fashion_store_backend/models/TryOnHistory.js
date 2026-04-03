const mongoose = require('mongoose');

const tryOnImageSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        pose: { type: String, default: '' },
    },
    { _id: false }
);

const tryOnHistorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        productSnapshot: {
            name: { type: String, default: '' },
            price: { type: Number },
            imageUrl: { type: String, default: '' },
            gender: { type: String, default: '' },
            subcategory: { type: String, default: '' },
        },
        sourcePhoto: {
            url: { type: String, default: '' },
            publicId: { type: String, default: '' },
        },
        images: {
            type: [tryOnImageSchema],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('TryOnHistory', tryOnHistorySchema);

