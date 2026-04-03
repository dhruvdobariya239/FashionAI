const Profile = require('../models/Profile');
const { cloudinary } = require('../config/cloudinary');

// @desc  Get user profile
// @route GET /api/profile
const getProfile = async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ user: req.user._id });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json(profile);
    } catch (error) {
        next(error);
    }
};

// @desc  Update user profile
// @route PUT /api/profile
const updateProfile = async (req, res, next) => {
    try {
        const { height, weight, gender, bodyType, age } = req.body;

        const profile = await Profile.findOneAndUpdate(
            { user: req.user._id },
            { height, weight, gender, bodyType, age },
            { new: true, upsert: true, runValidators: true }
        );

        res.json(profile);
    } catch (error) {
        next(error);
    }
};

const migrateLegacyPhotoFieldsIfNeeded = async (profile) => {
    if (!profile) return profile;

    const hasLegacy = !!(profile.photoPublicId && profile.photoUrl);
    const hasPhotosArray = Array.isArray(profile.photos) && profile.photos.length > 0;

    if (!hasLegacy || hasPhotosArray) return profile;

    profile.photos = [
        {
            url: profile.photoUrl,
            publicId: profile.photoPublicId,
            uploadedAt: profile.updatedAt || profile.createdAt || new Date(),
        },
    ];

    if (!profile.selectedPhotoPublicId) {
        profile.selectedPhotoPublicId = profile.photoPublicId;
        profile.selectedPhotoUrl = profile.photoUrl;
    }

    await profile.save();
    return profile;
};

const inferSkinToneFromCloudinary = async (publicId) => {
    // Uses Cloudinary color analysis; this is a heuristic (not ML).
    // Falls back to "unknown" if analysis isn't available.
    const fallback = { undertone: 'unknown', depth: 'unknown' };

    if (!publicId) return fallback;

    try {
        const result = await cloudinary.api.resource(publicId, { colors: true });
        const predominant = result?.predominant?.google;
        if (!Array.isArray(predominant) || predominant.length === 0) return fallback;

        // predominant is like: [ ["white", 50.7], ["blue", 27.8], ... ]
        const byName = new Map(predominant.map(([name, pct]) => [String(name).toLowerCase(), Number(pct) || 0]));
        const pct = (name) => byName.get(name) || 0;

        const warmScore = pct('orange') + pct('yellow') + pct('brown') + pct('red');
        const coolScore = pct('blue') + pct('purple') + pct('pink') + pct('cyan') + pct('green');

        let undertone = 'neutral';
        const diff = warmScore - coolScore;
        if (Math.abs(diff) < 10) undertone = 'neutral';
        else undertone = diff > 0 ? 'warm' : 'cool';

        // Depth estimate (very rough): light if lots of white, deep if lots of black/brown
        const lightness = pct('white') + pct('lightgray') + pct('gray');
        const darkness = pct('black') + pct('brown');
        let depth = 'medium';
        if (lightness - darkness > 25) depth = 'light';
        else if (darkness - lightness > 15) depth = 'deep';

        return { undertone, depth };
    } catch (e) {
        return fallback;
    }
};

// @desc  Upload profile photo to Cloudinary
// @route POST /api/profile/upload-photo
const uploadPhoto = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        let profile = await Profile.findOne({ user: req.user._id });
        if (!profile) {
            profile = await Profile.create({ user: req.user._id });
        }

        profile = await migrateLegacyPhotoFieldsIfNeeded(profile);

        const newPhoto = { url: req.file.path, publicId: req.file.filename };
        profile.photos = Array.isArray(profile.photos) ? profile.photos : [];
        profile.photos.push(newPhoto);

        // Keep legacy fields in sync with "selected" (default to latest upload)
        profile.selectedPhotoPublicId = newPhoto.publicId;
        profile.selectedPhotoUrl = newPhoto.url;
        profile.photoPublicId = newPhoto.publicId;
        profile.photoUrl = newPhoto.url;

        // Update skin tone (best-effort) based on latest upload
        const skinTone = await inferSkinToneFromCloudinary(newPhoto.publicId);
        profile.skinTone = {
            undertone: skinTone.undertone,
            depth: skinTone.depth,
            sourcePhotoPublicId: newPhoto.publicId,
            updatedAt: new Date(),
        };

        await profile.save();

        res.json({
            message: 'Photo uploaded successfully',
            photos: profile.photos,
            selectedPhotoUrl: profile.selectedPhotoUrl,
            selectedPhotoPublicId: profile.selectedPhotoPublicId,
            skinTone: profile.skinTone,
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Select one of the stored profile photos
// @route PUT /api/profile/select-photo
const selectPhoto = async (req, res, next) => {
    try {
        const { publicId } = req.body;
        if (!publicId) return res.status(400).json({ message: 'publicId is required' });

        let profile = await Profile.findOne({ user: req.user._id });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        profile = await migrateLegacyPhotoFieldsIfNeeded(profile);

        const found = (profile.photos || []).find((p) => p.publicId === publicId);
        if (!found) return res.status(404).json({ message: 'Photo not found in profile' });

        profile.selectedPhotoPublicId = found.publicId;
        profile.selectedPhotoUrl = found.url;

        // Keep legacy fields consistent with selected
        profile.photoPublicId = found.publicId;
        profile.photoUrl = found.url;

        await profile.save();

        res.json({
            message: 'Selected photo updated',
            selectedPhotoUrl: profile.selectedPhotoUrl,
            selectedPhotoPublicId: profile.selectedPhotoPublicId,
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Delete one stored profile photo
// @route DELETE /api/profile/photo/:publicId
const deletePhoto = async (req, res, next) => {
    try {
        const raw = req.params?.publicId;
        // Express v5 star params can arrive as an array of path segments.
        // Also, frontend may encode slashes as %2F.
        const publicId = decodeURIComponent(Array.isArray(raw) ? raw.join('/') : (raw || ''));
        if (!publicId) return res.status(400).json({ message: 'publicId is required' });

        let profile = await Profile.findOne({ user: req.user._id });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        profile = await migrateLegacyPhotoFieldsIfNeeded(profile);

        const before = profile.photos?.length || 0;
        profile.photos = (profile.photos || []).filter((p) => p.publicId !== publicId);
        const after = profile.photos.length;
        if (before === after) return res.status(404).json({ message: 'Photo not found in profile' });

        // Remove from Cloudinary (best-effort)
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (_) {}

        // If deleted photo was selected, select newest remaining (or clear)
        if (profile.selectedPhotoPublicId === publicId) {
            const last = profile.photos[profile.photos.length - 1];
            profile.selectedPhotoPublicId = last?.publicId || '';
            profile.selectedPhotoUrl = last?.url || '';
            profile.photoPublicId = profile.selectedPhotoPublicId;
            profile.photoUrl = profile.selectedPhotoUrl;
        }

        await profile.save();

        res.json({
            message: 'Photo deleted',
            photos: profile.photos,
            selectedPhotoUrl: profile.selectedPhotoUrl,
            selectedPhotoPublicId: profile.selectedPhotoPublicId,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, updateProfile, uploadPhoto, selectPhoto, deletePhoto };
