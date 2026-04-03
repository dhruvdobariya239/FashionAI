const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    ip: String,
    userAgent: String,
    visitedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Visit', visitSchema);