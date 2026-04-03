const crypto = require('crypto');
const { Tunnel, bin, install } = require('cloudflared');
const fs = require('fs');
const Profile = require('../models/Profile');
const { cloudinary } = require('../config/cloudinary');

const FRONTEND_PORT = parseInt(process.env.FRONTEND_PORT || '5173', 10);

// In-memory store for QR sessions
const sessions = new Map();

// Shared tunnel state
let activeTunnel = null;
let tunnelUrl = null;
let tunnelReady = null; // Promise that resolves to URL

/**
 * Opens a Cloudflare Quick Tunnel to the Vite frontend.
 * Reuses existing tunnel if still alive.
 * No account / no password page — just a free trycloudflare.com URL.
 */
const getCloudflaredUrl = async () => {
    // Reuse existing tunnel
    if (tunnelUrl && activeTunnel) return tunnelUrl;

    // Wait if already opening
    if (tunnelReady) return tunnelReady;

    tunnelReady = new Promise(async (resolve, reject) => {
        try {
            // Auto-install cloudflared binary if not present
            if (!fs.existsSync(bin)) {
                console.log('⬇️  Installing cloudflared binary…');
                await install(bin);
            }

            const tunnel = new Tunnel([
                'tunnel', '--url', `http://localhost:${FRONTEND_PORT}`,
            ]);

            tunnel.once('url', (url) => {
                activeTunnel = tunnel;
                tunnelUrl = url;
                tunnelReady = null;
                console.log('🌍 Cloudflare tunnel:', url);
                resolve(url);
            });

            tunnel.once('exit', () => {
                console.log('🔒 Cloudflare tunnel closed');
                activeTunnel = null;
                tunnelUrl = null;
                tunnelReady = null;
            });

            tunnel.start();

            // Timeout after 30 s
            setTimeout(() => {
                if (!tunnelUrl) {
                    tunnelReady = null;
                    reject(new Error('Tunnel start timed out'));
                }
            }, 30000);
        } catch (err) {
            tunnelReady = null;
            reject(err);
        }
    });

    return tunnelReady;
};

// @desc  Create a QR upload session — opens Cloudflare tunnel, returns public URL
// @route POST /api/photo/qr-session
const createQrSession = async (req, res) => {
    try {
        const url = await getCloudflaredUrl();
        const token = crypto.randomBytes(16).toString('hex');

        sessions.set(token, {
            userId: req.user._id.toString(),
            photoUrl: null,
            createdAt: Date.now(),
        });

        setTimeout(() => sessions.delete(token), 10 * 60 * 1000);

        const mobileUrl = `${url}/mobile-upload/${token}`;
        console.log('📱 QR URL:', mobileUrl);

        res.json({ token, mobileUrl });
    } catch (err) {
        console.error('Tunnel error:', err.message);
        res.status(500).json({ message: 'Could not open tunnel. Try again.' });
    }
};

// @desc  Poll: has the mobile upload completed?
// @route GET /api/photo/qr-session/:token
const pollQrSession = (req, res) => {
    const session = sessions.get(req.params.token);
    if (!session)
        return res.status(404).json({ message: 'Session expired or not found' });
    if (session.photoUrl)
        return res.json({ done: true, photoUrl: session.photoUrl });
    res.json({ done: false });
};

// @desc  Mobile uploads photo using token (no JWT — token IS the auth)
// @route POST /api/photo/qr-upload/:token
const qrUploadPhoto = async (req, res, next) => {
    try {
        const session = sessions.get(req.params.token);
        if (!session)
            return res.status(404).json({ message: 'Session expired or not found' });
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded' });

        // Ensure we keep ALL uploaded photos in the gallery.
        // (Old logic deleted previous photos; that caused the "first photo removed" issue.)
        let profile = await Profile.findOne({ user: session.userId });
        if (!profile) profile = await Profile.create({ user: session.userId });

        // Migrate legacy single-photo fields into `photos[]` if needed.
        const hasPhotosArray = Array.isArray(profile.photos) && profile.photos.length > 0;
        if (!hasPhotosArray && profile.photoUrl && profile.photoPublicId) {
            profile.photos = [
                {
                    url: profile.photoUrl,
                    publicId: profile.photoPublicId,
                    uploadedAt: profile.updatedAt || profile.createdAt || new Date(),
                },
            ];
        }
        if (!profile.selectedPhotoPublicId && profile.photoPublicId) {
            profile.selectedPhotoPublicId = profile.photoPublicId;
            profile.selectedPhotoUrl = profile.photoUrl || '';
        }

        const newPhoto = { url: req.file.path, publicId: req.file.filename, uploadedAt: new Date() };
        profile.photos = Array.isArray(profile.photos) ? profile.photos : [];
        profile.photos.push(newPhoto);

        // Set selected to the newly uploaded one.
        profile.selectedPhotoPublicId = newPhoto.publicId;
        profile.selectedPhotoUrl = newPhoto.url;

        // Keep legacy fields in sync (used by some older parts of the app).
        profile.photoPublicId = newPhoto.publicId;
        profile.photoUrl = newPhoto.url;

        // Best-effort: infer skin tone from the newest photo.
        // This is the same heuristic used in profile uploads.
        const fallback = { undertone: 'unknown', depth: 'unknown' };
        try {
            const result = await cloudinary.api.resource(newPhoto.publicId, { colors: true });
            const predominant = result?.predominant?.google;
            if (Array.isArray(predominant) && predominant.length > 0) {
                const byName = new Map(predominant.map(([name, pct]) => [String(name).toLowerCase(), Number(pct) || 0]));
                const pct = (name) => byName.get(name) || 0;

                const warmScore = pct('orange') + pct('yellow') + pct('brown') + pct('red');
                const coolScore = pct('blue') + pct('purple') + pct('pink') + pct('cyan') + pct('green');

                let undertone = 'neutral';
                const diff = warmScore - coolScore;
                if (Math.abs(diff) < 10) undertone = 'neutral';
                else undertone = diff > 0 ? 'warm' : 'cool';

                const lightness = pct('white') + pct('lightgray') + pct('gray');
                const darkness = pct('black') + pct('brown');
                let depth = 'medium';
                if (lightness - darkness > 25) depth = 'light';
                else if (darkness - lightness > 15) depth = 'deep';

                profile.skinTone = {
                    undertone,
                    depth,
                    sourcePhotoPublicId: newPhoto.publicId,
                    updatedAt: new Date(),
                };
            } else {
                profile.skinTone = fallback;
            }
        } catch (_) {
            profile.skinTone = fallback;
        }

        await profile.save();

        session.photoUrl = profile.selectedPhotoUrl;
        sessions.set(req.params.token, session);

        // Frontend refreshes `/profile` after polling, so returning the URL is enough.
        res.json({ success: true, photoUrl: profile.selectedPhotoUrl });
    } catch (error) {
        next(error);
    }
};

module.exports = { createQrSession, pollQrSession, qrUploadPhoto };