const mongoose = require('mongoose');  

const paymentSchema = new mongoose.Schema({  
    telegramId: { type: String, required: true, unique: true },
    chatId: { type: String, required: true },  
    amount: { type: Number, required: true },  
    currency: { type: String, required: true },  
    date: { type: Date, default: Date.now },  
    successful: { type: Boolean, default: true }  
});  

const Payment = mongoose.model('Payment', paymentSchema);  

module.exports = Payment;  