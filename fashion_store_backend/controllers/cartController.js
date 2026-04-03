const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc  Get cart
// @route GET /api/cart
const getCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price isActive');
        if (!cart) return res.json({ items: [], totalAmount: 0, totalItems: 0 });
        res.json(cart);
    } catch (error) {
        next(error);
    }
};

// @desc  Add item to cart
// @route POST /api/cart
const addToCart = async (req, res, next) => {
    try {
        const { productId, size, quantity = 1 } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

        const existingItem = cart.items.find(
            (i) => i.product.toString() === productId && i.size === size
        );

        if (existingItem) {
            existingItem.quantity += Number(quantity);
        } else {
            cart.items.push({ product: productId, size, quantity: Number(quantity), price: product.price });
        }

        await cart.save();
        const populated = await cart.populate('items.product', 'name images price');
        res.json(populated);
    } catch (error) {
        next(error);
    }
};

// @desc  Update cart item quantity
// @route PUT /api/cart/:itemId
const updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = cart.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ message: 'Item not found in cart' });

        if (quantity <= 0) {
            item.deleteOne();
        } else {
            item.quantity = quantity;
        }

        await cart.save();
        const populated = await cart.populate('items.product', 'name images price');
        res.json(populated);
    } catch (error) {
        next(error);
    }
};

// @desc  Remove item from cart
// @route DELETE /api/cart/:itemId
const removeFromCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
        await cart.save();

        const populated = await cart.populate('items.product', 'name images price');
        res.json(populated);
    } catch (error) {
        next(error);
    }
};

// @desc  Clear cart
// @route DELETE /api/cart
const clearCart = async (req, res, next) => {
    try {
        await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
