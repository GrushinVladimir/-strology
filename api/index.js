require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const connectDB = require('./db');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');
const mongoose = require('mongoose');

// Загрузка конфигурации
const token = process.env.TELEGRAM_BOT_TOKEN;  
const webAppUrl = 'https://strology.vercel.app/';

// Подключение к MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('Ошибка: переменная окружения MONGO_URI не определена.');
    process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Успешно подключено к MongoDB'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Настройка Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Подключение маршрутов
app.use('/api/users', userRoutes); // Эндпоинт для сохранения пользователей

// Создаем экземпляр бота
const bot = new TelegramBot(token);

// Устанавливаем вебхук
const PORT = process.env.PORT || 5000;
const serverUrl = process.env.VERCEL_URL || `http://localhost:${PORT}`;
bot.setWebHook(`${serverUrl}/bot${token}`).then(() => {
    console.log('Webhook установлен.');
}).catch(err => {
    console.error('Ошибка при установке вебхука:', err);
});

// Обработка сообщений от Telegram
app.post(`/bot${token}`, (req, res) => {
    console.log('Получено сообщение:', req.body); // Логируем входящие данные
    const msg = req.body;

    if (msg.message && msg.message.chat && msg.message.chat.id) {
        const chatId = msg.message.chat.id;
        
        // Обработчик команд /start
        if (msg.message.text === '/start') {
            handleStartCommand(chatId);
        } else {
            handleOtherMessages(chatId, msg.message);
        }
        
        res.sendStatus(200);
    } else {
        console.log('Неправильный формат сообщения:', req.body);
        res.sendStatus(400);
    }
});

// Логика обработки команды /start
async function handleStartCommand(chatId) {
    try {
        let existingUser = await User.findOne({ telegramId: chatId });
        if (existingUser) {
            // Если пользователь уже существует, перенаправляем его на главную страницу
            await bot.sendMessage(chatId, 'Добро пожаловать обратно! Переход на главную страницу приложения.', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Перейти на главную', web_app: { url: `${webAppUrl}/main` } }]
                    ]
                }
            });
        } else {
            // Если пользователь новый, запускаем процесс регистрации
            userStates[chatId] = { stage: 'zodiacSign' };
            await bot.sendMessage(chatId, 'Добро пожаловать! Для регистрации пройдите тест:');
        }
    } catch (error) {
        console.error('Ошибка при обработке команды /start:', error);
        bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже.');
    }
}

// Логика для обработки остальных сообщений (регистрация)
const userStates = {}; // Хранение состояния пользователя
async function handleStartCommand(chatId) {
    try {
        console.log(`Получена команда /start от пользователя: ${chatId}`);
        let existingUser = await User.findOne({ telegramId: chatId });
        if (existingUser) {
            console.log(`Пользователь ${chatId} найден, переход на main`);
            await bot.sendMessage(chatId, 'Добро пожаловать обратно! Переход на главную страницу приложения.', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Перейти на главную', web_app: { url: `${webAppUrl}/main` } }]
                    ]
                }
            });
        } else {
            console.log(`Пользователь ${chatId} не найден, начало регистрации`);
            userStates[chatId] = { stage: 'zodiacSign' };
            await bot.sendMessage(chatId, 'Добро пожаловать! Для регистрации пройдите тест:');
        }
    } catch (error) {
        console.error('Ошибка при обработке команды /start:', error);
        bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже.');
    }
}

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
as