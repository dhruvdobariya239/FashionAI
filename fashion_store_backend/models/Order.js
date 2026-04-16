const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    price: Number,
    size: String,
    quantity: Number,
});

const addressSchema = new mongoose.Schema({
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'India' },
});

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [orderItemSchema],
        shippingAddress: addressSchema,
        paymentMethod: {
            type: String,
            enum: ['cod', 'online'],
            default: 'cod',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        
        orderStatus: {
            type: String,
            enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            default: 'processing',
        },
        subtotal: Number,
        shippingCost: { type: Number, default: 0 },
        total: Number,
        notes: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
