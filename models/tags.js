const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const counterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const tagSchema = new Schema({
    tag_id: { type: Number, unique: true },
    name: { type: String, required: true, unique: true },
});

tagSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { _id: 'tagId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            ).exec();
            this.tag_id = counter.seq;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('Tag', tagSchema);
