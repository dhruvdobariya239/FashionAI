const express = require('express');
const router = express.Router();
const { createQrSession, pollQrSession, qrUploadPhoto } = require('../controllers/qrUploadController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfile } = require('../config/cloudinary');

// Desktop: create a QR session (requires auth)
router.post('/qr-session', protect, createQrSession);

// Desktop: poll for completion
router.get('/qr-session/:token', protect, pollQrSession);

// Mobile: upload via token (no JWT needed — token IS the auth)
router.post('/qr-upload/:token', uploadProfile.single('photo'), qrUploadPhoto);

module.exports = router;
