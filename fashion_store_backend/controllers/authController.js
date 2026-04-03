const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');

const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        const err = new Error('Server misconfiguration: JWT_SECRET is not set');
        err.statusCode = 500;
        throw err;
    }

    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const normalizeEmail = (value = '') => String(value).trim().toLowerCase();

// @desc  Register new user
// @route POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const { name, email, password, gender } = req.body;
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) return res.status(400).json({ message: 'Email already registered' });

        const user = await User.create({ name, email: normalizedEmail, password });

        // Create empty profile
        await Profile.create({ user: user._id, gender: gender || undefined });

        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);

        const user = await User.findOne({ email: normalizedEmail }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);
        res.json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Get current user
// @route GET /api/auth/me
const getMe = async (req, res) => {
    res.json({ user: req.user });
};

module.exports = { register, login, getMe };
