const express = require("express");
const router = express.Router();
const { createCheckoutSession } = require("../controllers/paymentController");

const { handlePaymentSuccess } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/success', protect, handlePaymentSuccess);

router.post("/create-checkout-session", createCheckoutSession);

module.exports = router;