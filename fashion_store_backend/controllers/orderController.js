const Order = require('../models/Order');
const Cart = require('../models/Cart');

// @desc  Place order
// @route POST /api/orders
const placeOrder = async (req, res, next) => {
    try {
        const { shippingAddress, paymentMethod, notes } = req.body;
        console.log('Place order called - User:', req.user?._id);
        console.log('Request body:', { shippingAddress, paymentMethod, notes });

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price isActive');
        console.log('Cart found:', cart);
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Filter out items with null products (deleted products)
        const validItems = cart.items.filter(item => item.product !== null);
        
        if (validItems.length === 0) {
            return res.status(400).json({ message: 'No valid items in cart (some products may have been deleted)' });
        }

        const items = validItems.map((item) => ({
            product: item.product._id,
            name: item.product.name,
            image: item.product.images?.[0]?.url || '',
            price: item.price,
            size: item.size,
            quantity: item.quantity,
        }));

        const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const shippingCost = subtotal > 999 ? 0 : 99;

        const orderData = {
            user: req.user._id,
            items,
            shippingAddress,
            paymentMethod: paymentMethod || 'cod',
            subtotal,
            shippingCost,
            total: subtotal + shippingCost,
            notes,
        };
        
        console.log('Creating order with:', orderData);
        const order = await Order.create(orderData);
        console.log('Order created:', order._id);

        // Clear cart after order (also remove any null items)
        cart.items = [];
        await cart.save();
        console.log('Cart cleared after order');

        res.status(201).json(order);
    } catch (error) {
        console.error('Order creation error:', error.message);
        console.error('Error details:', error);
        next(error);
    }
};

// @desc  Get user orders
// @route GET /api/orders
const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc  Get single order
// @route GET /api/orders/:id
const getOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        next(error);
    }
};

module.exports = { placeOrder, getOrders, getOrder };
