require('dotenv').config();  
const cors = require('cors');  
const mongoURI = process.env.MONGO_URI;  
const mongoose = require('mongoose');  
const TelegramBot = require('node-telegram-bot-api');  
const express = require('express');  
const bodyParser = require('body-parser');  
const User = require('./models/User');  
const Payment = require('./models/paymentModel');  
const userRoutes = require('./routes/userRoutes');  
const testResultRoutes = require('./routes/testResultRoutes');  
const horoscopeHandler = require('./apis/horoscope');  
const token = process.env.TELEGRAM_BOT_TOKEN;  
const TOKEN = process.env.REACT_APP_SB_KEY;  
const webAppUrl = 'https://strology.vercel.app';  
const Question = require('./models/Question');  
const axios = require('axios');  

const userStates = {};  
const app = express();  
let attempts = 0;  
const maxAttempts = 5;  

const connectToDatabase = async () => {  
    if (attempts >= maxAttempts) {  
        console.error('Достигнуто максимальное количество попыток подключения к MongoDB');  
        return;  
    }  
    try {  
        await mongoose.connect(mongoURI, {  
            socketTimeoutMS: 10000,  
            serverSelectionTimeoutMS: 10000,  
            useNewUrlParser: true,  
            useUnifiedTopology: true,  
        });  
        console.log('Успешно подключено к MongoDB');  
        attempts = 0;  
    } catch (error) {  
        attempts++;  
        console.error('Ошибка подключения к MongoDB:', error);  
        setTimeout(connectToDatabase, 5000);  
    }  
};  

connectToDatabase();  
mongoose.connection.on('connected', () => {  
    console.log('Подключено к MongoDB');  
});  

mongoose.connection.on('error', (err) => {  
    console.error('Ошибка подключения к MongoDB:', err);  
});  

mongoose.connection.on('disconnected', () => {  
    console.log('Отключено от MongoDB');  
    connectToDatabase();  
});  

if (!mongoURI) {  
    console.error('Ошибка: MONGO_URI не задана в переменных окружения');  
    process.exit(1);  
}  

app.use(cors());  
app.use(bodyParser.json());  
app.use('/api/users', userRoutes);  
app.use('/api/test-results', testResultRoutes);  
app.get('/api/horoscope', horoscopeHandler);  

app.post('/api/questions/:id', async (req, res) => {  
    const { id } = req.params;  
    const { remainingQuestions } = req.body;  
    try {  
        const questionData = await Question.findOneAndUpdate(  
            { telegramId: id },  
            { remainingQuestions },  
            { new: true, upsert: true }  
        );  
        res.json(questionData);  
    } catch (error) {  
        res.status(500).json({ error: 'Не удалось сохранить количество вопросов' });  
    }  
});  

async function savePaymentToDatabase(userId, chatId, totalAmount, currency) {  
    try {  
        console.log('Тип totalAmount перед сохранением:', typeof totalAmount);  
        const amount = Number(totalAmount); // Преобразуем totalAmount в число  

        if (isNaN(amount)) {  
            throw new Error("Invalid amount: must be a number");  
        }  

        const paymentRecord = new Payment({  
            telegramId: userId,  
            chatId: chatId,  
            amount: amount,  
            currency: currency,  
            date: new Date()  
        });  

        await paymentRecord.save();  
        console.log('Платеж успешно сохранен в БД');  
    } catch (error) {  
        console.error('Ошибка при сохранении платежа в БД:', error);
        throw new Error('Ошибка при сохранении платежа'); // Передаем ошибку дальше для обработки  
    }  
}  

// Обработка вебхука от Telegram  
app.post('/api/telegram-webhook', async (req, res) => {  
    const { update } = req.body;  

    try {  
        // Проверяем, существует ли сообщение  
        if (update.message && update.message.text) {  
            const chatId = update.message.chat.id;  
            const text = update.message.text;  

            if (text === '/start') {  
                const responseText = 'Добро пожаловать! Как я могу помочь вам?';  
                
                // Отправляем приветственное сообщение пользователю  
                await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {  
                    chat_id: chatId,  
                    text: responseText,  
                });  
            } else if (text === '/pay') {  
                // ... Здесь обработка команды для платежа.  
                await handlePayment(chatId);  
            }  
            // Можно добавить больше команд здесь ...  

        } else {  
            console.error('Некорректный формат сообщения:', update);  
        }  

        res.sendStatus(200); // Отправляем статус 200 OK  
    } catch (error) {  
        console.error('Ошибка при обработке webhook:', error);  
        res.status(500).send('Ошибка сервера');  
    }  
});  

// Обработка успешного платежа  
app.post('/api/payment-success-webhook', async (req, res) => {  
    const { telegram_id, total_amount, currency } = req.body; // Важно убедиться, какие данные приходят от Telegram  

    try {  
        // Найдите пользователя в вашей базе данных по telegram_id  
        const user = await User.findOne({ telegramId: telegram_id });  
        if (!user) {  
            return res.status(404).json({ message: 'Пользователь не найден' });  
        }  

        // Сохраните платеж в базе данных  
        await savePaymentToDatabase(user.telegramId, user.chatId, total_amount, currency);  

        res.json({ success: true, message: 'Платеж успешно обработан' });  
    } catch (error) {  
        console.error('Ошибка при обработке платежа:', error);  
        res.status(500).json({ success: false, message: 'Ошибка при обработке платежа' });  
    }  
});  

// Эндпоинт для получения данных пользователя по Telegram ID  
app.get('/api/users/:telegramId', async (req, res) => {  
    try {  
        const { telegramId } = req.params;  
        const user = await User.findOne({ telegramId });  
        if (!user) {  
            return res.status(404).json({ message: 'Пользователь не найден' });  
        }  
        res.json(user);  
    } catch (error) {  
        console.error('Ошибка при получении пользователя:', error);  
        res.status(500).json({ message: 'Ошибка сервера' });  
    }  
});  

// Запуск сервера  
const PORT = process.env.PORT || 5000;  
app.listen(PORT, () => {  
    console.log(`Сервер запущен на порту ${PORT}`);  
});  