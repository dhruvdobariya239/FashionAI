const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../middleware/auth');

const { getUsers, deleteUser, getproducts, deleteProduct, getStats, getVisitorStats, getMostSoldProducts, updateProduct } = require('../controllers/adminController');
const { trackVisit } = require('../middleware/authMiddleware');

router.get('/users', protect, adminOnly, getUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.get('/products', protect, adminOnly, getproducts);
router.delete('/products/:id', protect, adminOnly, deleteProduct);
router.get('/stats', protect, adminOnly, getStats);
router.get('/visitor-stats',protect,adminOnly,trackVisit,getVisitorStats)
router.get('/orders-ratio',protect,adminOnly,getOrdersRatio)
router.get('/mostsolditeam',protect,adminOnly,getMostSoldProducts)
router.put('/products/:id',protect,adminOnly,updateProduct)




module.exports = router;