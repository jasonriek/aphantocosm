const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the category schema
const special_tag_schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    tags: [{type: String}]
});

module.exports = mongoose.model('SpecialTag', special_tag_schema);