const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    adminListOrders,
    adminGetOrder,
    adminUpdateOrderStatus,
    adminGetUsers,
    adminSendOrderEmail,
    adminSendPromoEmail,
    getDashboardAnalytics,
    getBestSellingProducts,
} = require('../controllers/adminPanelController');

router.use(protect, adminOnly);

router.get('/orders', adminListOrders);
router.get('/orders/:id', adminGetOrder);
router.patch('/orders/:id/status', adminUpdateOrderStatus);

router.get('/users', adminGetUsers);

router.get('/analytics/revenue-orders', getDashboardAnalytics);
router.get('/analytics/best-selling', getBestSellingProducts);

router.post('/emails/order', adminSendOrderEmail);
router.post('/emails/promo', adminSendPromoEmail);

module.exports = router;

