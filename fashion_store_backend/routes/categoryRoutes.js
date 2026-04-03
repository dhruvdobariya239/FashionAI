const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.post('/', protect, adminOnly, createCategory);

module.exports = router;
