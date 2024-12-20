const mongoose = require('mongoose');  

const paymentSchema = new mongoose.Schema({  
    telegramId: { type: String, required: true },  
    chatId: { type: String, required: true },  
    amount: { type: Number, required: true }, // Изменено на Number  
    currency: { type: String, required: true },  
    date: { type: Date, default: Date.now }  
});  

const Payment = mongoose.model('Payment', paymentSchema);  

// Экспортируем модель   
module.exports = Payment;  