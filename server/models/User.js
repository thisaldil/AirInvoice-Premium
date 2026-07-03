const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    googleId: { type: String, unique: true },
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String, required: function () { return !this.googleId } },
    picture: { type: String },
    loginCount: {
        type: Number,
        default: 0,
    },
    hasSeenGuide: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['Employee', 'Admin'],
        default: 'Employee',
    },
    token: { type: String }
});

module.exports = mongoose.model('User', userSchema);
