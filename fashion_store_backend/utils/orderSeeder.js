require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const seedOrders = async () => {
    try {
        await connectDB();

        // Clear existing orders
        await Order.deleteMany({});

        // Get or create test users
        let users = await User.find({ email: { $in: ['customer1@test.com', 'customer2@test.com', 'customer3@test.com'] } });

        if (users.length === 0) {
            const testUsers = [
                { name: 'Customer One', email: 'customer1@test.com', password: await bcrypt.hash('password123', 10), role: 'user' },
                { name: 'Customer Two', email: 'customer2@test.com', password: await bcrypt.hash('password123', 10), role: 'user' },
                { name: 'Customer Three', email: 'customer3@test.com', password: await bcrypt.hash('password123', 10), role: 'user' },
            ];
            users = await User.insertMany(testUsers);
            console.log('✅ Created 3 test users');
        }

        // Get some products
        const products = await Product.find().limit(10);
        if (products.length === 0) {
            console.log('❌ No products found. Please run product seeder first.');
            process.exit(1);
        }

        // Create sample orders for the last 30 days
        const orders = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        for (let day = 0; day < 30; day++) {
            const orderDate = new Date(startDate);
            orderDate.setDate(orderDate.getDate() + day);
            orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

            // Create 1-3 orders per day
            const ordersPerDay = Math.floor(Math.random() * 3) + 1;

            for (let i = 0; i < ordersPerDay; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const numItems = Math.floor(Math.random() * 3) + 1;
                const items = [];

                let subtotal = 0;
                for (let j = 0; j < numItems; j++) {
                    const product = products[Math.floor(Math.random() * products.length)];
                    const quantity = Math.floor(Math.random() * 3) + 1;
                    const itemTotal = product.price * quantity;
                    subtotal += itemTotal;

                    items.push({
                        product: product._id,
                        name: product.name,
                        image: product.images?.[0]?.url || 'https://via.placeholder.com/200',
                        price: product.price,
                        size: product.sizes?.[0]?.size || 'M',
                        quantity,
                    });
                }

                const shippingCost = subtotal > 1000 ? 0 : 100;
                const total = subtotal + shippingCost;

                orders.push({
                    user: user._id,
                    items,
                    shippingAddress: {
                        fullName: user.name,
                        phone: '9876543210',
                        addressLine1: '123 Fashion Street',
                        addressLine2: 'Apt 456',
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        postalCode: '400001',
                        country: 'India',
                    },
                    paymentMethod: 'online',
                    paymentStatus: 'paid',
                    orderStatus: ['delivered', 'shipped', 'confirmed'][Math.floor(Math.random() * 3)],
                    subtotal,
                    shippingCost,
                    total,
                    createdAt: orderDate,
                    updatedAt: orderDate,
                });
            }
        }

        // Insert all orders
        const createdOrders = await Order.insertMany(orders);
        console.log(`\n✅ Created ${createdOrders.length} sample orders with paid status`);

        // Calculate and display statistics
        const analytics = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const totalRevenue = analytics.reduce((sum, day) => sum + day.revenue, 0);
        const totalOrders = createdOrders.length;

        console.log('\n========================================');
        console.log('📊 ORDER SEEDING COMPLETE!');
        console.log('========================================');
        console.log(`💰 Total Revenue: ₹${totalRevenue.toFixed(2)}`);
        console.log(`📦 Total Orders: ${totalOrders}`);
        console.log(`📅 Date Range: Last 30 days`);
        console.log(`📈 Average Order Value: ₹${(totalRevenue / totalOrders).toFixed(2)}`);
        console.log('========================================\n');
        console.log('✨ Dashboard charts will now display data!');
        console.log('🎯 Visit admin panel to see Revenue & Orders chart\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Order seed error:', err.message);
        console.error(err);
        process.exit(1);
    }
};

seedOrders();
