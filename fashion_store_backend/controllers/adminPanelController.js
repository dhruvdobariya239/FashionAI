const nodemailer = require('nodemailer');
const Order = require('../models/Order');
const User = require('../models/User');

function createMailer() {
    const host = process.env.MAIL_HOST;
    const port = Number(process.env.MAIL_PORT || 587);
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    if (!host || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
}

function formatCurrency(value) {
    return `INR ${Number(value || 0).toFixed(2)}`;
}

const adminListOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 15, status, paymentStatus, search } = req.query;
        const filter = {};
        if (status) filter.orderStatus = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (search) {
            const text = String(search).trim();
            filter.$or = [
                { _id: text.match(/^[0-9a-fA-F]{24}$/) ? text : undefined },
                { 'shippingAddress.fullName': { $regex: text, $options: 'i' } },
                { 'shippingAddress.phone': { $regex: text, $options: 'i' } },
            ].filter(Boolean);
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Order.countDocuments(filter),
        ]);

        res.json({
            orders,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
        });
    } catch (error) {
        next(error);
    }
};

const adminGetOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        next(error);
    }
};

const adminUpdateOrderStatus = async (req, res, next) => {
    try {
        const { orderStatus, paymentStatus } = req.body;
        const updates = {};
        if (orderStatus) updates.orderStatus = orderStatus;
        if (paymentStatus) updates.paymentStatus = paymentStatus;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No status fields provided' });
        }

        const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
            .populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        next(error);
    }
};

const adminGetUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'user' }).select('name email createdAt').sort({ createdAt: -1 }).limit(500);
        res.json(users);
    } catch (error) {
        next(error);
    }
};

const adminSendOrderEmail = async (req, res, next) => {
    try {
        const { orderId, subject, message } = req.body;
        if (!orderId) return res.status(400).json({ message: 'orderId is required' });

        const order = await Order.findById(orderId).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (!order.user?.email) return res.status(400).json({ message: 'User email not found on order' });

        const transporter = createMailer();
        if (!transporter) {
            return res.status(400).json({
                message: 'Email service is not configured. Set MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS in .env',
            });
        }

        const from = process.env.MAIL_FROM || process.env.MAIL_USER;
        const defaultSubject = `Order Update: #${order._id}`;
        const itemRows = order.items
            .map((it) => `<li>${it.name} (${it.size || 'size N/A'}) x ${it.quantity} - ${formatCurrency(it.price)}</li>`)
            .join('');
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Hello ${order.user.name || 'Customer'},</h2>
                <p>${message || `Your order <b>#${order._id}</b> is currently <b>${order.orderStatus}</b>.`}</p>
                <p><b>Order Details</b></p>
                <ul>${itemRows}</ul>
                <p>Subtotal: ${formatCurrency(order.subtotal)}</p>
                <p>Shipping: ${formatCurrency(order.shippingCost)}</p>
                <p><b>Total: ${formatCurrency(order.total)}</b></p>
                <p>Thanks for shopping with us.</p>
            </div>
        `;

        const info = await transporter.sendMail({
            from,
            to: order.user.email,
            subject: subject || defaultSubject,
            html,
        });

        res.json({ message: 'Order email sent', messageId: info.messageId });
    } catch (error) {
        next(error);
    }
};

const adminSendPromoEmail = async (req, res, next) => {
    try {
        const { subject, message, productName, productUrl, userIds } = req.body;
        if (!subject || !message) {
            return res.status(400).json({ message: 'subject and message are required' });
        }

        const transporter = createMailer();
        if (!transporter) {
            return res.status(400).json({
                message: 'Email service is not configured. Set MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS in .env',
            });
        }

        const recipientsFilter = Array.isArray(userIds) && userIds.length > 0
            ? { _id: { $in: userIds }, role: 'user' }
            : { role: 'user' };
        const users = await User.find(recipientsFilter).select('name email');
        const validUsers = users.filter((u) => u.email);
        if (validUsers.length === 0) return res.status(400).json({ message: 'No recipients found' });

        const from = process.env.MAIL_FROM || process.env.MAIL_USER;
        const linkHtml = productUrl ? `<p><a href="${productUrl}">Shop now</a></p>` : '';
        const productHtml = productName ? `<p><b>Featured Product:</b> ${productName}</p>` : '';

        await transporter.sendMail({
            from,
            bcc: validUsers.map((u) => u.email).join(','),
            subject,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Fashion Store</h2>
                    ${productHtml}
                    <p>${String(message).replace(/\n/g, '<br/>')}</p>
                    ${linkHtml}
                </div>
            `,
        });

        res.json({ message: 'Promotional email sent', recipients: validUsers.length });
    } catch (error) {
        next(error);
    }
};

const getDashboardAnalytics = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get revenue and order count by date
        const revenueData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'paid',
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        res.json({ revenueData });
    } catch (error) {
        next(error);
    }
};

const getBestSellingProducts = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        // Get best-selling products
        const bestSelling = await Order.aggregate([
            {
                $match: { paymentStatus: 'paid' },
            },
            {
                $unwind: '$items',
            },
            {
                $group: {
                    _id: '$items.product',
                    productName: { $first: '$items.name' },
                    productImage: { $first: '$items.image' },
                    totalSold: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                },
            },
            {
                $sort: { totalSold: -1 },
            },
            {
                $limit: limit,
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product',
                },
            },
        ]);

        res.json({ bestSelling });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    adminListOrders,
    adminGetOrder,
    adminUpdateOrderStatus,
    adminGetUsers,
    adminSendOrderEmail,
    adminSendPromoEmail,
    getDashboardAnalytics,
    getBestSellingProducts,
};

