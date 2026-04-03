const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        // res.json(users);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user' });
    }
};

const getproducts = async(req,res)  =>{
try {
    const products = await Product.find()
    res.status(200).json(products);
} catch (error) {
    res.status(500).json({ message: 'Failed to get products' });
}
};
const deleteProduct = async(req,res) => {
    try {
    await Product.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Product deleted' });       
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product' });
    }
}

const getStats = async(req,res) => {
    try {
        const userCount = await User.getCountDocuments({ role: 'user' });
        const productCount = await Product.getCountDocuments();
        res.status(200).json({ userCount, productCount });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get status' });
    }
};

const getVisitorStats = async (req, res) => {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const count = await Visit.countDocuments({
        visitedAt: { $gte: last24Hours }
    });

    res.json({ visitorsLast24Hours: count });
};

const getOrdersRatio = async (req,res)=>{
    try {
        const totalusers = await User.countDocuments({role: 'user'})
        const totalorders = await Order.Order.distinct('user')
        const totalRatio = (totalusers)/(totalorders.length)
        res.status(200).json(totalRatio)        
    } catch (error) {
        res.status(500)
.json({message: 'Failed to get orders ratio'})    }

}

const getMostSoldProducts = async (req, res) => {
    try {
        const MostSoldProducts = await Order.aggregate([
            { $unwind: '$items' },

            {
                $group: {
                    _id: '$items.product',
                    totalSold: { $sum: '$items.quantity' }
                }
            },

            {
                $lookup: {
                    from: 'products', // collection name
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },

            { $unwind: '$productDetails' },

            {
                $project: {
                    _id: 0,
                    productId: '$_id',
                    name: '$productDetails.name',
                    price: '$productDetails.price',
                    totalSold: 1
                }
            },

            { $sort: { totalSold: -1 } },

            { $limit: 10 } // top 10 products
        ]);

        res.status(200).json(MostSoldProducts);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to get most sold products'
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const allowedFields = [
            'name',
            'description',
            'price',
            'originalPrice',
            'isActive',
            'isFeatured',
            'tryOnSupported',
            'brand',
            'material',
            'category',
            'gender',
            'subcategory'
        ];

        const updates = {};

        Object.keys(req.body).forEach((key) => {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        // 🚨 check if no valid fields provided
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid fields to update"
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.json(product);

    } catch (error) {
        res.status(500).json({
            message: "Failed to update product"
        });
    }
};





module.exports = { getUsers, deleteUser, getproducts, deleteProduct, getStats, getVisitorStats, getOrdersRatio,getMostSoldProducts,updateProduct };