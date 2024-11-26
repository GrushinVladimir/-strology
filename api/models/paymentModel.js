const mongoose = require('mongoose');  

const paymentSchema = new mongoose.Schema({  
    telegramId: { type: String, required: true },  
    chatId: { type: String, required: true },  // Убедитесь, что chatId присутствует  
    amount: { type: Number, required: true },  
    currency: { type: String, required: true },  
    date: { type: Date, default: Date.now }  
});  

const Payment = mongoose.model('Payment', paymentSchema); 