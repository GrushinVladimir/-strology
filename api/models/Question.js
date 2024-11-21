const mongoose = require('mongoose');  

const questionSchema = new mongoose.Schema({  
  telegramId: { type: String, required: true, unique: true },
  remainingQuestions: { type: Number, required: true, default: 10 } // Начальное значение  
});  

module.exports = mongoose.model('Question', questionSchema); 