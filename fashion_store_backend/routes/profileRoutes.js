const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadPhoto, selectPhoto, deletePhoto } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfile } = require('../config/cloudinary');

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.post('/upload-photo', protect, uploadProfile.single('photo'), uploadPhoto);
router.put('/select-photo', protect, selectPhoto);
// publicId can contain slashes (folder/publicId), so capture everything
router.delete('/photo/*publicId', protect, deletePhoto);

module.exports = router;
