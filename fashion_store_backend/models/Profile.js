const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        height: {
            type: Number, // in cm
            min: 50,
            max: 250,
        },
        weight: {
            type: Number, // in kg
            min: 10,
            max: 300,
        },
        gender: {
            type: String,
            enum: ['men', 'women', 'children'],
        },
        bodyType: {
            type: String,
            enum: ['slim', 'athletic', 'regular', 'plus', 'petite', ''],
            default: '',
        },
        age: {
            type: Number,
            min: 0,
            max: 120,
        },
        // Backwards-compatible single photo fields (legacy)
        photoUrl: { type: String, default: '' },
        photoPublicId: { type: String, default: '' },

        // New: allow multiple stored profile photos
        photos: [
            {
                url: { type: String, required: true },
                publicId: { type: String, required: true },
                uploadedAt: { type: Date, default: Date.now },
            },
        ],

        // New: which photo user chose to use
        selectedPhotoPublicId: { type: String, default: '' },
        selectedPhotoUrl: { type: String, default: '' },

        // New: inferred from uploaded photos (v1 heuristic)
        skinTone: {
            undertone: { type: String, enum: ['warm', 'cool', 'neutral', 'unknown'], default: 'unknown' },
            depth: { type: String, enum: ['light', 'medium', 'deep', 'unknown'], default: 'unknown' },
            sourcePhotoPublicId: { type: String, default: '' },
            updatedAt: { type: Date },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
