const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for user profile photos
const profileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'fashion_store/profiles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 1200, crop: 'limit' }],
    },
});

// Storage for product images
const productStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'fashion_store/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    },
});

const uploadProfile = multer({ storage: profileStorage });
const uploadProduct = multer({ storage: productStorage });

module.exports = { cloudinary, uploadProfile, uploadProduct };
