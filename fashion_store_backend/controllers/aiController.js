const Profile = require('../models/Profile');
const Product = require('../models/Product');
const TryOnHistory = require('../models/TryOnHistory');
const { recommendSize } = require('../services/sizeService');
const { generateTryOnImages, isTryOnSupported } = require('../services/huggingfaceService');
const { getMatchingItems } = require('../services/recommendationService');

// @desc  Get smart size recommendation
// @route GET /api/ai/recommend-size?productId=xxx
const recommendSizeHandler = async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ user: req.user._id });
        if (!profile) return res.status(404).json({ message: 'Profile not found. Please complete your profile.' });

        const result = recommendSize({
            height: profile.height,
            weight: profile.weight,
            gender: profile.gender,
            bodyType: profile.bodyType,
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
};

// @desc  AI Virtual Try-On
// @route POST /api/ai/tryon
const tryOn = async (req, res, next) => {
    try {
        const { productId } = req.body;
        if (!productId) return res.status(400).json({ message: 'productId is required' });

        // Fetch user profile
        const profile = await Profile.findOne({ user: req.user._id });
        if (!profile?.photoUrl) {
            return res.status(400).json({
                message: 'Please upload your full-body photo in your Profile before using Try-On.',
                requiresPhoto: true,
            });
        }

        // Fetch product
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (!isTryOnSupported(product.subcategory)) {
            console.log(`🚫 Try-On Rejected. Subcategory: "${product.subcategory}"`);
            return res.status(400).json({ message: 'Try-On is not supported for this product type.' });
        }

        const images = await generateTryOnImages(profile.photoUrl, product);

        // Save to history (best-effort; do not fail try-on if saving fails)
        try {
            const mainImg = product.images?.find((img) => img.isMain)?.url || product.images?.[0]?.url || '';
            await TryOnHistory.create({
                user: req.user._id,
                product: product._id,
                productSnapshot: {
                    name: product.name,
                    price: product.price,
                    imageUrl: mainImg,
                    gender: product.gender,
                    subcategory: product.subcategory,
                },
                sourcePhoto: {
                    url: profile.selectedPhotoUrl || profile.photoUrl || '',
                    publicId: profile.selectedPhotoPublicId || profile.photoPublicId || '',
                },
                images: (images || [])
    .filter((x) => x?.url)
    .map((x) => ({
        url: x.url,
        pose: x.pose || '',
        publicId: x.publicId || '',
    })),
            });
        } catch (e) {
            console.warn('TryOnHistory save failed:', e?.message || e);
        }

        res.json({
            success: true,
            productName: product.name,
            images,
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Get user's try-on history
// @route GET /api/ai/tryon-history?limit=50
const getTryOnHistory = async (req, res, next) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 200);
        const items = await TryOnHistory.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        res.json(items);
    } catch (error) {
        next(error);
    }
};

// @desc  Delete a try-on history entry
// @route DELETE /api/ai/tryon-history/:id
const deleteTryOnHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const found = await TryOnHistory.findOneAndDelete({ _id: id, user: req.user._id });
        if (!found) return res.status(404).json({ message: 'History item not found' });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

// @desc  Get matching/complementary items for a product
// @route GET /api/ai/matching-items/:productId
const matchingItems = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const items = await getMatchingItems(product);
        res.json(items);
    } catch (error) {
        next(error);
    }
};

