
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Visit = require('../models/visitModel');

const protect = async (req, res, next) => {
    try {
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET is not set' });
        }

        let token;

        const authHeader = req.headers.authorization;
        if (authHeader && typeof authHeader === 'string') {
            // Supports: "Bearer <token>" (any casing) and "<token>".
            const match = authHeader.match(/^Bearer\s+(.+)$/i);
            token = match ? match[1].trim() : authHeader.trim();
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admins only' });
    }
};



const trackVisit = async (req, res, next) => {
    try {
        await Visit.create({
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });
    } catch (error) {
        console.log('Visit tracking error');
    }

    next();
};



module.exports = { protect, adminOnly ,trackVisit};