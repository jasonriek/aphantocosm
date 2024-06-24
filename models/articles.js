const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: { type: String, required: true },
    title_image: { type: String, required: true},
    category: {type: String, required: true},
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    content: { type: String, required: true },
    user_id: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', postSchema);