const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    zodiacSign: { type: String, required: true },
    birthTime: { type: String, required: true },
    birthDate: { type: String, required: true },
    birthPlace: { type: String, required: true },
    photoUrl: { type: String, required: false },
});

module.exports = mongoose.model('User', userSchema);