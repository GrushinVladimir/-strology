require('dotenv').config();  
console.log('MONGO_URI:', process.env.MONGO_URI);  
const TelegramBot = require('node-telegram-bot-api');

const dotenv = require('dotenv');
const connectDB = require('./db');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');

const mongoose = require('mongoose');  




// Загрузка конфигурации

const token = process.env.TELEGRAM_BOT_TOKEN || '7431411001:AAHx9_TODfc7VOlRfcXeab9bbiHeYgl-iNs';
const webAppUrl = 'https://strology.vercel.app/';


// Подключение к MongoDB  
const mongoURI = process.env.MONGO_URI;  

if (!mongoURI) {  
    console.error('Ошибка: переменная окружения MONGO_URI не определена.');  
    process.exit(1);  
}  
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true,serverSelectionTimeoutMS: 90000 })  
    .then(() => console.log('Успешно подключено к MongoDB'))  
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));   

// Настройка Express  
const app = express();  
app.use(cors());  
app.use(bodyParser.json());  

// Подключение маршрутов  
app.use('/api/users', userRoutes); // Эндпоинт для сохранения пользователей  

// Слушаем сообщения от Telegram  
const bot = new TelegramBot(token, { polling: true });  

// Обработка команды /start  
bot.onText(/\/start/, async (msg) => {  
    const chatId = msg.chat.id;  

    try {  
        // Проверка, существует ли пользователь  
        let user = await User.findOne({ telegramId: chatId });  

        if (user) {  
            // Если пользователь существует, перенаправляем на страницу main  
            await bot.sendMessage(chatId, 'Добро пожаловать обратно! Переход на главную страницу приложения.', {  
                reply_markup: {  
                    inline_keyboard: [  
                        [{ text: 'Перейти на главную', web_app: { url: `${webAppUrl}/main` } }]  
                    ]  
                }  
            });  
        } else {  
            // Если пользователь не зарегистрирован, начинаем процесс регистрации  
            userStates[chatId] = { stage: 'zodiacSign' };  
            await bot.sendMessage(chatId, 'Добро пожаловать! Для регистрации пройдите тест:');  
        }  
    } catch (error) {  
        console.error('Ошибка при обработке команды /start:', error);  
        bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже.');  
    }  
});  

// Логика для обработки остальных сообщений (регистрация)  
const userStates = {}; // Хранение состояния пользователя  
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Приложение Аstrology', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Перейти', web_app: {url: webAppUrl}}]
                ]
            }
        });
    } else {
        // Отправьте сообщение обратно
        bot.sendMessage(chatId, 'Привет! Как я могу помочь?');
    }
});

// Проверка существующего пользователя через REST API  
app.get('/check-user/:telegramId', async (req, res) => {  
    const { telegramId } = req.params;  
    try {  
        const user = await User.findOne({ telegramId });  
        if (user) {  
            return res.json({ exists: true, user });  
        }  
        res.json({ exists: false });  
    } catch (error) {  
        console.error('Ошибка при проверке пользователя:', error);  
        res.status(500).send('Ошибка сервера');  
    }  
});  

// Получение данных пользователя  
app.get('/api/users/:telegramId', async (req, res) => {  
    const { telegramId } = req.params;  

    try {  
        const user = await User.findOne({ telegramId }).maxTimeMS(60000);  
        if (!user) {  
            return res.status(404).json({ message: 'Пользователь не найден' });  
        }  
          // Возвращаем данные пользователя, включая знак зодиака  
          res.json({  
            name: user.name,  
            zodiacSign: user.zodiacSign,  // Включаем знак зодиака  
            birthDate: user.birthDate,  
            birthTime: user.birthTime,  
            birthPlace: user.birthPlace,  
        });  
    } catch (error) {  
        console.error('Ошибка при получении пользователя:', error);  
        res.status(500).json({ message: 'Ошибка сервера' });  
    }  
});  

// Запуск сервера  
const PORT = process.env.PORT || 5000;  
app.listen(PORT, () => {  
    const serverUrl = process.env.VERCEL_URL || `http://localhost:${PORT}`;  
    console.log(`Сервер запущен на ${serverUrl}`);  
});  