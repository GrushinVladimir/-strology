const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  zodiacSign: {
    type: String,
  },
  dateOfBirth: {
    type: String,
  },
});

module.exports = mongoose.model('User', UserSchema);
