const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    title_image: { type: String, required: true},
    category: {type: String, required: true},
    content: { type: String, required: true },
    user_id: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);