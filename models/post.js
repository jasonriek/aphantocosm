const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    user_id: { type: String, required: true },
    cover_image: { type: String },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);