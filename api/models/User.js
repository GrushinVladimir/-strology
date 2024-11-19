// models/User.js  
import mongoose from 'mongoose';  

const userSchema = new mongoose.Schema({  
    telegramId: { type: String, required: true, unique: true },  
    name: { type: String, required: true },  
    zodiacSign: { type: String },  
    photoUrl: { type: String },  
});  

const User = mongoose.model('User', userSchema);  

export default User; // Добавьте это, если ещё не добавлено  