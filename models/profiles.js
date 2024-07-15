const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the profile schema
const profileSchema = new Schema({
    user: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: false,
        unique: false
    }
});

module.exports = mongoose.model('Profile', profileSchema);