// @desc  Recommend clothes based on user's uploaded photo skin tone
// @route GET /api/ai/recommend-by-skin-tone?limit=12
const recommendBySkinTone = async (req, res, next) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || '12', 10) || 12, 48);
        const photoUrlOverrideRaw = req.query.photoUrl;
        const photoUrlOverrideStr = Array.isArray(photoUrlOverrideRaw)
            ? (photoUrlOverrideRaw[0] || '')
            : (typeof photoUrlOverrideRaw === 'string' ? photoUrlOverrideRaw : '');
        const photoUrlOverride = photoUrlOverrideStr.length ? photoUrlOverrideStr.slice(0, 4000) : '';

        const profile = await Profile.findOne({ user: req.user._id });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        const undertone = profile.skinTone?.undertone || 'unknown';
        const depth = profile.skinTone?.depth || 'unknown';

        // Backwards/forwards compatible: users may have photos stored in different places
        // depending on app version or migration state.
        const selectedFromPhotos =
            Array.isArray(profile.photos) && profile.photos.length > 0
                ? (profile.selectedPhotoPublicId
                    ? profile.photos.find((p) => p.publicId === profile.selectedPhotoPublicId)?.url
                    : undefined) || profile.photos[profile.photos.length - 1]?.url
                : undefined;

        const userPhotoUrl = profile.selectedPhotoUrl || profile.photoUrl || selectedFromPhotos || photoUrlOverride;

        // Debug: quickly understand why photo is missing
        // (safe: logs only booleans/counts, never URLs/tokens).
        if (process.env.NODE_ENV === 'development') {
            console.log('🔎 SkinTone photo fields', {
                selectedPhotoUrl: Boolean(profile.selectedPhotoUrl),
                photoUrl: Boolean(profile.photoUrl),
                photosCount: Array.isArray(profile.photos) ? profile.photos.length : 0,
                selectedPhotoPublicId: Boolean(profile.selectedPhotoPublicId),
                usingPhotosFallback: Boolean(selectedFromPhotos),
                hasUserPhotoUrl: Boolean(userPhotoUrl),
            });
        }

        // Important: photo URL is not required to rank products.
        // This endpoint ranks using `profile.skinTone.undertone/depth` (defaults to 'unknown').
        // So we should not hard-block recommendations if photo fields are missing/migrated.
        if (!userPhotoUrl && process.env.NODE_ENV === 'development') {
            console.log('🔎 SkinToneRecommendations: photo missing, continuing with undertone/depth', {
                selectedPhotoUrlPresent: Boolean(profile.selectedPhotoUrl),
                photoUrlPresent: Boolean(profile.photoUrl),
                photosCount: Array.isArray(profile.photos) ? profile.photos.length : 0,
                undertone,
                depth,
                photoUrlOverridePresent: Boolean(photoUrlOverride),
            });
        }

        const paletteByUndertone = {
            warm: ['beige', 'cream', 'ivory', 'camel', 'tan', 'brown', 'olive', 'mustard', 'gold', 'rust', 'terracotta', 'coral', 'tomato', 'orange'],
            cool: ['white', 'black', 'navy', 'blue', 'cobalt', 'emerald', 'teal', 'purple', 'lavender', 'magenta', 'pink', 'burgundy', 'silver', 'gray'],
            neutral: ['black', 'white', 'navy', 'gray', 'beige', 'camel', 'denim', 'red', 'green', 'blue'],
            unknown: ['black', 'white', 'navy', 'gray', 'beige'],
        };

        const preferredColors = paletteByUndertone[undertone] || paletteByUndertone.unknown;

        // Query pool for ranking.
        // Some profiles may store gender values that don't exactly match product schema
        // (e.g. stale/incorrect data). If filtering returns nothing, we'll fallback.
        const query = { isActive: true };
        const allowedGenders = new Set(['men', 'women', 'children']);
        const normalizedGender = profile.gender ? String(profile.gender).toLowerCase() : '';
        if (allowedGenders.has(normalizedGender)) {
            query.gender = { $in: [normalizedGender, 'unisex'] };
        }

        // Fetch a pool, then rank in-memory for better relevance.
        let pool = await Product.find(query).limit(400).lean();
        if (!pool || pool.length === 0) {
            // Fallback: don't filter by gender if it produces an empty pool.
            pool = await Product.find({ isActive: true }).limit(400).lean();
        }

        const scoreProduct = (p) => {
            const colors = (p.colors || []).map((c) => String(c).toLowerCase());
            const tags = (p.tags || []).map((t) => String(t).toLowerCase());
            const hay = new Set([...colors, ...tags]);

            let score = 0;
            for (const c of preferredColors) if (hay.has(c)) score += 3;

            // small bonus for basics that almost always work
            if (hay.has('black') || hay.has('white') || hay.has('navy')) score += 1;

            // Use rating as tie-breaker
            score += Math.min(Number(p.rating) || 0, 5) * 0.2;

            // Depth tweak (very rough)
            if (depth === 'deep' && (hay.has('white') || hay.has('cream'))) score += 0.5;
            if (depth === 'light' && (hay.has('navy') || hay.has('black'))) score += 0.5;

            return score;
        };

        const ranked = pool
            .map((p) => ({ product: p, score: scoreProduct(p) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map((x) => x.product);

        res.json({
            undertone,
            depth,
            preferredColors,
            items: ranked,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { recommendSizeHandler, tryOn, matchingItems, recommendBySkinTone, getTryOnHistory, deleteTryOnHistory };
