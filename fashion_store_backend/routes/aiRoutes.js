const express = require('express');
const router = express.Router();
const { recommendSizeHandler, tryOn, matchingItems, recommendBySkinTone, getTryOnHistory, deleteTryOnHistory } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.get('/recommend-size', protect, recommendSizeHandler);
router.post('/tryon', protect, tryOn);
router.get('/tryon-history', protect, getTryOnHistory);
router.delete('/tryon-history/:id', protect, deleteTryOnHistory);
router.get('/matching-items/:productId', matchingItems);
router.get('/recommend-by-skin-tone', protect, recommendBySkinTone);

module.exports = router;
